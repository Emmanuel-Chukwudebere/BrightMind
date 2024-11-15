from datetime import datetime, timezone
from pkgutil import get_data
import re
from flask import Blueprint, g, request, jsonify, current_app
from app.models.user_model import create_user, get_user, get_user_by_id, get_user_data, store_user_data, update_last_login, update_profile, update_settings, generate_jwt, upload_profile_picture, User
from app.services.validation_service import hash_password, validate_password_strength, validate_signup_input, validate_jwt_token, verify_password, generate_password_hash
from app.services.firebase_service import auth
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from firebase_admin import auth as firebase_admin_auth
import logging
import requests
import time
from werkzeug.security import check_password_hash

# Create the auth blueprint for user authentication-related routes
auth_bp = Blueprint('auth', __name__)

# Configure rate limiting to prevent abuse
limiter = Limiter(key_func=get_remote_address)

# Configure logging for authentication operations
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log requests
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

# Retry logic for handling transient issues in auth operations
def retry_operation(func, max_retries=3, backoff_factor=2, *args, **kwargs):
    attempt = 0
    while attempt < max_retries:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {str(e)}")
            time.sleep(backoff_factor ** attempt)
            attempt += 1
    return None

# Route for user registration
@auth_bp.route('/signup', methods=['POST'])
@limiter.limit("5 per minute")  # Strict limit for registration
def signup():
    """
    Handles user registration with secure password handling.
    """
    try:
        data = request.json
        required_fields = ['email', 'password', 'name']
        
        # Validate required fields
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing required fields",
                "required_fields": required_fields
            }), 400
            
        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({"error": "Invalid email format"}), 400
            
        # Validate password strength
        is_valid, error_message = validate_password_strength(data['password'])
        if not is_valid:
            return jsonify({"error": error_message}), 400
            
        # Check if user already exists
        existing_user = retry_operation(
            auth.get_user_by_email, 
            max_retries=3, 
            email=data['email']
        )
        if existing_user:
            return jsonify({"error": "Email already registered"}), 409
            
        # Create user in Firebase
        # Note: Firebase handles password hashing internally, so we don't need to hash it ourselves
        user = auth.create_user(
            email=data['email'],
            password=data['password'],  # Firebase handles password hashing
            display_name=data['name']
        )
        
        # Store additional user data in your database
        user_data = {
            'uid': user.uid,
            'email': data['email'],
            'name': data['name'],
            'created_at': datetime.now(timezone.utc),
            'last_login': None,
            'profile_complete': False
        }
        
        # Store user_data in your database (implementation depends on your database choice)
        store_user_data(user_data)
        
        # Generate JWT token
        token = generate_jwt(user.uid)
        
        return jsonify({
            "message": "Registration successful",
            "token": token,
            "user_id": user.uid
        }), 201
        
    except Exception as e:
        logging.error(f"Error during registration: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500

# Route for Profile Picture
@auth_bp.route('/profile/picture', methods=['POST'])
def upload_profile_picture_route():
    """
    Uploads the user's profile picture and stores the URL in Firestore.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    profile_url = upload_profile_picture(user_data['user_id'], file)
    
    return jsonify({"profile_picture_url": profile_url}), 200


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """
    Handles user login and returns an access token.

    This function checks if the request contains the necessary credentials (email and password).
    It verifies the user's credentials using Firebase Authentication.
    If the credentials are valid, it generates an access token and returns it in the response.
    If the credentials are invalid, it returns an error response.

    The function also implements rate limiting to prevent brute-force attacks.

    Returns:
        JSON response:
            - If successful: {"access_token": <token>}
            - If unsuccessful: {"error": <error_message>}
    """
    try:
        # Extract email and password from the request body
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        # Try to sign in the user with Firebase Authentication
        try:
            # Get user data from Firebase Authentication
            user = auth.get_user_by_email(email)
            
            # Firebase Authentication will handle password verification internally, 
            # no need to manually check hash. So, we just proceed if user is found.

            # Prepare user data in a serializable format
            user = {
                'uid': user.uid,
                'email': user.email,
            }

            # Generate a JWT token (you may adjust this to suit your app's logic)
            access_token = generate_jwt(user)

            return jsonify({"access_token": access_token}), 200

        except auth.UserNotFoundError:
            # Raised when the user is not found in Firebase Authentication
            current_app.logger.error(f"User not found: {email}")
            return jsonify({"error": "Invalid email or password."}), 401
        except Exception as e:
            # Handle other Firebase related errors
            current_app.logger.error(f"Login failed: {str(e)}")
            return jsonify({"error": "An unexpected error occurred."}), 500

    except ValueError as e:
        # Handle ValueError exceptions (e.g., invalid email or password format)
        current_app.logger.error(f"Login failed: {str(e)}")
        return jsonify({"error": "Invalid email or password."}), 400

    except Exception as e:
        current_app.logger.error(f"Login failed: {str(e)}")
        error_message = "An unexpected error occurred while processing your login request. Please try again later."
        return jsonify({"error": error_message}), 500
    
# Route for password reset request
@auth_bp.route('/password/reset-request', methods=['POST'])
@limiter.limit("3 per minute")  # Strict limit for password reset requests
def request_password_reset():
    """
    Handles password reset request by sending reset email.
    """
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        # Send password reset email through Firebase
        auth.send_password_reset_email(email)
        
        return jsonify({
            "message": "Password reset email sent if account exists"
        }), 200
        
    except Exception as e:
        logging.error(f"Error in password reset request: {str(e)}")
        # Return success even if email doesn't exist (security best practice)
        return jsonify({
            "message": "Password reset email sent if account exists"
        }), 200

# Route for password change (when user is logged in)
@auth_bp.route('/password/change', methods=['POST'])
def change_password():
    """
    Handles password change for authenticated users.
    """
    try:
        # Get the ID token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No valid authorization token"}), 401
            
        id_token = auth_header.split('Bearer ')[1]
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        
        data = request.json
        new_password = data.get('new_password')
        
        if not new_password:
            return jsonify({"error": "New password is required"}), 400
            
        # Validate new password strength
        is_valid, error_message = validate_password_strength(new_password)
        if not is_valid:
            return jsonify({"error": error_message}), 400
            
        # Update password in Firebase
        auth.update_user(user_id, password=new_password)
        
        return jsonify({
            "message": "Password updated successfully"
        }), 200
        
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid authorization token"}), 401
    except Exception as e:
        logging.error(f"Error in password change: {str(e)}")
        return jsonify({"error": "Password change failed"}), 500

# Route for fetching or updating user profile
@auth_bp.route('/profile/<user_id>', methods=['GET', 'PUT'])
@limiter.limit("30 per minute")
def profile(user_id):
    """
    Handles fetching or updating the user profile.
    Attempts to fetch user first by ID, then by email if ID lookup fails.
    
    Returns:
    - 200: Profile fetched or updated successfully.
    - 401: Unauthorized access.
    - 404: User not found with either method
    - 500: Internal server error.
    """
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token.split(' ')[1]

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/profile/{user_id}')

    if request.method == 'GET':
        try:
            user_data = None
            error_messages = []

            # First attempt: Try getting user by ID
            try:
                user_data = retry_operation(get_user_by_id, max_retries=2, user_id=user_id)
                logging.info(f"Successfully fetched user by ID: {user_id}")
            except Exception as e:
                error_messages.append(f"ID lookup failed: {str(e)}")
                logging.warning(f"Failed to fetch user by ID {user_id}, attempting email lookup")

            # Second attempt: If ID lookup failed, try getting user by email
            # Only attempt this if the input looks like an email
            if user_data is None and '@' in user_id:
                try:
                    user_data = retry_operation(get_user, max_retries=2, email=user_id)
                    logging.info(f"Successfully fetched user by email: {user_id}")
                except Exception as e:
                    error_messages.append(f"Email lookup failed: {str(e)}")
                    logging.warning(f"Failed to fetch user by email {user_id}")

            # If both attempts failed, return 404
            if user_data is None:
                error_detail = " | ".join(error_messages)
                logging.error(f"User lookup failed completely for {user_id}: {error_detail}")
                return jsonify({
                    "error": "User not found",
                    "detail": "Failed to fetch user profile with both ID and email methods",
                    "attempts": error_messages
                }), 404

            return jsonify(user_data), 200

        except Exception as e:
            logging.error(f"Unexpected error in profile route for user {user_id}: {str(e)}")
            return jsonify({
                "error": "Internal server error",
                "detail": str(e)
            }), 500

    elif request.method == 'PUT':
        data = request.json
        try:
            # Update profile using 'uid'
            retry_operation(update_profile, max_retries=3, user_id=user_id, profile_data=data)
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            logging.error(f"Error updating profile for user {user_id}: {str(e)}")
            return jsonify({
                "error": "Failed to update profile",
                "detail": str(e)
            }), 500

# Route for fetching or updating user settings
@auth_bp.route('/settings/<user_id>', methods=['GET', 'PUT'])
@limiter.limit("30 per minute")  # Higher limit for settings-related requests
def settings(user_id):
    """
    Handles fetching or updating the user settings.
    
    Returns:
    - 200: Settings fetched or updated successfully.
    - 401: Unauthorized access.
    - 500: Internal server error.
    """
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token.split(' ')[1]  # Remove 'Bearer ' prefix

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/settings/{user_id}')

    if request.method == 'GET':
        try:
            user_data = retry_operation(get_user, max_retries=3, user_id=user_id)
            return jsonify(user_data.get('settings', {})), 200
        except Exception as e:
            logging.error(f"Error fetching settings for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to fetch settings"}), 500

    elif request.method == 'PUT':
        data = request.json
        try:
            retry_operation(update_settings, max_retries=3, user_id=user_id, settings_data=data)
            return jsonify({"message": "Settings updated successfully"}), 200
        except Exception as e:
            logging.error(f"Error updating settings for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to update settings"}), 500
from flask import Blueprint, request, jsonify
from app.models.user_model import create_user, get_user, update_profile, update_settings, generate_jwt, upload_profile_picture
from app.services.validation_service import validate_signup_input, validate_jwt_token
from app.services.firebase_service import auth
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import time

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

# Route for user signup
@auth_bp.route('/signup', methods=['POST'])
@limiter.limit("5 per minute")  # Limit signups to 5 requests per minute
def signup():
    """
    Handles user signup by validating input and creating a new user in Firebase.
    
    Returns:
    - 201: User created successfully.
    - 400: Invalid input or password requirements not met.
    - 409: Email already exists.
    - 500: Internal server error.
    """
    data = request.json

    # Validate input data (email and password)
    is_valid, message = validate_signup_input(data)
    if not is_valid:
        return jsonify({"error": message}), 400

    log_request('/signup')

    try:
        user_id = retry_operation(create_user, max_retries=3, email=data['email'], password=data['password'])
        if user_id:
            token = generate_jwt(user_id)
            return jsonify({"user_id": user_id, "token": token}), 201
        else:
            return jsonify({"error": "Failed to create user"}), 500
    except auth.EmailAlreadyExistsError:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        logging.error(f"Unexpected error during signup: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

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


# Route for user login
@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")  # Limit login attempts to prevent brute force attacks
def login():
    """
    Handles user login by validating credentials and generating a JWT.
    
    Returns:
    - 200: Login successful with a JWT token.
    - 401: Invalid credentials.
    - 500: Internal server error.
    """
    data = request.json

    log_request('/login')

    try:
        user = retry_operation(auth.get_user_by_email, max_retries=3, email=data['email'])
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Verify password here (add password verification logic in real scenario)
        token = generate_jwt(user.uid)
        return jsonify({"token": token}), 200
    except auth.UserNotFoundError:
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Route for fetching or updating user profile
@auth_bp.route('/profile/<user_id>', methods=['GET', 'PUT'])
@limiter.limit("30 per minute")  # Higher limit for profile-related requests
def profile(user_id):
    """
    Handles fetching or updating the user profile.
    
    Returns:
    - 200: Profile fetched or updated successfully.
    - 401: Unauthorized access.
    - 500: Internal server error.
    """
    token = request.headers.get('Authorization')

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/profile/{user_id}')

    if request.method == 'GET':
        try:
            user_data = retry_operation(get_user, max_retries=3, user_id=user_id)
            return jsonify(user_data), 200
        except Exception as e:
            logging.error(f"Error fetching profile for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to fetch profile"}), 500

    elif request.method == 'PUT':
        data = request.json
        try:
            retry_operation(update_profile, max_retries=3, user_id=user_id, profile_data=data)
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            logging.error(f"Error updating profile for user {user_id}: {str(e)}")
            return jsonify({"error": "Failed to update profile"}), 500

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
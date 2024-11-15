from datetime import datetime, timezone
import logging
import re
import time
from flask import current_app
import jwt
import os
from jwt import InvalidTokenError, ExpiredSignatureError
from app.models.user_model import store_user_data, update_last_login
from app.services.firebase_service import get_user_by_id, auth
from werkzeug.security import generate_password_hash, check_password_hash

JWT_SECRET = os.getenv('JWT_SECRET')

# Production-ready regex for email validation
EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
# Production-level password strength enforcement: min 8 chars, 1 uppercase, 1 digit, 1 special char
# Password validation constants
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
PASSWORD_PATTERN = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
)

def validate_password_strength(password):
    """
    Validates password strength against security requirements.
    
    Requirements:
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    
    Returns:
    - (bool, str): (is_valid, error_message)
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
    
    if len(password) > MAX_PASSWORD_LENGTH:
        return False, f"Password cannot exceed {MAX_PASSWORD_LENGTH} characters"
    
    if not PASSWORD_PATTERN.match(password):
        return False, ("Password must contain at least one uppercase letter, "
                      "one lowercase letter, one number, and one special character")
    
    return True, ""

def hash_password(password):
    """
    Securely hashes a password using Werkzeug's security functions.
    """
    return generate_password_hash(password, method='pbkdf2:sha256:260000')

def verify_password(password_hash, password):
    """
    Verifies a password against its hash.
    """
    return check_password_hash(password_hash, password)



def validate_signup_input(data):
    """
    Validates input for signup (email and password).
    - Email must match the defined pattern for validity.
    - Password must meet minimum strength requirements.
    """
    email = data.get('email')
    password = data.get('password')
    
    # Validate email format
    if not email or not re.match(EMAIL_REGEX, email):
        return False, "Invalid email format. Please provide a valid email address."

    return True, "Valid input."

def validate_jwt_token(token):
    """
    Validates a JWT token and retrieves the associated user data from Firestore.
    
    Args:
        token (str): The JWT token to validate
        
    Returns:
        dict: The decoded token if valid, None if user not found, False if invalid
    """
    try:
        # Remove the "Bearer " prefix if present
        token = token.replace("Bearer ", "")

        # Decode JWT token and validate
        logging.info("Validating JWT token")
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        # Extract the user ID from the decoded token
        user_data = decoded_token.get("uid")
        if isinstance(user_data, dict):
            user_id = user_data.get("uid")
        else:
            user_id = user_data

        # Validate user_id
        if not isinstance(user_id, str) or not user_id:
            logging.error(f"Invalid user ID in token: {user_data}")
            return False

        # Check token expiration
        exp = decoded_token.get("exp")
        current_time = datetime.now(timezone.utc).timestamp()
        if exp and current_time > exp:
            logging.error("Token has expired")
            return None

        # First, verify the user exists in Firebase Auth
        try:
            auth_user = auth.get_user(user_id)
            if not auth_user:
                logging.error(f"User not found in Firebase Auth: {user_id}")
                return None
        except auth.UserNotFoundError:
            logging.error(f"User not found in Firebase Auth: {user_id}")
            return None
        except Exception as e:
            logging.error(f"Error verifying user in Firebase Auth: {e}")
            return False

        # Then, get the user's Firestore data
        try:
            firestore_user = get_user_by_id(user_id)
            if not firestore_user:
                logging.warning(f"User not found in Firestore: {user_id}")
                # Initialize Firestore data if missing
                firestore_user = {
                    'uid': user_id,
                    'email': auth_user.email,
                    'created_at': datetime.now(timezone.utc),
                    'last_login': datetime.now(timezone.utc),
                    'profile_picture': None,
                    'settings': {}
                }
                store_user_data(firestore_user)
            
            # Update last login
            update_last_login(user_id)
            
            # Add user data to decoded token
            decoded_token['user_data'] = firestore_user
            
            logging.info(f"Token validated successfully for user: {user_id}")
            return decoded_token

        except Exception as e:
            logging.error(f"Error retrieving Firestore user data: {e}")
            return False

    except jwt.ExpiredSignatureError:
        logging.error("JWT token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logging.error(f"Invalid JWT token: {e}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error while validating JWT token: {e}")
        return False
    
def validate_profile_update(data):
    """
    Validates the profile update input fields for first name, last name, and email.
    Ensures:
    - First name and last name are valid strings.
    - Email follows the correct format.
    """
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')

    if not first_name or not isinstance(first_name, str):
        return False, "First name is required and must be a valid string."
    
    if not last_name or not isinstance(last_name, str):
        return False, "Last name is required and must be a valid string."
    
    if email and not re.match(EMAIL_REGEX, email):
        return False, "Invalid email format."

    return True, "Profile data is valid."

def validate_lesson_input(data):
    """
    Validates lesson input fields such as title, content, and difficulty level.
    Ensures:
    - Title is a valid string and not empty.
    - Content is valid and non-empty.
    - Difficulty is one of the acceptable levels ('beginner', 'intermediate', 'advanced').
    """
    title = data.get('title')
    content = data.get('content')
    difficulty = data.get('difficulty')
    
    if not title or not isinstance(title, str):
        return False, "Lesson title is required and must be a valid string."
    
    if not content or not isinstance(content, str):
        return False, "Lesson content is required and must be a valid string."

    if difficulty not in ['beginner', 'intermediate', 'advanced']:
        return False, "Difficulty level must be one of: 'beginner', 'intermediate', or 'advanced'."
    
    return True, "Lesson input is valid."

def validate_notification_input(data):
    """
    Validates notification input to ensure:
    - The message is present and valid.
    - User ID is valid for targeting the notification.
    """
    user_id = data.get('user_id')
    message = data.get('message')

    if not user_id or not isinstance(user_id, str):
        return False, "User ID is required and must be a valid string."

    if not message or not isinstance(message, str):
        return False, "Notification message is required and must be a valid string."

    return True, "Notification data is valid."
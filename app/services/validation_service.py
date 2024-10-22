import re
import jwt
import os
from jwt import InvalidTokenError, ExpiredSignatureError
from app.services.firebase_service import get_user_by_id

JWT_SECRET = os.getenv('JWT_SECRET')

# Production-ready regex for email validation
EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
# Production-level password strength enforcement: min 8 chars, 1 uppercase, 1 digit, 1 special char
PASSWORD_REGEX = r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'

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

    # Validate password strength
    if not password or not re.match(PASSWORD_REGEX, password):
        return False, "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
    
    return True, "Valid input."

def validate_jwt_token(token):
    """
    Validates a JWT token for authenticity and checks its expiration status.
    """
    try:
        # Decode JWT token and validate
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = get_user_by_id(decoded_token["user_id"])

        if user:
            return decoded_token
        return None
    except InvalidTokenError:
        return None
    except ExpiredSignatureError:
        return None

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
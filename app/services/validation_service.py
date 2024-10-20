import jwt
import os
from jwt import InvalidTokenError
from app.services.firebase_service import get_user_by_id

JWT_SECRET = os.getenv('JWT_SECRET')

def validate_signup_input(data):
    """
    Validates input for signup (email and password).
    """
    if not data.get('email') or not data.get('password'):
        return False
    return True

def validate_jwt_token(token):
    """
    Validates a JWT token for authenticity.
    """
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = get_user_by_id(decoded_token["user_id"])
        if user:
            return decoded_token
        return None
    except InvalidTokenError:
        return None

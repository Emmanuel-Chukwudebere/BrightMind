# app/routes/home_routes.py
from flask import Blueprint, jsonify, request
from app.services.lesson_service import get_recent_lessons
from app.services.validation_service import validate_jwt_token
import logging
from flask_limiter.util import get_remote_address

home_bp = Blueprint('home', __name__)

# Configure logging for authentication operations
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log incoming requests for debugging and tracing
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

@home_bp.route('/recent-lessons', methods=['GET'])
def recent_lessons_route():
    """
    Retrieves the three most recent lessons accessed or completed by the user.
    
    Headers:
        - Authorization: Bearer token for user authentication.
    
    Returns:
        JSON response with the three most recent lessons or an error message.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    log_request('/recent-lessons')
    recent_lessons = get_recent_lessons(user_data['user_id'])
    return jsonify({"recent_lessons": recent_lessons}), 200

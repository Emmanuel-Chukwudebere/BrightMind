# app/routes/recommendation_routes.py
from flask import Blueprint, jsonify, request
from app.services.recommendation_service import get_recommended_lessons
from app.services.validation_service import validate_jwt_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging

# Create the lesson blueprint for all lesson-related routes
lesson_bp = Blueprint('lessons', __name__)


limiter = Limiter(key_func=get_remote_address)

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log incoming requests
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

recommendation_bp = Blueprint('recommendation', __name__)

@recommendation_bp.route('/recommendations', methods=['GET'])
def recommendations_route():
    """
    Provides recommended lessons based on screen context (home or downloaded).
    
    Headers:
        - Authorization: Bearer token for user authentication.
    Query Parameters:
        - recent_topics (list): List of recently viewed topic IDs.
        - screen (str): The screen for which to show recommendations ("home" or "downloaded").
    
    Returns:
        JSON response with recommended lessons or an error message.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    recent_topic_ids = request.args.getlist('recent_topics')
    screen = request.args.get('screen', 'home')  # Defaults to 'home' if not specified

    log_request('/recommendations')
    recommendations = get_recommended_lessons(user_data['user_id'], recent_topic_ids, screen)
    return jsonify({"recommendations": recommendations}), 200
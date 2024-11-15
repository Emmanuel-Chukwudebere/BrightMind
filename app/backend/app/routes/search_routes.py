# app/routes/search_routes.py
from flask import Blueprint, jsonify, request
from app.services.search_service import search_topics
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

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['GET'])
def search_route():
    """
    Searches for topics across different categories based on user input.
    
    Headers:
        - Authorization: Bearer token for user authentication.
    Query Parameters:
        - query (str): The search term.
        - category (str): The search category (e.g., "all", "in_progress", "completed", "downloaded").
    
    Returns:
        JSON response with search results or an error message.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    query = request.args.get('query', '').strip()
    category = request.args.get('category', 'all')
    
    log_request('/search')
    results = search_topics(user_data['user_id'], query, category)
    return jsonify({"results": results}), 200

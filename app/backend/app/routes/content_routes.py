# app/routes/content_routes.py
from flask import Blueprint, jsonify, request
from app.models.content_model import generate_content, fetch_content
from app.services.validation_service import validate_jwt_token
import logging
from flask_limiter.util import get_remote_address

# Configure logging for authentication operations
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log incoming requests for debugging and tracing
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

content_bp = Blueprint('content', __name__)

@content_bp.route('/generate', methods=['POST'])
def generate_route():
    """
    Endpoint to generate content for a selected topic and level.
    
    Headers:
        - Authorization: Bearer token for user authentication.
    Body:
        - topic (str): Topic name.
        - level (str): Difficulty level.

    Returns:
        Response JSON with generated content or error message.
    """
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized access"}), 401

    # Extract the token from "Bearer <token>"
    token_str = auth_header.split(' ')[1]

    # Validate and decode the JWT token
    decoded_token = validate_jwt_token(token_str)
    if not decoded_token:
        return jsonify({"error": "Unauthorized access"}), 401

    user_id = decoded_token.get('uid') if decoded_token else None
    if not user_id:
        return jsonify({"error": "Unauthorized - user ID missing"}), 401

    # print("Decoded token contents:", decoded_token)  # This helps debug JWT payload contents

    data = request.json
    topic = data.get('topic')
    level = data.get('level')
    
    log_request('/generate')
    content = generate_content(user_id, topic, level)
    return jsonify(content), 200

@content_bp.route('/download/<topic>', methods=['GET'])
def download_route(topic):
    """
    Endpoint to download content for offline access.
    
    Headers:
        - Authorization: Bearer token for user authentication.

    Returns:
        Response JSON with content data or error message if not found.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    log_request(f'/download/{topic}')
    content = fetch_content(topic)
    if content:
        return jsonify(content), 200
    return jsonify({"error": "Content not found"}), 404
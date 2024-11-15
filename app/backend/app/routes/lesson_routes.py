from flask import Blueprint, request, jsonify
from app.services.validation_service import validate_jwt_token, validate_lesson_input
from app.models.lesson_model import fetch_all_lessons, fetch_lesson_by_id, mark_lesson_complete, download_lesson, delete_downloaded_lesson, fetch_progress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import time

# Create the lesson blueprint for all lesson-related routes
lesson_bp = Blueprint('lessons', __name__)

# Configure rate limiting to avoid abuse of lesson requests
# limiter = Limiter(
    # key_func=get_remote_address,
    # app=lesson_bp,
    # default_limits=["100 per minute"],  # General rate limit across all lesson routes
    # strategy="moving-window"
# )

limiter = Limiter(key_func=get_remote_address)

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log incoming requests
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

# Helper function to retry operations in case of failures (with exponential backoff)
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

# Route to fetch all lessons for the user
@lesson_bp.route('/', methods=['GET'])
@limiter.limit("20 per minute")  # Apply rate limiting to prevent excessive requests
def get_lessons():
    """
    Fetch all available lessons for the user.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    Returns:
    - 200: List of lessons for the user.
    - 401: Unauthorized if JWT token is invalid.
    - 500: Internal server error for unexpected issues.
    """
    auth_header = request.headers.get('Authorization')
    
    # Validate JWT token before processing the request
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized access"}), 401
        
    # Extract the token from "Bearer <token>"
    token_str = auth_header.split(' ')[1]
    
    # Validate and decode the JWT token
    decoded_token = validate_jwt_token(token_str)
    if not decoded_token:
        return jsonify({"error": "Unauthorized access"}), 401
    
    # Get user_id from the nested structure
    user_id = decoded_token.get('user_data', {}).get('user_id')
    
    if not user_id:
        return jsonify({"error": "Invalid token format"}), 401
    
    log_request('/lessons')
    
    # Retry fetching lessons in case of database failures
    lessons = retry_operation(
        fetch_all_lessons, 
        max_retries=3, 
        backoff_factor=2, 
        user_id=user_id
    )
    
    if lessons:
        return jsonify({"lessons": lessons}), 200
    return jsonify({"error": "Failed to retrieve lessons. Please try again later."}), 500

@lesson_bp.route('/<lesson_id>', methods=['GET'])
@limiter.limit("10 per minute")
def get_lesson(lesson_id):
    """
    Fetch a specific lesson by lesson_id.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    URL Params:
    - lesson_id: The ID of the lesson to fetch.
    
    Returns:
    - 200: The requested lesson.
    - 401: Unauthorized if JWT token is invalid.
    - 404: Lesson not found.
    - 500: Internal server error for unexpected issues.
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return jsonify({"error": "No authorization header"}), 401

    # Extract token from "Bearer <token>" format
    token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
    
    # Validate and decode the token
    decoded_token = validate_jwt_token(token)
    if not decoded_token:
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/lessons/{lesson_id}')

    try:
        # Use decoded_token to get user_id
        lesson = retry_operation(
            fetch_lesson_by_id, 
            max_retries=3, 
            backoff_factor=2, 
            user_id=decoded_token['user_id'],
            lesson_id=lesson_id
        )
        
        if lesson:
            return jsonify({"lesson": lesson}), 200
        return jsonify({"error": "Lesson not found."}), 404
            
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# Route to mark a lesson as complete
@lesson_bp.route('/<lesson_id>/complete', methods=['POST'])
@limiter.limit("10 per minute")  # Limit lesson completion requests
def complete_lesson(lesson_id):
    """
    Mark a lesson as completed by the user.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    URL Params:
    - lesson_id: The ID of the lesson to mark as complete.
    
    Returns:
    - 200: Confirmation of lesson completion.
    - 401: Unauthorized if JWT token is invalid.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/lessons/{lesson_id}/complete')

    # Retry marking the lesson as complete in case of failures
    result = retry_operation(mark_lesson_complete, max_retries=3, backoff_factor=2, user_id=token['user_id'], lesson_id=lesson_id)
    if result:
        return jsonify({"message": "Lesson marked as complete."}), 200
    return jsonify({"error": "Failed to mark lesson as complete. Please try again later."}), 500

# Route to download a lesson for offline use
@lesson_bp.route('/download-lesson/<lesson_id>', methods=['POST'])
@limiter.limit("5 per minute")  # Limit download requests
def download_lesson_route(lesson_id):
    """
    Download a lesson for offline use.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    URL Params:
    - lesson_id: The ID of the lesson to download.
    
    Returns:
    - 200: Confirmation of lesson download.
    - 401: Unauthorized if JWT token is invalid.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/lessons/download-lesson/{lesson_id}')

    # Retry lesson download operation in case of failures
    result = retry_operation(download_lesson, max_retries=3, backoff_factor=2, user_id=token['user_id'], lesson_id=lesson_id)
    if result:
        return jsonify({"message": "Lesson downloaded successfully."}), 200
    return jsonify({"error": "Failed to download lesson. Please try again later."}), 500

# Route to delete a previously downloaded lesson
@lesson_bp.route('/delete-downloaded-lesson/<lesson_id>', methods=['DELETE'])
@limiter.limit("5 per minute")  # Limit deletion requests
def delete_downloaded_lesson_route(lesson_id):
    """
    Delete a previously downloaded lesson from the user's local storage.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    URL Params:
    - lesson_id: The ID of the lesson to delete.
    
    Returns:
    - 200: Confirmation of lesson deletion.
    - 401: Unauthorized if JWT token is invalid.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/lessons/delete-downloaded-lesson/{lesson_id}')

    # Retry deletion of the downloaded lesson in case of failures
    result = retry_operation(delete_downloaded_lesson, max_retries=3, backoff_factor=2, user_id=token['user_id'], lesson_id=lesson_id)
    if result:
        return jsonify({"message": "Downloaded lesson deleted successfully."}), 200
    return jsonify({"error": "Failed to delete downloaded lesson. Please try again later."}), 500

# Route to fetch user progress across all lessons
@lesson_bp.route('/progress/<user_id>', methods=['GET'])
@limiter.limit("15 per minute")  # Limit progress fetch requests
def get_user_progress(user_id):
    """
    Fetch the user's progress across all lessons.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    URL Params:
    - user_id: The ID of the user to fetch progress for.
    
    Returns:
    - 200: User's lesson progress data.
    - 401: Unauthorized if JWT token is invalid.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')

    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request(f'/lessons/progress/{user_id}')

    # Retry fetching user progress in case of failures
    progress = retry_operation(fetch_progress, max_retries=3, backoff_factor=2, user_id=user_id)
    if progress:
        return jsonify({"progress": progress}), 200
    return jsonify({"error": "Failed to fetch user progress. Please try again later."}), 500
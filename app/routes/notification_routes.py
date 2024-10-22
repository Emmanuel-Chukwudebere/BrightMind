from flask import Blueprint, request, jsonify
from app.services.notification_service import send_fcm_notification
from app.services.validation_service import validate_jwt_token, validate_notification_input
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import time

# Create the notification blueprint for notification-related routes
notification_bp = Blueprint('notifications', __name__)

# Configure rate limiting to manage notification requests
limiter = Limiter(
    key_func=get_remote_address,
    app=notification_bp,
    default_limits=["50 per minute"],  # General limit for notification routes
    strategy="moving-window"
)

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log incoming requests for monitoring
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

# Helper function to retry notification sending in case of failures (with exponential backoff)
def retry_operation(func, max_retries=3, backoff_factor=2, *args, **kwargs):
    attempt = 0
    while attempt < max_retries:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {str(e)}")
            time.sleep(backoff_factor ** attempt)  # Exponential backoff
            attempt += 1
    return None

# Route to send a notification to a specific user
@notification_bp.route('/send-notification', methods=['POST'])
@limiter.limit("10 per minute")  # Limit notification sending requests
def send_notification_route():
    """
    Send a notification to a specific user via Firebase Cloud Messaging (FCM).
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    Body:
    - user_id: The ID of the user to send the notification to.
    - message: The notification message to send.
    
    Returns:
    - 200: Confirmation that the notification was sent.
    - 401: Unauthorized if JWT token is invalid.
    - 400: Bad request if input data is missing or malformed.
    - 503: Service unavailable if FCM service fails after retries.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')
    data = request.json

    # Validate JWT token to ensure authorized access
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request('/send-notification')

    # Validate the input data (user_id, message)
    is_valid, message = validate_notification_input(data)
    if not is_valid:
        return jsonify({"error": message}), 400

    user_id = data.get('user_id')
    notification_message = data.get('message')

    # Retry sending notification in case of temporary failures
    result = retry_operation(send_fcm_notification, max_retries=3, backoff_factor=2, user_id=user_id, message=notification_message)
    if result:
        return jsonify({"message": "Notification sent successfully."}), 200
    return jsonify({"error": "Notification service unavailable. Please try again later."}), 503
from flask import Blueprint, request, jsonify
from app.services.notification_service import send_fcm_notification, update_fcm_token
from app.services.validation_service import validate_jwt_token, validate_notification_input
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.services.firebase_service import db
import logging
import time

# Create the notification blueprint for notification-related routes
notification_bp = Blueprint('notifications', __name__)

# Configure rate limiting to prevent abuse
limiter = Limiter(key_func=get_remote_address)

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
@limiter.limit("5 per minute")  # Example: 5 notifications per user per minute
def send_notification_route():
    """
    Sends a notification but ensures rate limiting to prevent abuse.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    
    if not user_data:
        return jsonify({"error": "Unauthorized access"}), 401

    data = request.json
    user_id = data.get('user_id')
    message_title = data.get('title')
    message_body = data.get('body')

    if not user_id or not message_title or not message_body:
        return jsonify({"error": "user_id, title, and body are required"}), 400

    # Fetch the user's FCM token
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()
    fcm_token = user_data.get('fcm_token')

    if not fcm_token:
        return jsonify({"error": "User has no FCM token"}), 404

    result = send_fcm_notification(fcm_token, message_title, message_body)
    
    return jsonify(result), 200

@notification_bp.route('/subscribe', methods=['POST'])
def subscribe_to_notifications():
    """
    Allows a user to subscribe to specific notifications by storing or updating their FCM token.

    Request JSON:
        fcm_token (str): The user's FCM token.
        subscriptions (list): A list of notification types the user subscribes to.

    Returns:
        JSON response confirming the subscription.
    """
    token = request.headers.get('Authorization')  # Get the user's JWT token for validation
    user_data = validate_jwt_token(token)  # Validate token
    
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401 # If token is invalid, return unauthorized

    # Get the FCM token and subscriptions from the request JSON body
    fcm_token = request.json.get('fcm_token')
    subscriptions = request.json.get('subscriptions')  # e.g., ['quiz', 'streak']

    # Get the FCM token and subscriptions from the request JSON body
    if not fcm_token or not subscriptions:
        return jsonify({"error": "FCM token and subscriptions are required"}), 400

    # Update the user's FCM token and subscription preferences in Firestore
    user_id = user_data['user_id']
    update_fcm_token(user_id, fcm_token) # Update the FCM token

    # Store the user's notification preferences
    user_ref = db.collection('users').document(user_id)
    user_ref.update({
        'subscriptions': subscriptions # Update the user's subscribed notification types
    })
    
    return jsonify({"message": "Subscribed to notifications successfully"}), 200 # Return success message
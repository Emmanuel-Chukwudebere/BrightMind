from flask import Blueprint, request, jsonify
from app.services.notification_service import send_fcm_notification
from app.services.validation_service import validate_jwt_token

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/send-notification', methods=['POST'])
def send_notification_route():
    token = request.headers.get('Authorization')
    user_id = request.json.get('user_id')
    message = request.json.get('message')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        send_fcm_notification(user_id, message)
        return jsonify({"message": "Notification sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

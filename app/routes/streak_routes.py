from flask import Blueprint, request, jsonify
from app.models.streak_model import update_streak
from app.services.validation_service import validate_jwt_token

streak_bp = Blueprint('streak', __name__)

@streak_bp.route('/track', methods=['GET'])
def track_streak_route():
    """
    Tracks the user's streak and returns a motivational message.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    streak, message = update_streak(user_data['user_id'])
    return jsonify({"streak": streak, "message": message}), 200

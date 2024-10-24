from flask import Blueprint, request, jsonify
from app.models.quiz_model import generate_quiz, fetch_quiz, submit_quiz, reset_quiz
from app.services.validation_service import validate_jwt_token

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/generate/<lesson_id>', methods=['POST'])
def generate_quiz_route(lesson_id):
    """
    Generates a quiz for the user based on the lesson ID.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401
    
    quiz_id = generate_quiz(user_data['user_id'], lesson_id)
    if quiz_id:
        return jsonify({"quiz_id": quiz_id}), 201
    return jsonify({"error": "Lesson not found"}), 404

@quiz_bp.route('/<quiz_id>', methods=['GET'])
def fetch_quiz_route(quiz_id):
    """
    Fetches a quiz for the user.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    quiz = fetch_quiz(user_data['user_id'], quiz_id)
    if quiz:
        return jsonify({"quiz": quiz}), 200
    return jsonify({"error": "Quiz not found"}), 404

@quiz_bp.route('/submit/<quiz_id>', methods=['POST'])
def submit_quiz_route(quiz_id):
    """
    Submits the user's answers for the quiz and calculates the score.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401

    answers = request.json.get('answers')
    if not answers:
        return jsonify({"error": "Answers are required"}), 400

    score = submit_quiz(user_data['user_id'], quiz_id, answers)
    return jsonify({"score": score}), 200

@quiz_bp.route('/reset/<quiz_id>', methods=['PUT'])
def reset_quiz_route(quiz_id):
    """
    Resets the quiz progress.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401
    
    reset_quiz(user_data['user_id'], quiz_id)
    return jsonify({"message": "Quiz reset successful"}), 200

from flask import Blueprint, request, jsonify
from app.services.validation_service import validate_jwt_token
from app.models.lesson_model import fetch_all_lessons, fetch_lesson_by_id, mark_lesson_complete, download_lesson, delete_downloaded_lesson, fetch_progress

lesson_bp = Blueprint('lessons', __name__)

@lesson_bp.route('/', methods=['GET'])
def get_lessons():
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        lessons = fetch_all_lessons(token['user_id'])
        return jsonify({"lessons": lessons}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lesson_bp.route('/<lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        lesson = fetch_lesson_by_id(token['user_id'], lesson_id)
        return jsonify({"lesson": lesson}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@lesson_bp.route('/<lesson_id>/complete', methods=['POST'])
def complete_lesson(lesson_id):
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        mark_lesson_complete(token['user_id'], lesson_id)
        return jsonify({"message": "Lesson marked as complete"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lesson_bp.route('/download-lesson/<lesson_id>', methods=['POST'])
def download_lesson_route(lesson_id):
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        download_lesson(token['user_id'], lesson_id)
        return jsonify({"message": "Lesson downloaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lesson_bp.route('/delete-downloaded-lesson/<lesson_id>', methods=['DELETE'])
def delete_downloaded_lesson_route(lesson_id):
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        delete_downloaded_lesson(token['user_id'], lesson_id)
        return jsonify({"message": "Downloaded lesson deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lesson_bp.route('/progress/<user_id>', methods=['GET'])
def get_user_progress(user_id):
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        progress = fetch_progress(user_id)
        return jsonify({"progress": progress}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

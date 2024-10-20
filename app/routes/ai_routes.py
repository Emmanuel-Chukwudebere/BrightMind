from flask import Blueprint, request, jsonify
from app.services.api_service import ask_ai, text_to_speech, speech_to_text, search_web
from app.services.validation_service import validate_jwt_token

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/ask-ai', methods=['POST'])
def ask_ai_route():
    token = request.headers.get('Authorization')
    question = request.json.get('question')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        ai_response = ask_ai(question)
        return jsonify({"response": ai_response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/text-to-speech', methods=['POST'])
def text_to_speech_route():
    token = request.headers.get('Authorization')
    text = request.json.get('text')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        audio_content = text_to_speech(text)  # Tacotron 2 + WaveGlow
        return audio_content, 200, {'Content-Type': 'audio/mpeg'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/speech-to-text', methods=['POST'])
def speech_to_text_route():
    token = request.headers.get('Authorization')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    try:
        transcription = speech_to_text(audio_file)  # Wav2Vec 2.0
        return jsonify({"transcription": transcription}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/search-web', methods=['POST'])
def search_web_route():
    token = request.headers.get('Authorization')
    query = request.json.get('query')
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        search_results = search_web(query)  # Google Custom Search
        return jsonify({"results": search_results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

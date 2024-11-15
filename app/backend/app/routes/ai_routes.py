from flask import Blueprint, request, jsonify
from app.services.api_service import ask_ai, text_to_speech, speech_to_text #, search_web
from app.services.validation_service import validate_jwt_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import time

# Create the AI blueprint for modular API routes related to AI functionalities.
ai_bp = Blueprint('ai', __name__)

# Configure rate limiting to prevent abuse
# limiter = Limiter(key_func=get_remote_address)

# Configure logging for error tracking, performance monitoring, and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Helper function to log incoming requests for debugging and tracing
def log_request(endpoint):
    logging.info(f"Request received at {endpoint} from IP: {get_remote_address()}")

# Helper function to implement retry logic with exponential backoff
def retry_operation(func, max_retries=3, backoff_factor=2, *args, **kwargs):
    """
    Retry an operation in case of temporary failure.
    
    Parameters:
    - func: The function to retry.
    - max_retries: Maximum number of retry attempts.
    - backoff_factor: Multiplier for exponential backoff between retries.
    - *args, **kwargs: Arguments and keyword arguments to pass to the function.
    
    Returns:
    - The result of the function if successful.
    - None if the function fails after retries.
    """
    attempt = 0
    while attempt < max_retries:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {str(e)}")
            time.sleep(backoff_factor ** attempt)  # Exponential backoff
            attempt += 1
    return None

# Route to handle AI-powered responses from BlenderBot
@ai_bp.route('/ask-ai', methods=['POST'])
# @limiter.limit("10 per minute")  # Enforce rate limit to prevent API abuse
def ask_ai_route():
    """
    Endpoint to ask a question to the AI and receive a response.
    Handles AI question-answering based on input format.
    If input is voice, it will return a voice response (TTS).
    If input is text, it will return a text response.

    Headers:
    - Authorization: Bearer token for user authentication.
    
    Body:
    - question: The question to ask the AI.
    
    Returns:
    - 200: Successful AI response.
    - 401: Unauthorized if JWT token is invalid.
    - 503: Service unavailable if AI service is down after retries.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')
    user_data = validate_jwt_token(token)
    if not user_data:
        return jsonify({"error": "Unauthorized access"}), 401

    # Determine input format (voice or text) based on user input
    input_format = request.json.get('input_format', 'text')
    question = request.json.get('question')
    
    # If voice input, convert it to text first using STT
    if input_format == "voice":
        audio_data = request.files.get('audio')  # Assuming audio file sent as 'audio'
        if not audio_data:
            return jsonify({"error": "No audio data provided"}), 400
        
        # Convert voice to text
        question = speech_to_text(audio_data)
        if not question:
            return jsonify({"error": "Speech-to-text conversion failed"}), 500

    # Ask AI based on the provided question and input format
    response, headers = ask_ai(question, input_format=input_format)
    return response, headers

# Route to convert text to speech using Tacotron 2 and WaveGlow
@ai_bp.route('/text-to-speech', methods=['POST'])
# @limiter.limit("5 per minute")  # Limit to prevent overuse of resource-intensive TTS
def text_to_speech_route():
    """
    Endpoint to convert text to speech (TTS).
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    Body:
    - text: The text to convert into speech.
    
    Returns:
    - 200: Audio content in MPEG format.
    - 401: Unauthorized if JWT token is invalid.
    - 503: Service unavailable if TTS service is down after retries.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')
    text = request.json.get('text')

    # Validate user token before processing request
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    log_request('/text-to-speech')

    # Retry TTS operation in case of temporary service failure
    audio_content = retry_operation(text_to_speech, max_retries=3, backoff_factor=2, text=text)
    if audio_content:
        return audio_content, 200, {'Content-Type': 'audio/mpeg'}
    return jsonify({"error": "Text-to-Speech service is currently unavailable. Please try again later."}), 503

# Route to handle speech-to-text conversion using Wav2Vec 2.0
@ai_bp.route('/speech-to-text', methods=['POST'])
# @limiter.limit("5 per minute")  # Limit to prevent resource overuse
def speech_to_text_route():
    """
    Endpoint to convert speech (audio) to text.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    Body:
    - audio: The audio file to convert into text.
    
    Returns:
    - 200: Transcription of the speech in JSON format.
    - 401: Unauthorized if JWT token is invalid.
    - 400: Bad request if no audio file is provided.
    - 503: Service unavailable if STT service is down after retries.
    - 500: Internal server error for unexpected issues.
    """
    token = request.headers.get('Authorization')

    # Check for valid token before allowing access
    if not validate_jwt_token(token):
        return jsonify({"error": "Unauthorized access"}), 401

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    log_request('/speech-to-text')

    audio_file = request.files['audio']

    # Retry STT operation in case of temporary service failure
    transcription = retry_operation(speech_to_text, max_retries=3, backoff_factor=2, audio_data=audio_file)
    if transcription:
        return jsonify({"transcription": transcription}), 200
    return jsonify({"error": "Speech-to-Text service is currently unavailable. Please try again later."}), 503

# Route to handle web search queries using Google Custom Search
# @ai_bp.route('/search-web', methods=['POST'])
# @limiter.limit("20 per minute")  # Higher limit due to lighter resource usage
# def search_web_route():
    """
    Endpoint to search the web using Google Custom Search API.
    
    Headers:
    - Authorization: Bearer token for user authentication.
    
    Body:
    - query: The search query to send to Google Custom Search.
    
    Returns:
    - 200: Search results from the web in JSON format.
    - 401: Unauthorized if JWT token is invalid.
    - 503: Service unavailable if search service is down after retries.
    - 500: Internal server error for unexpected issues.
    """
    # token = request.headers.get('Authorization')
    # query = request.json.get('query')

    # Validate JWT token to prevent unauthorized use
    # if not validate_jwt_token(token):
        # return jsonify({"error": "Unauthorized access"}), 401

    # log_request('/search-web')

    # Retry web search in case of temporary failure
    # search_results = retry_operation(search_web, max_retries=3, backoff_factor=2, query=query)
    # if search_results:
        # return jsonify({"results": search_results}), 200
    # return jsonify({"error": "Search service is currently unavailable. Please try again later."}), 503
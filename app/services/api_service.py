import requests
import os
import logging
import time

# Load API keys from environment variables for security
HF_API_KEY = os.getenv('HUGGING_FACE_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')
FCM_SERVER_KEY = os.getenv('FCM_SERVER_KEY')

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Retry logic for API requests with exponential backoff
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

def ask_ai(question):
    """
    Sends a question to the Hugging Face BlenderBot model and retrieves the AI response.
    
    Parameters:
    - question: The input question for the AI.
    
    Returns:
    - The AI response in JSON format or None if the request fails.
    """
    url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    data = {"inputs": question}

    def fetch_ai_response():
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()

    return retry_operation(fetch_ai_response, max_retries=3)

def text_to_speech(text):
    """
    Converts text to speech using Hugging Face's Tacotron 2 + WaveGlow model.
    
    Parameters:
    - text: The input text to convert to speech.
    
    Returns:
    - The generated audio content (in MPEG format) or None if the request fails.
    """
    tacotron_url = "https://api-inference.huggingface.co/models/facebook/tacotron2"
    waveglow_url = "https://api-inference.huggingface.co/models/facebook/waveglow"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    data = {"inputs": text}

    def fetch_tts():
        # First, generate audio sequence using Tacotron 2
        tacotron_response = requests.post(tacotron_url, headers=headers, json=data)
        tacotron_response.raise_for_status()
        tacotron_audio = tacotron_response.content

        # Then, convert Tacotron audio to high-quality speech using WaveGlow
        waveglow_response = requests.post(waveglow_url, headers=headers, json={"inputs": tacotron_audio})
        waveglow_response.raise_for_status()
        return waveglow_response.content

    return retry_operation(fetch_tts, max_retries=3)

def speech_to_text(audio_data):
    """
    Converts speech (audio) to text using Hugging Face's Wav2Vec 2.0 model.
    
    Parameters:
    - audio_data: The input audio data to convert to text.
    
    Returns:
    - The transcription result or None if the request fails.
    """
    url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    files = {"file": audio_data}

    def fetch_stt():
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
        return response.json()["text"]

    return retry_operation(fetch_stt, max_retries=3)

def search_web(query):
    """
    Performs a web search using the Google Custom Search API.
    
    Parameters:
    - query: The search query.
    
    Returns:
    - The search results in JSON format or None if the request fails.
    """
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}"

    def fetch_search_results():
        response = requests.get(url)
        response.raise_for_status()
        return response.json()["items"]

    return retry_operation(fetch_search_results, max_retries=3)

def send_fcm_notification(user_id, message):
    """
    Sends a push notification to a specific user via Firebase Cloud Messaging (FCM).
    
    Parameters:
    - user_id: The ID of the user to send the notification to.
    - message: The notification message.
    
    Returns:
    - True if the notification was sent successfully, or None if the request fails.
    """
    url = "https://fcm.googleapis.com/fcm/send"
    headers = {
        "Authorization": f"key={FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "to": f"/topics/{user_id}",
        "notification": {
            "title": "BrightMind Notification",
            "body": message
        }
    }

    def send_notification():
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        logging.info(f"Notification sent to user {user_id}")
        return True

    return retry_operation(send_notification, max_retries=3)
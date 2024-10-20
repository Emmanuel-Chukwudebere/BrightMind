import requests
import os
import logging

HF_API_KEY = os.getenv('HUGGING_FACE_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')
FCM_SERVER_KEY = os.getenv('FCM_SERVER_KEY')

def ask_ai(question):
    """
    Integrates with BlenderBot API to answer student questions.
    """
    url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    data = {"inputs": question}

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error with BlenderBot: {str(e)}")
        return {"error": "AI service is currently unavailable"}

def text_to_speech(text):
    """
    Uses Tacotron 2 + WaveGlow for text-to-speech conversion.
    Tacotron 2 generates the audio sequence, WaveGlow converts it into high-quality speech audio.
    """
    tacotron_url = "https://api-inference.huggingface.co/models/facebook/tacotron2"
    waveglow_url = "https://api-inference.huggingface.co/models/facebook/waveglow"

    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    data = {"inputs": text}

    try:
        # First, use Tacotron 2 to generate audio sequence
        tacotron_response = requests.post(tacotron_url, headers=headers, json=data)
        tacotron_response.raise_for_status()
        tacotron_audio = tacotron_response.content  # Tacotron output

        # Then, pass Tacotron's audio to WaveGlow to generate high-quality speech
        waveglow_response = requests.post(waveglow_url, headers=headers, json={"inputs": tacotron_audio})
        waveglow_response.raise_for_status()

        return waveglow_response.content  # Return final audio content (MPEG format)
    except requests.exceptions.RequestException as e:
        logging.error(f"Error with Tacotron 2 or WaveGlow: {str(e)}")
        return None

def speech_to_text(audio_data):
    """
    Uses Wav2Vec 2.0 for speech-to-text conversion.
    """
    url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    files = {"file": audio_data}

    try:
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
        return response.json()["text"]
    except requests.exceptions.RequestException as e:
        logging.error(f"Error with Wav2Vec 2.0: {str(e)}")
        return {"error": "Speech recognition service is unavailable"}

def search_web(query):
    """
    Uses Google Custom Search API for additional query results.
    """
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()["items"]
    except requests.exceptions.RequestException as e:
        logging.error(f"Error with Google Custom Search: {str(e)}")
        return {"error": "Search service is unavailable"}

def send_fcm_notification(user_id, message):
    """
    Sends a notification to a specific user using Firebase Cloud Messaging (FCM).
    """
    url = "https://fcm.googleapis.com/fcm/send"
    headers = {
        "Authorization": f"key={FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "to": f"/topics/{user_id}",  # Assuming we're using topics for user-specific notifications
        "notification": {
            "title": "BrightMind Notification",
            "body": message
        }
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return {"message": "Notification sent successfully"}
    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending FCM notification: {str(e)}")
        return {"error": "Notification failed"}

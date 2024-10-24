import requests
import os
import logging
import time

# Load FCM Server Key securely from environment variables
FCM_SERVER_KEY = os.getenv('FCM_SERVER_KEY')

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Retry logic for FCM notification with exponential backoff
def retry_operation(func, max_retries=3, backoff_factor=2, *args, **kwargs):
    attempt = 0
    while attempt < max_retries:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {str(e)}")
            time.sleep(backoff_factor ** attempt)
            attempt += 1
    return None

def send_fcm_notification(user_token, message_title, message_body):
    """
    Sends a notification using Firebase Cloud Messaging HTTP v1 API.
    
    Args:
        user_token (str): The user's FCM token.
        message_title (str): The title of the notification.
        message_body (str): The body of the notification.

    Returns:
        dict: The response from FCM if successful, or error message if failed.
    """
    url = "https://fcm.googleapis.com/v1/projects/brightmind-1/messages:send"
    headers = {
        "Authorization": f"Bearer {FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "message": {
            "token": user_token,  # Target specific device
            "notification": {
                "title": message_title,
                "body": message_body
            }
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Ensure we catch non-200 responses
        return response.json()
    except requests.exceptions.HTTPError as err:
        if response.status_code == 401:  # Unauthorized: FCM token may have expired
            logging.error(f"Invalid FCM token: {user_token}. Error: {err}")
            return {"error": "Invalid FCM token"}
        elif response.status_code == 429:  # Rate limit exceeded
            logging.error(f"Rate limit exceeded: {err}")
            time.sleep(1)  # Simple backoff strategy (can be enhanced)
            return {"error": "Rate limit exceeded, retry later"}
        else:
            logging.error(f"Error sending FCM notification: {err}")
            return {"error": str(err)}
    except Exception as e:
        logging.error(f"Unexpected error while sending FCM notification: {e}")
        return {"error": str(e)}
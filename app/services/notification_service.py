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

def send_fcm_notification(user_id, message):
    """
    Sends a notification to a specific user using Firebase Cloud Messaging (FCM).
    
    Parameters:
    - user_id: The ID of the user to send the notification to.
    - message: The notification message content.
    
    Returns:
    - A dictionary indicating success or failure.
    """
    url = "https://fcm.googleapis.com/fcm/send"
    headers = {
        "Authorization": f"key={FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "to": f"/topics/{user_id}",  # Target user via topic-based notification
        "notification": {
            "title": "BrightMind Notification",
            "body": message
        }
    }

    def send_notification():
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        logging.info(f"Notification sent to user {user_id}")
        return {"message": "Notification sent successfully"}

    # Retry sending notification in case of temporary failures
    result = retry_operation(send_notification, max_retries=3, backoff_factor=2)
    if result:
        return result
    return {"error": "Notification service unavailable. Please try again later"}
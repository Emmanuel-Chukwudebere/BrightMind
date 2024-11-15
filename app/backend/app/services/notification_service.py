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

def update_fcm_token(user_id, old_token, new_token):
    """
    Updates a user's FCM token in the system. This should be called when a token refresh occurs
    or when a user logs in on a new device.
    
    Args:
        user_id (str): The unique identifier for the user
        old_token (str): The previous FCM token (can be None for new registrations)
        new_token (str): The new FCM token to be registered
        
    Returns:
        dict: A dictionary containing success status and any relevant messages
    """
    # Validate input parameters
    if not user_id or not new_token:
        logging.error("Missing required parameters: user_id and new_token are mandatory")
        return {
            "success": False,
            "error": "Missing required parameters"
        }

    # Validate token format (basic validation)
    if len(new_token) < 32:  # FCM tokens are typically longer
        logging.error(f"Invalid token format: {new_token}")
        return {
            "success": False,
            "error": "Invalid token format"
        }

    # URL for FCM token registration/update
    url = "https://fcm.googleapis.com/v1/projects/brightmind-1/registrations"
    headers = {
        "Authorization": f"Bearer {FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }

    # Prepare the payload for token update
    payload = {
        "registration": {
            "user_id": user_id,
            "token": new_token,
        }
    }

    # If we have an old token, add it to help FCM clean up
    if old_token:
        payload["registration"]["old_token"] = old_token

    # Use retry logic for the token update operation
    def perform_update():
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

    result = retry_operation(perform_update)

    if result is None:
        logging.error(f"Failed to update FCM token for user {user_id} after all retries")
        return {
            "success": False,
            "error": "Failed to update token after multiple attempts"
        }

    # Log successful token update
    logging.info(f"Successfully updated FCM token for user {user_id}")
    
    return {
        "success": True,
        "message": "Token updated successfully",
        "data": result
    }

# Example usage:
# response = update_fcm_token(
#     user_id="user123",
#     old_token="previous_fcm_token",
#     new_token="new_fcm_token"
# )
import requests
import os
import logging

FCM_SERVER_KEY = os.getenv('FCM_SERVER_KEY')

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
        "to": f"/topics/{user_id}",  # Assuming we are using topics for user-specific notifications
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

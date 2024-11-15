import unittest
from app import create_app
from flask import json

class NotificationTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_send_notification(self):
        token = self.get_token()
        response = self.client.post('/notifications/send-notification', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "user_token": "dummy_fcm_token",
            "title": "Test Notification",
            "body": "This is a test notification."
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["message"], "Notification sent successfully")

    # Utility method to fetch a valid token for a test user
    def get_token(self):
        response = self.client.post('/auth/login', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        return json.loads(response.data)["token"]

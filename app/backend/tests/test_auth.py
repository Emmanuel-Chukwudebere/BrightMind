import unittest
from app import create_app
from flask import json

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_signup(self):
        response = self.client.post('/auth/signup', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn("user_id", json.loads(response.data))

    def test_login(self):
        response = self.client.post('/auth/login', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", json.loads(response.data))

    def test_update_profile(self):
        token = self.get_token()  # Assume this method gets a valid token for the test user
        response = self.client.post('/auth/update-profile/test_user_id', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "first_name": "Test",
            "last_name": "User"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["message"], "Profile updated successfully")

    def test_update_settings(self):
        token = self.get_token()
        response = self.client.post('/auth/update-settings/test_user_id', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "notifications_enabled": True
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["message"], "Settings updated successfully")

    # Utility method to fetch a valid token for a test user
    def get_token(self):
        response = self.client.post('/auth/login', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        return json.loads(response.data)["token"]

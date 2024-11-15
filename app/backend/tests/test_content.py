# tests/test_content.py
import unittest
from app import create_app
from flask import json

class ContentTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_generate_content(self):
        token = self.get_token()
        response = self.client.post('/content/generate', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "topic": "Machine Learning",
            "level": "beginner"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("summary", json.loads(response.data))

    def test_download_content(self):
        token = self.get_token()
        response = self.client.get('/content/download/Machine Learning', headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("summary", json.loads(response.data))

    # Utility method to fetch a valid token for a test user
    def get_token(self):
        response = self.client.post('/auth/login', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        return json.loads(response.data)["token"]

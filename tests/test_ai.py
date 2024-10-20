import unittest
from app import create_app
from flask import json

class AITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_ask_ai(self):
        token = self.get_token()
        response = self.client.post('/ai/ask-ai', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "question": "What is Python?"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("response", json.loads(response.data))

    def test_text_to_speech(self):
        token = self.get_token()
        response = self.client.post('/ai/text-to-speech', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "text": "Hello, how can I help you?"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'audio/mpeg')

    def test_speech_to_text(self):
        token = self.get_token()
        with open('test_audio.wav', 'rb') as audio_file:
            response = self.client.post('/ai/speech-to-text', headers={
                "Authorization": f"Bearer {token}"
            }, data={
                "audio": audio_file
            })
        self.assertEqual(response.status_code, 200)
        self.assertIn("transcription", json.loads(response.data))

    def test_search_web(self):
        token = self.get_token()
        response = self.client.post('/ai/search-web', headers={
            "Authorization": f"Bearer {token}"
        }, json={
            "query": "Python programming"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("results", json.loads(response.data))

    # Utility method to fetch a valid token for a test user
    def get_token(self):
        response = self.client.post('/auth/login', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        return json.loads(response.data)["token"]

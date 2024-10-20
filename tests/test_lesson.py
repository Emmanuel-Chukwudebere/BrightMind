import unittest
from app import create_app
from flask import json

class LessonTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_get_lessons(self):
        token = self.get_token()
        response = self.client.get('/lessons/', headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(json.loads(response.data)["lessons"], list)

    def test_get_lesson(self):
        token = self.get_token()
        response = self.client.get('/lessons/test_lesson_id', headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("lesson", json.loads(response.data))

    def test_mark_lesson_complete(self):
        token = self.get_token()
        response = self.client.post('/lessons/test_lesson_id/complete', headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["message"], "Lesson marked as complete")

    def test_download_lesson(self):
        token = self.get_token()
        response = self.client.post('/lessons/download-lesson/test_lesson_id', headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["message"], "Lesson downloaded successfully")

    def test_delete_downloaded_lesson(self):
        token = self.get_token()
        response = self.client.delete('/lessons/delete-downloaded-lesson/test_lesson_id', headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["message"], "Downloaded lesson deleted")

    # Utility method to fetch a valid token for a test user
    def get_token(self):
        response = self.client.post('/auth/login', json={
            "email": "test@example.com",
            "password": "TestPassword123"
        })
        return json.loads(response.data)["token"]

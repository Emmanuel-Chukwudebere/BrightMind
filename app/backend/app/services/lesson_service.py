# app/services/lesson_service.py
from app.services.firebase_service import db
from datetime import datetime, timedelta

def get_recent_lessons(user_id):
    """
    Fetches the three most recently accessed or completed lessons for a user.
    
    Args:
        user_id (str): The user ID for personalized data retrieval.
    
    Returns:
        list: A list of dictionaries, each representing a recent lesson.
    """
    # Retrieve lessons sorted by most recent completion/access timestamp
    lessons_ref = db.collection('users').document(user_id).collection('progress')
    recent_lessons_query = lessons_ref.order_by('last_accessed', direction="DESCENDING").limit(3)
    
    # Fetch recent lessons
    recent_lessons = [doc.to_dict() for doc in recent_lessons_query.stream()]
    return recent_lessons

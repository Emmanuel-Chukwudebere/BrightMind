from app.services.firebase_service import db
from firebase_admin import firestore

def fetch_all_lessons(user_id):
    """
    Fetches all lessons available for the user.
    """
    lessons = db.collection('lessons').stream()
    return [lesson.to_dict() for lesson in lessons]

def fetch_lesson_by_id(user_id, lesson_id):
    """
    Fetches a specific lesson by lesson_id for the user.
    """
    lesson_ref = db.collection('lessons').document(lesson_id)
    lesson = lesson_ref.get()
    return lesson.to_dict() if lesson.exists else None

def mark_lesson_complete(user_id, lesson_id):
    """
    Marks a lesson as completed for the user in Firestore.
    """
    db.collection('users').document(user_id).collection('progress').document(lesson_id).set({
        'completed': True,
        'completed_at': firestore.SERVER_TIMESTAMP
    })

def download_lesson(user_id, lesson_id):
    """
    Marks a lesson as downloaded for offline use by the user.
    """
    db.collection('users').document(user_id).collection('downloads').document(lesson_id).set({
        'downloaded': True,
        'downloaded_at': firestore.SERVER_TIMESTAMP
    })

def delete_downloaded_lesson(user_id, lesson_id):
    """
    Deletes a downloaded lesson from the user's collection.
    """
    db.collection('users').document(user_id).collection('downloads').document(lesson_id).delete()

def fetch_progress(user_id):
    """
    Fetches the user's progress across all lessons.
    """
    progress_ref = db.collection('users').document(user_id).collection('progress').stream()
    return {doc.id: doc.to_dict() for doc in progress_ref}

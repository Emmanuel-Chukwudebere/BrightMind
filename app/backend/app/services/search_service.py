# app/services/search_service.py
from app.services.firebase_service import db

def search_topics(user_id, query, category):
    """
    Searches topics within a specified category based on user input.
    
    Args:
        user_id (str): The user ID for personalized data.
        query (str): Search term to filter topics.
        category (str): Category to search within ("all", "in_progress", "completed", "downloaded").
    
    Returns:
        list: Topics matching the search criteria within the specified category.
    """
    query = query.lower()
    results = []

    # Reference to topics collection
    collection_ref = db.collection('topics')

    if category == 'all':
        # Fetch all topics that match the query
        results = [
            doc.to_dict() for doc in collection_ref.stream()
            if query in doc.to_dict().get('name', '').lower()
        ]
    
    elif category == 'in_progress':
        # Fetch only topics marked as "in progress" by the user
        user_progress = db.collection('users').document(user_id).collection('progress').where('status', '==', 'in_progress').stream()
        in_progress_ids = {doc.id for doc in user_progress}

        results = [
            doc.to_dict() for doc in collection_ref.stream()
            if doc.id in in_progress_ids and query in doc.to_dict().get('name', '').lower()
        ]
    
    elif category == 'completed':
        # Fetch only topics marked as "completed" by the user
        user_progress = db.collection('users').document(user_id).collection('progress').where('status', '==', 'completed').stream()
        completed_ids = {doc.id for doc in user_progress}

        results = [
            doc.to_dict() for doc in collection_ref.stream()
            if doc.id in completed_ids and query in doc.to_dict().get('name', '').lower()
        ]
    
    elif category == 'downloaded':
        # Fetch only topics downloaded by the user
        user_downloads = db.collection('users').document(user_id).collection('downloads').stream()
        downloaded_ids = {download.id for download in user_downloads}

        results = [
            doc.to_dict() for doc in collection_ref.stream()
            if doc.id in downloaded_ids and query in doc.to_dict().get('name', '').lower()
        ]

    return results
# app/services/recommendation_service.py
from app.services.firebase_service import db
import random

def get_recommended_lessons(user_id, recent_topic_ids=[], screen='home'):
    """
    Fetches recommended lessons based on user preferences and screen context.
    
    Args:
        user_id (str): The ID of the user for personalized recommendations.
        recent_topic_ids (list): List of recently viewed topic IDs.
        screen (str): The screen context for recommendations ("home" or "downloaded").
    
    Returns:
        list: A list of recommended lesson topics.
    """
    recommendations = []
    topics_ref = db.collection('topics')

    if screen == 'home':
        # Home screen: Get related topics or other relevant topics not based on popularity
        for topic_id in recent_topic_ids:
            related_topics = [doc.to_dict() for doc in topics_ref.where('related_topics', 'array_contains', topic_id).limit(5).stream()]
            recommendations.extend(related_topics)
        
        # If no recent topics provided, fetch a general list of topics (non-popular)
        if not recommendations:
            general_topics = [doc.to_dict() for doc in topics_ref.limit(10).stream()]
            recommendations.extend(general_topics)

    elif screen == 'downloaded':
        # Downloaded screen: Recommend topics that the user started but hasn't downloaded
        user_progress = db.collection('users').document(user_id).collection('progress').where('status', '==', 'in_progress').stream()
        in_progress_ids = {doc.id for doc in user_progress}

        user_downloads = db.collection('users').document(user_id).collection('downloads').stream()
        downloaded_ids = {doc.id for doc in user_downloads}

        # Topics in progress but not downloaded
        recommendations = [
            doc.to_dict() for doc in topics_ref.stream() 
            if doc.id in in_progress_ids and doc.id not in downloaded_ids
        ]

    # Randomize and limit recommendations for variety and performance
    random.shuffle(recommendations)
    return recommendations[:10]
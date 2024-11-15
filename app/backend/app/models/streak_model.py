from app.services.firebase_service import db
from firebase_admin import firestore

def update_streak(user_id):
    """
    Updates the user's streak based on their login or lesson completion activity.
    
    Args:
        user_id (str): The user's ID.

    Returns:
        int: The updated streak count.
        str: The dynamic motivational message.
    """
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()

    current_streak = user_data.get('streak', 0)
    last_login = user_data.get('last_login')

    # Calculate streak based on consecutive days
    current_time = firestore.SERVER_TIMESTAMP
    if last_login and (current_time - last_login).days == 1:
        current_streak += 1
    else:
        current_streak = 1  # Reset streak if not consecutive

    user_ref.update({
        'streak': current_streak,
        'last_login': current_time
    })
    
    return current_streak, get_streak_message(current_streak)

def get_streak_message(streak):
    """
    Returns a motivational message based on the streak count.
    
    Args:
        streak (int): The user's streak count.

    Returns:
        str: The motivational message.
    """
    if streak < 5:
        return f"Keep going! You're building momentum with {streak} days!"
    elif 5 <= streak < 10:
        return f"Amazing! {streak} days straight—keep it up!"
    elif streak >= 10:
        return f"Incredible! {streak} days of learning, you're unstoppable!"

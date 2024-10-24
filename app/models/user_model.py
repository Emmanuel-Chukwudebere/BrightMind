from firebase_admin import auth, firestore, storage
from app.services.firebase_service import db
import jwt
import os
import logging
from datetime import datetime, timedelta

JWT_SECRET = os.getenv('JWT_SECRET')

def create_user(email, password):
    """
    Creates a new user in Firebase Authentication and Firestore.
    """
    # Create user in Firebase Authentication
    user = auth.create_user(email=email, password=password)
    
    # Add user data to Firestore
    db.collection('users').document(user.uid).set({
        'email': email,
        'created_at': firestore.SERVER_TIMESTAMP
    })
    
    return user.uid

def get_user(email):
    """
    Retrieves user data from Firestore by email.
    """
    user = auth.get_user_by_email(email)
    user_data = db.collection('users').document(user.uid).get().to_dict()
    return user_data

def update_profile(user_id, profile_data):
    """
    Updates the user's profile information in Firestore.
    """
    db.collection('users').document(user_id).update(profile_data)

def upload_profile_picture(user_id, file):
    """
    Uploads the user's profile picture to Firebase Storage and updates Firestore.
    
    Args:
        user_id (str): The user's ID.
        file (File): The file to be uploaded.

    Returns:
        str: The URL of the uploaded profile picture.
    """
    bucket = storage.bucket()
    blob = bucket.blob(f'profile_pictures/{user_id}')
    blob.upload_from_file(file)
    
    # Make the file publicly accessible
    blob.make_public()
    
    # Update Firestore with the profile picture URL
    db.collection('users').document(user_id).update({
        'profile_picture': blob.public_url
    })
    
    return blob.public_url

def update_settings(user_id, settings_data):
    """
    Updates the user's settings in Firestore.
    """
    db.collection('users').document(user_id).update({'settings': settings_data})

def generate_jwt(user_id):
    """
    Generates a JWT token for the user with an expiration time.
    """
    expiration = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode({'user_id': user_id, 'exp': expiration}, JWT_SECRET, algorithm='HS256')
    return token

def get_user_by_id(user_id):
    """
    Fetches user data by user_id from Firestore.
    """
    return db.collection('users').document(user_id).get().to_dict()

def update_fcm_token(user_id, new_fcm_token):
    """
    Updates the user's FCM token in Firestore if it has changed or needs refreshing.

    Args:
        user_id (str): The ID of the user.
        new_fcm_token (str): The refreshed FCM token for the user.

    Returns:
        None
    """
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()

    # Check if the token is different or needs updating
    current_fcm_token = user_data.get('fcm_token')
    if current_fcm_token != new_fcm_token:
        user_ref.update({'fcm_token': new_fcm_token})
        logging.info(f"Updated FCM token for user: {user_id}")
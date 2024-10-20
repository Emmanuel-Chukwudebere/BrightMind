from firebase_admin import auth, firestore
from app.services.firebase_service import db
import jwt
import os
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

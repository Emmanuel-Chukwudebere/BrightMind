from firebase_admin import auth, firestore, storage
from flask import current_app
from app.services.firebase_service import db
import jwt
import os
import logging
from datetime import datetime, timedelta, timezone

JWT_SECRET = os.getenv('JWT_SECRET')

class User(object):
    def __init__(self, user_id, email, created_at, profile_picture=None, settings=None, last_login=None, fcm_token=None):
        self.uid = user_id
        self.email = email
       # self.password_hash = password_hash
        self.created_at = created_at
      #  self.updated_at = updated_at
        self.profile_picture = profile_picture
        self.settings = settings
        self.last_login = last_login
        self.fcm_token = fcm_token

    def to_dict(self):
        return {
            'uid': self.uid,
            'email': self.email,
           # 'password_hash': self.password_hash,
            'created_at': self.created_at,
           # 'updated_at': self.updated_at,
            'profile_picture': self.profile_picture,
            'settings': self.settings,
            'last_login': self.last_login,
            'fcm_token': self.fcm_token
        }

    @classmethod
    def from_dict(cls, data):
        if 'uid' not in data:
            current_app.logger.error(f"User data is missing the 'UID' field: {data}")  # Log the data
            raise ValueError("User uid is missing in the fetched data")
    
        return cls(
            user_id=data['uid'],
            email=data['email'],
           # password_hash=data['password_hash'],
            created_at=data['created_at'],
           # updated_at=data['updated_at'],
            profile_picture=data.get('profile_picture'),
            settings=data.get('settings'),
            last_login=data.get('last_login'),
            fcm_token=data.get('fcm_token')
        )

def create_user(email, password):
    """
    Creates a new user in Firebase Authentication and adds initial data to Firestore.
    """
    try:
        # Create user in Firebase Auth
        user = auth.create_user(email=email, password=password)
        
        # Initial Firestore user data
        user_data = {
            'uid': user.uid,  # Changed from user.id to user.uid
            'email': email,
            'created_at': datetime.now(timezone.utc),
            'profile_picture': None,
            'settings': {},
            'last_login': datetime.now(timezone.utc)
        }
        
        # Store user data in Firestore
        db.collection('users').document(user.uid).set(user_data)  # Changed from user.id to user.uid
        return user.uid  # Changed from user.id to user.uid
        
    except Exception as e:
        current_app.logger.error(f"Error creating user: {e}")
        raise


def get_user(email):
    """
    Retrieves user data from Firebase Authentication by email.
    """
    try:
        # Get the UserRecord object from Firebase Auth using the email
        user = auth.get_user_by_email(email)
        
        # Log the complete UserRecord object
        current_app.logger.info(f"Fetched user: {user.uid}")  # Changed from user.id to user.uid
        
        # Check if 'uid' is part of the object
        if hasattr(user, 'uid'):  # Changed from 'id' to 'uid'
            current_app.logger.info(f"User ID: {user.uid}")  # Changed from user.id to user.uid
        else:
            current_app.logger.error("No 'uid' found in the user record.")
        
        # Now, access Firestore with user.uid
        user_data = db.collection('users').document(user.uid).get().to_dict()  # Changed from user.id to user.uid
        
        if user_data is None:
            # If no document exists, create one with basic information
            user_data = {
                'uid': user.uid,  # Changed from user.id to user.uid
                'email': user.email,
                'created_at': datetime.now(timezone.utc),
                'last_login': datetime.now(timezone.utc),
                'profile_picture': None,
                'settings': {}
            }
            # Store the new user data
            db.collection('users').document(user.uid).set(user_data)  # Changed from user.id to user.uid
        
        current_app.logger.info(f"User data fetched from Firestore: {user_data}")
        return user_data

    except auth.UserNotFoundError:
        current_app.logger.error(f"User not found with email: {email}")
        raise
    except Exception as e:
        current_app.logger.error(f"Error retrieving user data: {e}")
        raise

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
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    issued_at = datetime.now(timezone.utc)
    token = jwt.encode({
        'uid': user_id,
        'exp': expiration,
        'iat': issued_at
    }, JWT_SECRET, algorithm='HS256')
    return token

def get_user_by_id(user_id):
    """
    Retrieves user data from Firestore using the user_id.
    """
    try:
        # Access Firestore directly with the provided user_id
        user_doc = db.collection('users').document(user_id).get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            current_app.logger.info(f"User data fetched for {user_id}: {user_data}")
            return user_data
        else:
            current_app.logger.error(f"No user found with UID: {user_id}")
            raise ValueError(f"No user found with UID: {user_id}")
    
    except Exception as e:
        current_app.logger.error(f"Error fetching user by ID: {e}")
        raise

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

def store_user_data(user_data):
    """
    Stores user data in Firestore.
    """
    try:
        # Create a reference to the users collection
        user_ref = db.collection('users').document(user_data['uid'])
        
        # Set the user data
        user_ref.set(user_data)
        
    except Exception as e:
        logging.error(f"Error storing user data in Firestore: {str(e)}")
        raise

def get_user_data(user_id):
    """
    Retrieves user data from Firestore.
    """
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return user_doc.to_dict()
        return None
        
    except Exception as e:
        logging.error(f"Error retrieving user data from Firestore: {str(e)}")
        raise

def update_last_login(user_id):
    """
    Updates the last login timestamp for a user in Firestore.
    """
    try:
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'last_login': datetime.now(timezone.utc)
        })
    except Exception as e:
        logging.error(f"Error updating last login in Firestore: {str(e)}")
        raise

def update_user_data(user_id, update_data):
    """
    Updates user data in Firestore.
    """
    try:
        user_ref = db.collection('users').document(user_id)
        user_ref.update(update_data)
        return True
    except Exception as e:
        current_app.logger.error(f"Error updating user data: {e}")
        raise
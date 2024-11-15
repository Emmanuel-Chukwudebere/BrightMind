import firebase_admin
from firebase_admin import credentials, firestore, auth
import logging
import time


# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

db = None  # Global Firestore client variable, initialized in initialize_firebase

# Retry logic for Firebase operations with exponential backoff
def retry_operation(func, max_retries=3, backoff_factor=2, *args, **kwargs):
    attempt = 0
    while attempt < max_retries:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {str(e)}")
            time.sleep(backoff_factor ** attempt)  # Exponential backoff
            attempt += 1
    return None

def initialize_firebase(app):
    """
    Initializes Firebase Admin SDK using the credentials in the environment variable.
    This setup provides access to Firestore and other Firebase services.
    
    Environment:
    - FIREBASE_CREDENTIALS_PATH: Path to the Firebase Admin SDK JSON credentials.
    """
    global db
    # Only initialize Firebase if it hasn’t been initialized already
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(app.config['FIREBASE_CREDENTIALS_PATH'])
            firebase_admin.initialize_app(cred, {
                'projrctIs': 'brightmind-1',
            })
            db = firestore.client()  # Initialize db only after successful setup
            logging.info("Firebase and Firestore successfully initialized.")
        except Exception as e:
            logging.error(f"Firebase initialization failed: {str(e)}")
            raise

def get_user_by_id(user_id):
    """
    Retrieve a user from Firebase by their UID
    
    Args:
        user_id (str): The Firebase UID of the user
        
    Returns:
        dict: User information from Firebase
        
    Raises:
        CustomError: If user not found or Firebase error occurs
    """
    try:
        user = auth.get_user(user_id)
        return {
            'user_id': user.uid,
            'email': user.email,
            'display_name': user.display_name,
            'email_verified': user.email_verified,
            'disabled': user.disabled,
            'created_at': user.user_metadata.creation_timestamp if user.user_metadata else None
        }
    except auth.UserNotFoundError:
        raise SystemError('User not found', 404)
    except Exception as e:
        raise SystemError(f'Error getting user: {str(e)}', 500)

# Firestore client methods can now reference `db` only if `initialize_firebase` has set it up
def get_document(collection_name, document_id):
    """
    Fetch a specific document from a Firestore collection.
    
    Parameters:
    - collection_name: The name of the Firestore collection.
    - document_id: The document's unique ID.
    
    Returns:
    - The document data if successful, or None if it fails.
    """
    def fetch_document():
        if db is None:
            raise ValueError("Firestore client has not been initialized.")
        doc_ref = db.collection(collection_name).document(document_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None

    return retry_operation(fetch_document, max_retries=3)

def set_document(collection_name, document_id, data):
    """
    Add or update a document in a Firestore collection.
    
    Parameters:
    - collection_name: The name of the Firestore collection.
    - document_id: The document's unique ID.
    - data: A dictionary of the data to set in the document.
    
    Returns:
    - True if successful, False if it fails.
    """
    def update_document():
        if db is None:
            raise ValueError("Firestore client has not been initialized.")
        doc_ref = db.collection(collection_name).document(document_id)
        doc_ref.set(data)
        logging.info(f"Document {document_id} updated in collection {collection_name}")
        return True

    return retry_operation(update_document, max_retries=3)

def delete_document(collection_name, document_id):
    """
    Deletes a document from a Firestore collection.
    
    Parameters:
    - collection_name: The name of the Firestore collection.
    - document_id: The document's unique ID.
    
    Returns:
    - True if successful, False if it fails.
    """
    def remove_document():
        if db is None:
            raise ValueError("Firestore client has not been initialized.")
        doc_ref = db.collection(collection_name).document(document_id)
        doc_ref.delete()
        logging.info(f"Document {document_id} deleted from collection {collection_name}")
        return True

    return retry_operation(remove_document, max_retries=3)
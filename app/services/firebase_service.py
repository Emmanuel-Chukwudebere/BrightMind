from firebase_admin import credentials, firestore, initialize_app
import logging
import time

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

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
    try:
        cred = credentials.Certificate(app.config['FIREBASE_CREDENTIALS_PATH'])
        initialize_app(cred)
        logging.info("Firebase successfully initialized.")
    except Exception as e:
        logging.error(f"Firebase initialization failed: {str(e)}")
        raise

# Firestore Client (global so that it can be reused in the app)
try:
    db = firestore.client()
except Exception as e:
    logging.error(f"Failed to initialize Firestore client: {str(e)}")
    db = None

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
        doc_ref = db.collection(collection_name).document(document_id)
        doc_ref.delete()
        logging.info(f"Document {document_id} deleted from collection {collection_name}")
        return True

    return retry_operation(remove_document, max_retries=3)
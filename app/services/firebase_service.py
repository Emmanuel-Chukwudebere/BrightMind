from firebase_admin import credentials, firestore, initialize_app

def initialize_firebase(app):
    """
    Initializes Firebase Admin SDK using the credentials in the environment variable.
    """
    cred = credentials.Certificate(app.config['FIREBASE_CREDENTIALS_PATH'])
    initialize_app(cred)

# Firestore Client (global so that it can be reused in the app)
db = firestore.client()

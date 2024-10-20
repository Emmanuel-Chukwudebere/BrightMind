import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

class Config:
    # Core configurations
    SECRET_KEY = os.getenv('SECRET_KEY')  # For JWT tokens and other secure operations
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')  # Path to Firebase Admin SDK JSON

    # API keys
    HUGGING_FACE_API_KEY = os.getenv('HUGGING_FACE_API_KEY')  # Hugging Face API Key for AI models
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # Google Custom Search API key
    GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')  # Google Custom Search Engine ID
    FCM_SERVER_KEY = os.getenv('FCM_SERVER_KEY')  # Firebase Cloud Messaging server key

    # Additional configurations (optional, depending on your app)
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')  # App environment (development or production)

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = True

# Configuration mapping for easy retrieval
config = {
    'production': ProductionConfig,
    'development': DevelopmentConfig
}

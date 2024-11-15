import os
from dotenv import load_dotenv
from redis import Redis

# Load environment variables from .env
load_dotenv()

# Configure Redis
# redis = Redis(host='localhost', port=6379, db=0)

class Config:
    # Core configurations
    SECRET_KEY = os.getenv('SECRET_KEY')
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')
    
    # API keys
    HUGGING_FACE_API_KEY = os.getenv('HUGGING_FACE_API_KEY')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')
    FCM_SERVER_KEY = os.getenv('FCM_SERVER_KEY')
    FIREBASE_WEB_API_KEY = os.getenv('FIREBASE_WEB_API_KEY')
    FIREBASE_AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1'

    # Flask-Limiter configurations
    RATELIMIT_DEFAULT = "200 per day;50 per hour"
    RATELIMIT_STORAGE_URL = "memory://"
    RATELIMIT_STRATEGY = "fixed-window"  # or "moving-window"
    RATELIMIT_HEADERS_ENABLED = True


    @staticmethod
    def init_app(app):
        pass

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = True
    
    # Increase rate limits for development
    RATELIMIT_DEFAULT = "1000 per day;200 per hour"

class TestingConfig(Config):
    TESTING = True
    
    # Disable rate limiting for testing
    RATELIMIT_ENABLED = False

# Configuration mapping for easy retrieval
config = {
    'production': ProductionConfig,
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}
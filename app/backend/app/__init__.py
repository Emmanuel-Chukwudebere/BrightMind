from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.utils.error_handlers import register_error_handlers
from app.utils.logger import setup_logging
from app.services.firebase_service import initialize_firebase
from app.config import config
from redis import Redis
from app.services.caching_service import init_cache, cache_content, get_cached_content

# Configure Redis
# redis = Redis(host='localhost', port=6379, db=0)

# Initialize limiter without app
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",
    default_limits=["200 per day", "50 per hour"]
)

def create_app(config_name='production'):
    """
    Create and configure the Flask application.
    """
    app = Flask(__name__)

    init_cache(app)

    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # Initialize Firebase Admin SDK
    initialize_firebase(app)

    # Enable Cross-Origin Resource Sharing (CORS) for API requests
    CORS(app)

    # Setup logging for debugging and monitoring
    setup_logging(app)

    # Setup rate limiting
    limiter.init_app(app)

    # Initialize caching
    # app.cache = init_cache(app)  # Attach cache to app for easy access

    # Register blueprints (modular routes)
    from app.routes.auth_routes import auth_bp
    from app.routes.lesson_routes import lesson_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.quiz_routes import quiz_bp
    from app.routes.streak_routes import streak_bp
    from app.routes.content_routes import content_bp
    from app.routes.home_routes import home_bp
    from app.routes.recommendation_routes import recommendation_bp
    from app.routes.search_routes import search_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(lesson_bp, url_prefix='/api/v1/lessons')
    app.register_blueprint(ai_bp, url_prefix='/api/v1/ai')
    app.register_blueprint(notification_bp, url_prefix='/api/v1/notifications')
    app.register_blueprint(quiz_bp, url_prefix='/api/v1/quiz')
    app.register_blueprint(streak_bp, url_prefix='/api/v1/streak')
    app.register_blueprint(content_bp, url_prefix='/api/v1/content')
    app.register_blueprint(home_bp, url_prefix='/api/v1/home')
    app.register_blueprint(recommendation_bp, url_prefix='/api/v1/recommendation')
    app.register_blueprint(search_bp, url_prefix='/api/v1/search')

    # Register error handlers (for global error handling)
    register_error_handlers(app)

    return app
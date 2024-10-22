from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.utils.error_handlers import register_error_handlers
from app.utils.logger import setup_logging
from app.services.firebase_service import initialize_firebase
from app.config import config

def create_app(config_name='production'):
    """
    Create and configure the Flask application.
    """
    app = Flask(__name__)

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
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )

    # Register blueprints (modular routes)
    from app.routes.auth_routes import auth_bp
    from app.routes.lesson_routes import lesson_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.notification_routes import notification_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(lesson_bp, url_prefix='/api/v1/lessons')
    app.register_blueprint(ai_bp, url_prefix='/api/v1/ai')
    app.register_blueprint(notification_bp, url_prefix='/api/v1/notifications')

    # Register error handlers (for global error handling)
    register_error_handlers(app)

    return app
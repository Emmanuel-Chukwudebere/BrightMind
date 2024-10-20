from flask import Flask
from flask_cors import CORS
from app.utils.error_handlers import register_error_handlers
from app.utils.logger import setup_logging
from app.services.firebase_service import initialize_firebase

def create_app():
    """
    Create and configure the Flask application.
    """
    app = Flask(__name__)

    # Load configuration (from environment or default to production)
    config_name = os.getenv('FLASK_ENV', 'production')
    app.config.from_object('config.' + config_name)

    # Initialize Firebase Admin SDK
    initialize_firebase(app)

    # Enable Cross-Origin Resource Sharing (CORS) for API requests
    CORS(app)

    # Setup logging for debugging and monitoring
    setup_logging(app)

    # Register blueprints (modular routes)
    from app.routes.auth_routes import auth_bp
    from app.routes.lesson_routes import lesson_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.notification_routes import notification_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(lesson_bp, url_prefix='/lessons')
    app.register_blueprint(ai_bp, url_prefix='/ai')
    app.register_blueprint(notification_bp, url_prefix='/notifications')

    # Register error handlers (for global error handling)
    register_error_handlers(app)

    return app

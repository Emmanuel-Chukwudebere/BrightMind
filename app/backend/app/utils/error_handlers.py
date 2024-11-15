from flask import jsonify
import logging

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.ERROR, format="%(asctime)s - %(levelname)s - %(message)s")

def register_error_handlers(app):
    """
    Register centralized error handlers for the Flask application.
    These handlers ensure that errors are logged and meaningful responses are sent to the client.
    """

    @app.errorhandler(400)
    def bad_request(error):
        """
        Handle 400 Bad Request errors.
        This is typically due to invalid input data.
        """
        logging.error(f"400 Bad Request: {str(error)}")
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        """
        Handle 401 Unauthorized errors.
        This occurs when authentication fails, such as invalid tokens.
        """
        logging.error(f"401 Unauthorized: {str(error)}")
        return jsonify({"error": "Unauthorized", "message": "Authentication is required."}), 401

    @app.errorhandler(403)
    def forbidden(error):
        """
        Handle 403 Forbidden errors.
        This occurs when a user attempts to access a resource they do not have permission to.
        """
        logging.error(f"403 Forbidden: {str(error)}")
        return jsonify({"error": "Forbidden", "message": "You do not have permission to access this resource."}), 403

    @app.errorhandler(404)
    def not_found(error):
        """
        Handle 404 Not Found errors.
        This occurs when the requested resource does not exist.
        """
        logging.error(f"404 Not Found: {str(error)}")
        return jsonify({"error": "Not Found", "message": "The requested resource could not be found."}), 404

    @app.errorhandler(429)
    def too_many_requests(error):
        """
        Handle 429 Too Many Requests errors.
        This occurs when rate limits are exceeded.
        """
        logging.error(f"429 Too Many Requests: {str(error)}")
        return jsonify({"error": "Too Many Requests", "message": "You have made too many requests. Please try again later."}), 429

    @app.errorhandler(500)
    def internal_server_error(error):
        """
        Handle 500 Internal Server Error.
        This is a general-purpose error for unhandled exceptions.
        """
        logging.error(f"500 Internal Server Error: {str(error)}")
        return jsonify({"error": "Server Error", "message": "An unexpected error occurred. Please try again later."}), 500

    @app.errorhandler(503)
    def service_unavailable(error):
        """
        Handle 503 Service Unavailable errors.
        This occurs when external services or resources are unavailable.
        """
        logging.error(f"503 Service Unavailable: {str(error)}")
        return jsonify({"error": "Service Unavailable", "message": "The service is temporarily unavailable. Please try again later."}), 503
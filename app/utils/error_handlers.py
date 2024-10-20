def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return {"error": "Bad Request", "message": str(error)}, 400

    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Not Found", "message": str(error)}, 404

    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"Server Error: {str(error)}")
        return {"error": "Server Error", "message": "Something went wrong!"}, 500

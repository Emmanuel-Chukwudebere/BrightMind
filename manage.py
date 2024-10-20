from app import create_app
import os

# Create an instance of the Flask app using the factory pattern
app = create_app()

if __name__ == "__main__":
    # Define the port and debug mode
    port = int(os.getenv("PORT", 5000))  # Default port is 5000 if not specified
    debug = os.getenv("FLASK_ENV", "production") == "development"  # Run in debug mode if FLASK_ENV=development

    # Run the Flask application
    app.run(host="0.0.0.0", port=port, debug=debug)

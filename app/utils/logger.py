import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    """
    Configure logging for the Flask app.
    Logs are saved to both console and a rotating file to avoid large log files.
    
    Log levels:
    - INFO: General app flow.
    - WARNING: Suspicious activity or potential issues.
    - ERROR: Critical failures or unexpected errors.
    """
    # Set log formatting and level
    log_format = "%(asctime)s - %(levelname)s - %(message)s"
    logging.basicConfig(level=logging.INFO, format=log_format)
    
    # Create a rotating file handler to log to a file with rotation to avoid oversized log files
    file_handler = RotatingFileHandler('app.log', maxBytes=2000000, backupCount=5)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(log_format))
    
    # Add the file handler to the app logger
    app.logger.addHandler(file_handler)
    
    # Also log to the console for immediate output
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter(log_format))
    
    app.logger.addHandler(console_handler)
    
    app.logger.info("Logging setup complete. Logs are being written to app.log and console.")

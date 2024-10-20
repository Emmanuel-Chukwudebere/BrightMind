import logging

def setup_logging(app):
    logging.basicConfig(level=logging.INFO, filename="app.log", filemode="a",
                        format="%(asctime)s - %(levelname)s - %(message)s")
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)

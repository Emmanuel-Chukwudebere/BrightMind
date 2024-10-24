from app import create_app
import os
from flask_script import Manager, Shell

# Create an instance of the Flask app using the factory pattern
app = create_app(os.getenv('FLASK_CONFIG') or 'default')
manager = Manager(app)

def make_shell_context():
    return dict(app=app)

manager.add_command("shell", Shell(make_context=make_shell_context))

if __name__ == "__main__":
    manager.run()
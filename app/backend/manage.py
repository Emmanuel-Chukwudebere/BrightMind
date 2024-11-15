from app import create_app
import os
from flask.cli import FlaskGroup
import click
import unittest
from flask import current_app

# Create the app instance
app = create_app(os.getenv('FLASK_CONFIG') or 'default')

# Define a custom CLI group
cli = FlaskGroup(create_app=lambda: app)

# Recreating the shell context
@app.shell_context_processor
def make_shell_context():
    return dict(app=app)

# Define a custom command to show routes
@cli.command("routes")
def show_routes():
    """Show all routes in the application."""
    output = []
    for rule in current_app.url_map.iter_rules():
        line = f"{rule.endpoint:50} {rule.methods} {rule}"
        output.append(line)
    click.echo("\n".join(output))

# Define a custom command to run tests
@cli.command("test")
@click.argument("test_name", required=False, default="")
def run_tests(test_name):
    """Run tests. Optionally, specify a single test file or test case."""
    test_loader = unittest.TestLoader()
    
    # Print the current working directory for debugging
    click.echo(f"Current working directory: {os.getcwd()}")
    
    if test_name:
        # If a specific test name is provided, load it directly
        click.echo(f"Running specific test: {test_name}")
        tests = test_loader.loadTestsFromName(test_name)
    else:
        # Discover all tests in the 'tests' directory
        click.echo("Discovering tests in the 'tests' directory...")
        tests = test_loader.discover(start_dir='tests', pattern='test_*.py')
    
    # Show tests found (debugging)
    click.echo(f"Tests found: {tests}")

    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(tests)
    if result.wasSuccessful():
        exit(0)
    exit(1)

# Define a command to reset the database (use with caution in production)
@cli.command("db_reset")
def reset_database():
    """Reset the database by dropping and recreating all tables (use with caution)."""
    from app import db
    click.confirm(
        "Are you sure you want to reset the database? This will delete all data.",
        abort=True,
    )
    db.drop_all()
    db.create_all()
    click.echo("Database reset complete.")

if __name__ == '__main__':
    cli()

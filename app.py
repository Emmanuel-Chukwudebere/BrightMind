from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase
cred = credentials.Certificate("path/to/your/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

app = Flask(__name__)

# Basic Route for Testing
@app.route('/')
def home():
    return "Welcome to BrightMind API!"

if __name__ == '__main__':
    app.run(debug=True)

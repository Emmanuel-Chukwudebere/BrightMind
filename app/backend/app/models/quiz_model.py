from app.services.firebase_service import db
# from app.models.content_model import fetch_random_quiz
from firebase_admin import firestore
import random

def generate_quiz(user_id, lesson_id, num_questions=15):
    """
    Generates a new quiz for a lesson. Dynamically selects questions and supports
    multiple formats (multiple-choice, single-pick, and text input).

    Args:
        user_id (str): The user's ID.
        lesson_id (str): The ID of the lesson for which the quiz is generated.
        num_questions (int): The number of questions to include in the quiz.

    Returns:
        str: The generated quiz ID.
    """
    lesson_ref = db.collection('lessons').document(lesson_id)
    lesson = lesson_ref.get()

    if not lesson.exists:
        return None

    questions = lesson.to_dict().get('questions', [])
    
    # Randomly select questions for the quiz
    selected_questions = random.sample(questions, min(len(questions), num_questions))
    
    quiz_data = {
        'user_id': user_id,
        'lesson_id': lesson_id,
        'questions': selected_questions,
        'completed': False,
        'score': None,
        'created_at': firestore.SERVER_TIMESTAMP
    }

    quiz_ref = db.collection('users').document(user_id).collection('quizzes').document()
    quiz_ref.set(quiz_data)
    
    return quiz_ref.id

def fetch_quiz(user_id, quiz_id):
    """
    Fetches a quiz in progress or completed for the user.

    Args:
        user_id (str): The user's ID.
        quiz_id (str): The quiz ID.

    Returns:
        dict: The quiz data if found.
    """
    quiz_ref = db.collection('users').document(user_id).collection('quizzes').document(quiz_id)
    quiz = quiz_ref.get()
    
    return quiz.to_dict() if quiz.exists else None

def submit_quiz(user_id, quiz_id, answers):
    """
    Submits the user's answers and calculates the score for the quiz.

    Args:
        user_id (str): The user's ID.
        quiz_id (str): The quiz ID.
        answers (dict): The user's submitted answers.

    Returns:
        float: The quiz score in percentage.
    """
    quiz_ref = db.collection('users').document(user_id).collection('quizzes').document(quiz_id)
    quiz = quiz_ref.get()

    if not quiz.exists:
        return None
    
    quiz_data = quiz.to_dict()
    questions = quiz_data.get('questions', [])
    
    # Calculate score
    correct_answers = 0
    total_questions = len(questions)
    
    for question in questions:
        correct_answer = question.get('correct_answer')
        user_answer = answers.get(question['id'])
        if correct_answer == user_answer:
            correct_answers += 1

    score = (correct_answers / total_questions) * 100
    quiz_ref.update({
        'completed': True,
        'score': score
    })
    
    return score

def reset_quiz(user_id, quiz_id):
    """
    Resets the user's quiz, allowing them to retake or practice.

    Args:
        user_id (str): The user's ID.
        quiz_id (str): The quiz ID.
    """
    quiz_ref = db.collection('users').document(user_id).collection('quizzes').document(quiz_id)
    quiz_ref.update({'completed': False, 'score': None})

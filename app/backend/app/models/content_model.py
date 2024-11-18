from app.services.firebase_service import db
from app.services.caching_service import cache_content, get_cached_content
from app.services.api_service import generate_topic_summary, generate_lessons, generate_quizzes
import logging
from typing import Dict, List, Any
import time
from google.cloud.firestore_v1.transforms import DELETE_FIELD

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class ContentGenerationError(Exception):
    """Custom exception for content generation errors"""
    pass

def sanitize_for_firestore(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitizes data structure to ensure compatibility with Firestore.
    Converts nested arrays into maps/dictionaries.
    
    Args:
        data: Dictionary containing the data to sanitize
    Returns:
        Sanitized dictionary safe for Firestore storage
    """
    if not isinstance(data, dict):
        return data
    
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, list):
            # Convert lists to dictionaries with numeric keys
            sanitized[key] = {str(i): item for i, item in enumerate(value)}
        elif isinstance(value, dict):
            sanitized[key] = sanitize_for_firestore(value)
        else:
            sanitized[key] = value
    return sanitized

def generate_content(user_id: str, topic: str, level: str) -> Dict[str, Any]:
    """
    Generates content with improved error handling and Firestore compatibility.
    
    Args:
        user_id: ID of the user requesting the content
        topic: The topic for content generation
        level: Difficulty level selected by the user
    
    Returns:
        Dictionary with generated content
    
    Raises:
        ContentGenerationError: If content generation fails
    """
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds

    # Check cache first
    cached_content = get_cached_content(topic)
    if cached_content:
        logging.info(f"Content for '{topic}' found in cache.")
        return cached_content

    logging.info(f"Generating content for topic '{topic}' at '{level}' level.")

    try:
        # Generate topic summary with retries
        for attempt in range(MAX_RETRIES):
            try:
                summary = generate_topic_summary(topic, level)
                break
            except Exception as e:
                if attempt == MAX_RETRIES - 1:
                    raise ContentGenerationError(f"Failed to generate summary after {MAX_RETRIES} attempts: {str(e)}")
                time.sleep(RETRY_DELAY)

        # Initialize content containers
        lesson_outlines = []
        lesson_contents = []
        quizzes = []

        # Generate three lessons with retries
        for i in range(3):
            outline = f"Lesson {i + 1} Outline for {topic} at {level} level"
            
            # Generate lesson content with retries
            for attempt in range(MAX_RETRIES):
                try:
                    # Pass outline as the third argument to generate_lessons
                    lesson_content = generate_lessons(topic, level, outline)
                    # Generate quiz based on lesson content instead of just outline
                    lesson_quiz = generate_quizzes(lesson_content)
                    break
                except Exception as e:
                    if attempt == MAX_RETRIES - 1:
                        raise ContentGenerationError(f"Failed to generate lesson {i + 1} after {MAX_RETRIES} attempts: {str(e)}")
                    time.sleep(RETRY_DELAY)
            
            lesson_outlines.append(outline)
            lesson_contents.append(lesson_content)
            quizzes.append(lesson_quiz)

        # Structure the content
        content = {
            'summary': summary,
            'lesson_outlines': lesson_outlines,
            'lessons': lesson_contents,
            'quizzes': quizzes,
            'level': level,
            'user_id': user_id,
            'timestamp': time.time(),
            'status': 'completed'
        }

        # Sanitize content for Firestore
        sanitized_content = sanitize_for_firestore(content)
        
        # Save to Firestore with retry logic
        for attempt in range(MAX_RETRIES):
            try:
                content_ref = db.collection('content').document(f"{topic}_{level}")
                content_ref.set(sanitized_content, merge=True)
                break
            except Exception as e:
                if attempt == MAX_RETRIES - 1:
                    logging.error(f"Failed to save to Firestore: {str(e)}")
                    # Don't raise here - we can still return the content even if saving fails
                time.sleep(RETRY_DELAY)

        # Cache the content
        cache_content(topic, content)
        
        logging.info(f"Content generation for '{topic}' completed successfully.")
        return content

    except ContentGenerationError as e:
        logging.error(f"Content generation error: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error in content generation: {str(e)}")
        raise ContentGenerationError(f"Failed to generate content: {str(e)}")

def fetch_content(user_id: str, topic: str, level: str) -> Dict[str, Any]:
    """
    Fetch content with improved error handling and validation.
    
    Args:
        user_id: ID of the user requesting the content
        topic: The topic for content retrieval
        level: Difficulty level selected by the user
    
    Returns:
        Dictionary containing the requested content
    
    Raises:
        ValueError: If input parameters are invalid
        ContentGenerationError: If content cannot be retrieved or generated
    """
    # Input validation
    if not isinstance(topic, str) or not topic.strip():
        raise ValueError("Topic must be a non-empty string")
    
    valid_levels = {'beginner', 'intermediate', 'advanced'}
    if level not in valid_levels:
        raise ValueError(f"Level must be one of: {', '.join(valid_levels)}")

    try:
        # Try to fetch from Firestore
        content_ref = db.collection('content').document(f"{topic}_{level}")
        content_doc = content_ref.get()
        
        if content_doc.exists:
            content = content_doc.to_dict()
            # Verify content completeness
            required_fields = {'summary', 'lessons', 'quizzes', 'level'}
            if all(field in content for field in required_fields):
                logging.info(f"Retrieved existing content for '{topic}' from Firestore")
                return content
        
        # Generate new content if not found or incomplete
        logging.info(f"Generating new content for '{topic}' at '{level}' level")
        return generate_content(user_id, topic, level)
        
    except Exception as e:
        logging.error(f"Error in fetch_content: {str(e)}")
        raise ContentGenerationError(f"Unable to retrieve or generate content for topic '{topic}'") from e
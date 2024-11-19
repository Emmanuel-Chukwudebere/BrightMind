# app/services/api_service.py

import time
from urllib import response
import requests
import re
import os
import logging
from time import sleep
import random
from typing import List, Dict, Union, Optional

# Configure logging for error tracking and debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Environment variables for API keys
HF_API_KEY = os.getenv('HUGGING_FACE_API_KEY')
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
FCM_SERVER_KEY = os.getenv("FCM_SERVER_KEY")

RETRY_ATTEMPTS = 3
RETRY_BACKOFF = 2
headers = {
    "Authorization": "Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def retry_request(url, headers, payload, retries=3, backoff_factor=2):
    delay = 1  # Initial delay
    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()  # Raises HTTPError for bad responses
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 503 and attempt < retries - 1:
                print(f"503 Error. Retrying in {delay} seconds...")
                time.sleep(delay)
                delay *= backoff_factor
            else:
                print(f"Request failed: {e}")
                return {"error": "Service unavailable, please try again later."}
    return {"error": "Max retries exceeded."}

# Language code mapping for T5-BASE
LANGUAGE_CODES = {
    'swahili': 'swh_Latn',
    'yoruba': 'yor_Latn',
    'igbo': 'ibo_Latn',
    'hausa': 'hau_Latn',
    'amharic': 'amh_Ethi',
    'zulu': 'zul_Latn',
    'english': 'eng_Latn'
    # Add more as needed
}

def translate_text(text: str, target_language: str) -> str:
    """
    Translates text using T5-BASE model.
    """
    url = "https://api-inference.huggingface.co/models/google-t5/t5-base"
    target_lang_code = LANGUAGE_CODES.get(target_language.lower(), 'eng_Latn')
    
    try:
        response = requests.post(
            url,
            headers=headers,
            json={
                "inputs": text,
                "parameters": {
                    "source_lang": "eng_Latn",
                    "target_lang": target_lang_code
                }
            }
        )
        response.raise_for_status()
        return response.json()[0]["translation_text"]
    except Exception as e:
        print(f"Translation failed: {str(e)}")
        return text

def ask_ai(question, context=None, input_format="text"):
    """
    Handles AI response generation based on input type (voice or text).
    Uses BlenderBot for conversational responses and falls back to Mistral-7B 
    if no relevant answer is found in the generated lesson content.
    
    Args:
        question (str): The question asked by the user.
        context (str): Lesson content context to check for relevant answers.
        input_format (str): The format of the input ('text' or 'voice').

    Returns:
        tuple: (response, headers) - Returns text or audio based on input format.
    """

    # Step 1: Check if the answer exists in the provided context (lesson content).
    if context and question.lower() in context.lower():
        answer = context  # Answer directly from the context if found
    else:
        # Step 2: Use BlenderBot for conversation; if unavailable, fallback to FLAN-T5
        bb_url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
        mistral_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

        def request_blenderbot():
            """
            Makes a request to BlenderBot for conversational AI response.
            """
            response = requests.post(bb_url, headers=headers, json={"inputs": question})
            response.raise_for_status()
            return response.json().get("generated_text", "")

        # Attempt to get an answer from BlenderBot
        answer = retry_request(request_blenderbot)

        # If BlenderBot returns nothing, fallback to Mistral 7B
        if not answer:
            logging.info("BlenderBot did not provide an answer. Falling back to Mistral-7B.")
            def request_mistral_7b():
                """
                Makes a request to Mistral-7B for fallback response generation.
                """
                response = requests.post(mistral_url, headers=headers, json={"inputs": question})
                response.raise_for_status()
                return response.json().get("generated_text", "I'm here to help!")

            answer = retry_request(request_mistral_7b)

    # Step 3: Output format based on input format (voice or text)
    if input_format == "voice":
        # Convert text answer to audio using text-to-speech (TTS)
        tts_audio = text_to_speech(answer)
        if tts_audio:
            return tts_audio, {'Content-Type': 'audio/mpeg'}
        else:
            logging.error("Text-to-Speech failed.")
            return "Audio generation failed.", {'Content-Type': 'text/plain'}
    else:
        # Return text answer if input format was text
        return answer, {'Content-Type': 'text/plain'}

def robust_parse_response(text: str, topic: str) -> tuple[str, List[str]]:
    """
    More robust parsing of the model's response
    
    Args:
        text (str): Full model response text
        topic (str): Topic being generated
    
    Returns:
        tuple of summary and lesson outlines
    """
    # Extract content between [/INST] tags
    content_match = re.search(r'\[/INST\](.*)', text, re.DOTALL)
    if not content_match:
        return f"Failed to generate summary for {topic}", [
            f"Lesson 1: Introduction to {topic}",
            f"Lesson 2: Core Concepts of {topic}",
            f"Lesson 3: Advanced {topic} Topics"
        ]
    
    content = content_match.group(1).strip()
    
    # More robust summary extraction
    summary_match = re.search(r'SUMMARY:\s*(.+?)(?=Lesson 1:|$)', content, re.DOTALL)
    summary = summary_match.group(1).strip() if summary_match else f"Core concepts of {topic}"
    
    # Extract lesson outlines
    lesson_matches = re.findall(r'(Lesson \d+:.*?)(?=Lesson \d+:|$)', content, re.DOTALL)
    outlines = lesson_matches[:3] if lesson_matches else [
        f"Lesson 1: Introduction to {topic}",
        f"Lesson 2: Core Concepts of {topic}",
        f"Lesson 3: Advanced {topic} Topics"
    ]
    
    # Clean up outlines
    outlines = [outline.strip() for outline in outlines]
    
    return summary, outlines

def generate_topic_summary(
    topic: str, 
    level: str, 
    language: str = 'english', 
    api_url: str = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    headers: dict = None
) -> tuple[str, List[str]]:
    """
    More robust summary generation with improved error handling and fallback
    
    Args:
        topic (str): The topic to generate content for
        level (str): Difficulty level of the content
        language (str): Target language for content
        api_url (str): Inference API URL
        headers (dict): API request headers
        
    Returns:
        tuple[str, List[str]]: Summary and list of outlines
    """
    # Comprehensive prompt with clear instructions
    prompt = (
        "<s>[INST] "
        f"You are an expert educational content creator focusing on {topic} at a {level} level. "
        f"Create a comprehensive overview of {topic}.\n\n"
        "REQUIREMENTS:\n"
        f"- Write a concise SUMMARY of {topic} in 2-3 sentences\n"
        "- Include 3 detailed lesson outlines\n"
        "- Ensure content is precise, educational, and beginner-friendly\n"
        "FORMAT:\n"
        "SUMMARY: [Your summary here]\n"
        "Lesson 1: [Title]\n"
        "Lesson 2: [Title]\n"
        "Lesson 3: [Title]\n"
        "[/INST]"
    )
    
    # Default retry configuration
    max_attempts = 5
    base_delay = 1  # Base delay between retries
    
    for attempt in range(max_attempts):
        try:
            # Add randomness to reduce predictability
            current_delay = base_delay * (2 ** attempt) + random.random()
            
            # Make API request with more robust parameters
            response = requests.post(
                api_url,
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 512,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "repetition_penalty": 1.1,
                        "stop": ["[/INST]"],
                        "do_sample": True  # Enable sampling for more varied outputs
                    }
                },
                timeout=10  # Add request timeout
            )
            response.raise_for_status()
            
            # Extract generated text
            generated_text = response.json()[0]["generated_text"]
            
            # Parse response with more flexible parsing
            summary, outlines = robust_parse_response(generated_text, topic)
            
            # More flexible validation
            if summary and len(outlines) >= 1:
                # Ensure we have 3 outlines, even if parsing was partial
                while len(outlines) < 3:
                    outlines.append(f"Lesson {len(outlines) + 1}: Additional {topic} Topics")
                
                return summary, outlines[:3]
            
            logging.warning(f"Attempt {attempt + 1}: Insufficient content generated")
        
        except requests.exceptions.RequestException as e:
            logging.error(f"API Request Error on attempt {attempt + 1}: {str(e)}")
        except Exception as e:
            logging.error(f"Unexpected error on attempt {attempt + 1}: {str(e)}")
        
        # Exponential backoff with jitter
        time.sleep(current_delay)
    
    # Comprehensive fallback
    fallback_summary = f"A comprehensive overview of {topic} at {level} level"
    fallback_outlines = [
        f"Lesson 1: Introduction to {topic}",
        f"Lesson 2: Core Concepts of {topic}",
        f"Lesson 3: Advanced {topic} Topics"
    ]
    
    logging.warning(f"Failed to generate summary for {topic}. Returning fallback content.")
    return fallback_summary, fallback_outlines

def generate_lessons(
    topic: str, 
    outlines: List[str], 
    level: str, 
    language: str = 'english',
    api_url: str = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    headers: dict = None
) -> List[str]:
    """
    Improved lesson generation with robust error handling
    
    Args:
        topic (str): The main topic for the lessons
        outlines (List[str]): List of lesson outlines
        level (str): Difficulty level of the content
        language (str): Target language for content
        api_url (str): Inference API URL
        headers (dict): API request headers
        
    Returns:
        List[str]: Generated lesson content
    """
    def generate_single_lesson(outline: str) -> str:
        """Generate content for a single lesson"""
        prompt = (
            "<s>[INST] "
            f"Create a comprehensive {level} level lesson about the topic:\n"
            f"{outline}\n\n"
            "DETAILED REQUIREMENTS:\n"
            "1. Provide clear, structured explanations\n"
            "2. Include practical, easy-to-understand examples\n"
            "3. Break down complex concepts into digestible parts\n"
            "4. Conclude with key takeaways\n"
            "5. Ensure content is engaging and educational\n"
            "[/INST]"
        )
        
        try:
            response = requests.post(
                api_url,
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 1024,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "repetition_penalty": 1.1,
                        "stop": ["[/INST]"]
                    }
                }
            )
            response.raise_for_status()
            
            # Extract and clean generated text
            lesson_content = response.json()[0]["generated_text"]
            content_match = re.search(r'\[/INST\](.*)', lesson_content, re.DOTALL)
            
            return (
                f"{outline}\n\n"
                f"{content_match.group(1).strip() if content_match else 'Lesson generation failed.'}"
            )
        
        except Exception as e:
            print(f"Lesson generation failed: {str(e)}")
            return f"{outline}\n\nLesson generation failed due to an error."
    
    # Generate lessons with minimal delay
    lessons = [generate_single_lesson(outline) for outline in outlines]
    return lessons


def generate_quizzes(lesson_content: str) -> List[Dict[str, Union[str, List[str], str]]]:
    """
    Generates multiple-choice quiz questions using Mistral-7B.
    
    Args:
        topic (str): The topic for which quiz questions are generated.
        
    Returns:
        list: List of formatted questions with answer choices and correct answers.
    """
    url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
    
    def format_mistral_prompt(instruction: str) -> str:
        """Formats the prompt in Mistral's expected style"""
        return f"<s>[INST] {instruction} [/INST]"
    
    def parse_quiz_response(text: str) -> List[Dict[str, Union[str, List[str], str]]]:
        """Parses Mistral's response into structured quiz format"""
        questions = []
        current_question = None
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('Q:') or line.startswith('Question:'):
                if current_question:
                    questions.append(current_question)
                current_question = {
                    "question": line.split(':', 1)[1].strip(),
                    "type": "multiple_choice",
                    "choices": [],
                    "correct_answer": None
                }
            elif line.startswith(('A)', 'B)', 'C)', 'D)')) and current_question:
                choice = line[2:].strip()
                current_question["choices"].append(choice)
            elif line.startswith('Correct:') and current_question:
                answer_letter = line.split(':')[1].strip().upper()
                if answer_letter in ['A', 'B', 'C', 'D'] and len(current_question["choices"]) >= ord(answer_letter) - ord('A') + 1:
                    current_question["correct_answer"] = current_question["choices"][ord(answer_letter) - ord('A')]
        
        if current_question:
            questions.append(current_question)
            
        return [q for q in questions if len(q["choices"]) == 4 and q["correct_answer"]]
    
    def request_questions(batch_size: int = 3) -> List[Dict[str, Union[str, List[str], str]]]:
        """Requests a batch of questions from Mistral"""
        prompt = format_mistral_prompt(
            f"Generate {batch_size} multiple-choice questions about {lesson_content}. "
            "For each question:\n"
            "1. Start with 'Q:'\n"
            "2. Provide 4 options labeled A) B) C) D)\n"
            "3. Indicate the correct answer as 'Correct: X'\n"
            "Make questions that test understanding, not just facts.\n"
            "Focus on important concepts."
        )
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 512,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "return_full_text": False
                    }
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, list) and data:
                return parse_quiz_response(data[0].get("generated_text", ""))
            elif isinstance(data, dict):
                return parse_quiz_response(data.get("generated_text", ""))
            return []
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            return []
    
    def retry_request(batch_size: int = 3) -> List[Dict[str, Union[str, List[str], str]]]:
        """Implements retry logic with exponential backoff"""
        max_attempts = 3
        base_delay = 1
        
        for attempt in range(max_attempts):
            questions = request_questions(batch_size)
            if questions:
                return questions
                
            print(f"Attempt {attempt + 1} failed.")
            if attempt < max_attempts - 1:
                delay = base_delay * (2 ** attempt)
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
        
        return []
    
    # Generate questions in smaller batches
    total_questions = 10
    quiz_pool = []
    batch_size = 3  # Smaller batch size for more reliable generation
    
    for i in range(0, total_questions, batch_size):
        questions_batch = retry_request(batch_size)
        quiz_pool.extend(questions_batch)
        
        if len(quiz_pool) >= total_questions:
            break
            
        time.sleep(2)  # Rate limiting
    
    # Fallback question if generation fails
    if not quiz_pool:
        return [{
            "question": f"What is the most important concept in {lesson_content}?",
            "type": "multiple_choice",
            "choices": [
                "Core principles and fundamentals",
                "Historical development",
                "Practical applications",
                "Advanced theoretical concepts"
            ],
            "correct_answer": "Core principles and fundamentals"
        }]
    
    random.shuffle(quiz_pool)
    return quiz_pool[:total_questions]

# def search_web(query):
    """
    Searches the web using Google Custom Search as a fallback.
    
    Args:
        query (str): The search query.
    
    Returns:
        list: List of search results with titles and links.
    """
    # url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}"
    
    # def request():
        # response = requests.get(url)
        # response.raise_for_status()
        # return response.json().get("items", [])
    
    # return retry_request(request) or [{"title": "Search failed", "link": ""}]

def text_to_speech(text):
    """
    Converts text to speech using Tacotron 2 and WaveGlow.
    """
    tacotron_url = "https://api-inference.huggingface.co/models/facebook/tacotron2"
    waveglow_url = "https://api-inference.huggingface.co/models/facebook/waveglow"
    
    def request_tacotron():
        response = requests.post(tacotron_url, headers=headers, json={"inputs": text})
        response.raise_for_status()
        return response.content
    
    def request_waveglow(audio):
        response = requests.post(waveglow_url, headers=headers, json={"inputs": audio})
        response.raise_for_status()
        return response.content

    tacotron_audio = retry_request(request_tacotron)
    if tacotron_audio:
        return retry_request(request_waveglow, tacotron_audio)
    return None

def speech_to_text(audio_data):
    """
    Converts speech (audio) to text using Wav2Vec 2.0.
    """
    url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h"
    files = {"file": audio_data}
    
    def request():
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
        return response.json().get("text", "Transcription failed.")
    
    return retry_request(request)

def send_fcm_notification(user_token, title, body):
    """
    Sends a push notification using FCM HTTP v1 API.
    
    Args:
        user_token (str): The target user's FCM token.
        title (str): The title of the notification.
        body (str): The message body.

    Returns:
        dict: FCM response or error message.
    """
    url = "https://fcm.googleapis.com/v1/projects/brightmind-1/messages:send"
    headers = {
        "Authorization": f"Bearer " + FCM_SERVER_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "message": {
            "token": user_token,
            "notification": {
                "title": title,
                "body": body
            }
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as err:
        logging.error(f"HTTP error occurred: {err}")
        return {"error": str(err)}
    except Exception as err:
        logging.error(f"Error sending FCM notification: {err}")
        return {"error": str(err)}
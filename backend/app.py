# backend/app.py
"""
Flask Backend Server
Handles API requests and communicates with Claude AI
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from anthropic import Anthropic
from config import Config
from prompts import create_evaluation_prompt, get_mock_evaluation

# Initialize Flask app
app = Flask(__name__)

# Enable CORS (allows frontend to communicate with backend)
CORS(app)

# Validate configuration
Config.validate()

# Initialize Claude client (only if not in demo mode)
if not Config.DEMO_MODE:
    client = Anthropic(api_key=Config.ANTHROPIC_API_KEY)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint - confirms server is running"""
    return jsonify({
        'status': 'healthy',
        'demo_mode': Config.DEMO_MODE,
        'message': 'AI Interview Coach API is running! 🚀'
    })


@app.route('/api/evaluate', methods=['POST'])
def evaluate_answer():
    """
    Main endpoint: Evaluates interview answers
    
    Expected JSON body:
    {
        "question": "What is polymorphism?",
        "answer": "Polymorphism is...",
        "jobRole": "Software Engineer"
    }
    
    Returns: Evaluation with score, strengths, weaknesses, etc.
    """
    
    try:
        # Get data from request
        data = request.get_json()
        
        # Validate required fields
        if not data or 'question' not in data or 'answer' not in data:
            return jsonify({
                'error': 'Missing required fields: question and answer'
            }), 400
        
        question = data['question']
        answer = data['answer']
        job_role = data.get('jobRole', 'Software Engineer')
        
        # Validate answer is not empty
        if not answer.strip():
            return jsonify({
                'error': 'Answer cannot be empty'
            }), 400
        
        # DEMO MODE: Return mock evaluation (FREE, no API call)
        if Config.DEMO_MODE:
            print("🎭 DEMO MODE: Generating mock evaluation...")
            evaluation = get_mock_evaluation(question, answer)
            return jsonify(evaluation)
        
        # REAL MODE: Call Claude API
        print(f"🤖 Calling Claude API for evaluation...")
        
        # Create the evaluation prompt
        prompt = create_evaluation_prompt(question, answer, job_role)
        
        # Call Claude API
        response = client.messages.create(
            model=Config.CLAUDE_MODEL,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Extract the response text
        response_text = response.content[0].text
        
        # Parse JSON from Claude's response
        try:
            evaluation = json.loads(response_text)
            evaluation['demo_mode'] = False
            return jsonify(evaluation)
            
        except json.JSONDecodeError:
            # If Claude didn't return valid JSON, return the raw text
            return jsonify({
                'error': 'Failed to parse AI response',
                'raw_response': response_text
            }), 500
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/api/questions', methods=['GET'])
def get_sample_questions():
    """Returns sample interview questions for different categories"""
    
    questions = {
        'technical': [
            "Explain the difference between == and === in JavaScript",
            "What is the difference between SQL and NoSQL databases?",
            "Explain how HTTP and HTTPS work",
            "What is the difference between a stack and a queue?",
            "Explain object-oriented programming principles"
        ],
        'behavioral': [
            "Tell me about a time you faced a difficult bug. How did you solve it?",
            "Describe a situation where you had to work with a difficult team member",
            "Tell me about a project you're proud of",
            "How do you handle tight deadlines?",
            "Describe a time when you had to learn a new technology quickly"
        ],
        'system_design': [
            "Design a URL shortening service like bit.ly",
            "How would you design Instagram?",
            "Design a rate limiter for an API",
            "How would you design a cache system?",
            "Design a notification system"
        ]
    }
    
    return jsonify(questions)


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 AI Interview Coach Backend Starting...")
    print("="*50)
    print(f"📍 Server: http://{Config.HOST}:{Config.PORT}")
    print(f"🎭 Demo Mode: {'ON' if Config.DEMO_MODE else 'OFF'}")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=Config.PORT, debug=False)  # Changed for deployment

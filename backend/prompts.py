# backend/prompts.py
"""
AI Prompts for evaluating interview answers
This is where the "intelligence" of the evaluation happens
"""

def create_evaluation_prompt(question: str, user_answer: str, job_role: str = "Software Engineer") -> str:
    """
    Creates a structured prompt for Claude to evaluate interview answers
    
    Args:
        question: The interview question asked
        user_answer: The candidate's answer
        job_role: The role being interviewed for
    
    Returns:
        Formatted prompt string
    """
    
    prompt = f"""You are an expert technical interviewer evaluating a candidate for a {job_role} position.

**Interview Question:**
{question}

**Candidate's Answer:**
{user_answer}

**Your Task:**
Evaluate this answer professionally and provide structured feedback in the following JSON format:

{{
    "score": <number 0-100>,
    "grade": "<letter grade A-F>",
    "strengths": [
        "<strength 1>",
        "<strength 2>",
        "<strength 3>"
    ],
    "weaknesses": [
        "<weakness 1>",
        "<weakness 2>",
        "<weakness 3>"
    ],
    "improved_answer": "<a well-structured, comprehensive answer that demonstrates best practices>",
    "tips": [
        "<tip 1>",
        "<tip 2>",
        "<tip 3>"
    ],
    "keywords_missing": [
        "<important concept/keyword they should have mentioned>"
    ]
}}

**Evaluation Criteria:**
1. **Technical Accuracy** (30%) - Is the answer technically correct?
2. **Completeness** (25%) - Does it cover all important aspects?
3. **Clarity** (20%) - Is it well-structured and easy to understand?
4. **Examples** (15%) - Does it include relevant examples?
5. **Depth** (10%) - Does it show deep understanding?

**Scoring Guide:**
- 90-100 (A): Excellent answer, would impress any interviewer
- 80-89 (B): Good answer, minor improvements needed
- 70-79 (C): Decent answer, several gaps to address
- 60-69 (D): Weak answer, needs significant improvement
- Below 60 (F): Poor answer, fundamental misunderstandings

Be constructive and encouraging. Focus on helping the candidate improve.

Return ONLY the JSON object, no additional text."""

    return prompt


def get_mock_evaluation(question: str, user_answer: str) -> dict:
    """
    Returns a realistic mock evaluation (for demo mode - FREE)
    This allows users to test the app without an API key
    
    Args:
        question: The interview question
        user_answer: User's answer
    
    Returns:
        Mock evaluation dictionary
    """
    
    # Calculate a simple score based on answer length (just for demo)
    word_count = len(user_answer.split())
    
    if word_count < 20:
        score = 55
        grade = "F"
    elif word_count < 50:
        score = 68
        grade = "D"
    elif word_count < 100:
        score = 78
        grade = "C"
    elif word_count < 150:
        score = 85
        grade = "B"
    else:
        score = 92
        grade = "A"
    
    return {
        "score": score,
        "grade": grade,
        "strengths": [
            "You demonstrated basic understanding of the concept",
            "Your answer was structured logically",
            "You attempted to provide relevant information"
        ],
        "weaknesses": [
            "Could include more specific technical details",
            "Missing some key industry terminology",
            "Would benefit from a concrete example"
        ],
        "improved_answer": f"Here's an improved version: {question} - A comprehensive answer would include: 1) Clear definition of the concept, 2) Real-world application examples, 3) Best practices and common pitfalls, 4) How it relates to the broader system architecture. For instance, you could explain the core principles, then walk through a specific use case from a project you've worked on, highlighting the decisions you made and why.",
        "tips": [
            "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
            "Always include a specific example from your experience",
            "Mention relevant technologies and tools you've used"
        ],
        "keywords_missing": [
            "scalability",
            "performance optimization",
            "best practices"
        ],
        "demo_mode": True,
        "message": "🎭 DEMO MODE: This is a simulated response. Enable Claude API for real AI evaluation."
    }
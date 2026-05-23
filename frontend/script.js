// script.js - Frontend Logic

// ===== CONFIGURATION =====
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// ===== STATE MANAGEMENT =====
let currentQuestionType = 'technical';
let allQuestions = {};

// ===== DOM ELEMENTS =====
const elements = {
    typeButtons: document.querySelectorAll('.type-btn'),
    questionSelect: document.getElementById('questionSelect'),
    questionDisplay: document.getElementById('questionDisplay'),
    randomBtn: document.getElementById('randomBtn'),
    answerInput: document.getElementById('answerInput'),
    evaluateBtn: document.getElementById('evaluateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    resultsCard: document.getElementById('resultsCard'),
    tryAgainBtn: document.getElementById('tryAgainBtn'),
    copyFeedbackBtn: document.getElementById('copyFeedbackBtn')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 AI Interview Coach Loaded!');
    loadQuestions();
    setupEventListeners();
    checkServerHealth();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Question type selection
    elements.typeButtons.forEach(btn => {
        btn.addEventListener('click', () => handleTypeChange(btn));
    });
    
    // Question selection
    elements.questionSelect.addEventListener('change', handleQuestionSelect);
    elements.randomBtn.addEventListener('click', selectRandomQuestion);
    
    // Answer input tracking
    elements.answerInput.addEventListener('input', updateWordCount);
    
    // Action buttons
    elements.evaluateBtn.addEventListener('click', evaluateAnswer);
    elements.clearBtn.addEventListener('click', clearAnswer);
    elements.tryAgainBtn.addEventListener('click', resetForNewQuestion);
    elements.copyFeedbackBtn.addEventListener('click', copyFeedback);
    
    // Enter key in textarea (Ctrl+Enter to submit)
    elements.answerInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            evaluateAnswer();
        }
    });
}

// ===== SERVER HEALTH CHECK =====
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Server Status:', data);
        
        if (data.demo_mode) {
            console.log('🎭 Running in DEMO MODE (Free)');
        }
    } catch (error) {
        console.error('❌ Server not running!', error);
        alert('⚠️ Backend server is not running!\n\nPlease start it by running:\npython backend/app.py');
    }
}

// ===== LOAD QUESTIONS FROM API =====
async function loadQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/questions`);
        allQuestions = await response.json();
        populateQuestionDropdown(currentQuestionType);
    } catch (error) {
        console.error('Error loading questions:', error);
        elements.questionSelect.innerHTML = '<option>Error loading questions</option>';
    }
}

// ===== POPULATE DROPDOWN =====
function populateQuestionDropdown(type) {
    const questions = allQuestions[type] || [];
    elements.questionSelect.innerHTML = '<option value="">-- Select a question --</option>';
    
    questions.forEach((question, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = question;
        elements.questionSelect.appendChild(option);
    });
}

// ===== HANDLE TYPE CHANGE =====
function handleTypeChange(clickedBtn) {
    // Update active state
    elements.typeButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    // Update current type
    currentQuestionType = clickedBtn.dataset.type;
    
    // Reload questions
    populateQuestionDropdown(currentQuestionType);
    elements.questionDisplay.textContent = 'Select a question from the dropdown above...';
}

// ===== HANDLE QUESTION SELECTION =====
function handleQuestionSelect() {
    const selectedIndex = elements.questionSelect.value;
    if (selectedIndex === '') {
        elements.questionDisplay.textContent = 'Select a question from the dropdown above...';
        return;
    }
    
    const question = allQuestions[currentQuestionType][selectedIndex];
    elements.questionDisplay.textContent = question;
}

// ===== RANDOM QUESTION SELECTION =====
function selectRandomQuestion() {
    const questions = allQuestions[currentQuestionType];
    const randomIndex = Math.floor(Math.random() * questions.length);
    elements.questionSelect.value = randomIndex;
    handleQuestionSelect();
}

// ===== UPDATE WORD COUNT =====
function updateWordCount() {
    const text = elements.answerInput.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    elements.wordCount.textContent = words.length;
    elements.charCount.textContent = text.length;
}

// ===== CLEAR ANSWER =====
function clearAnswer() {
    elements.answerInput.value = '';
    updateWordCount();
}

// ===== EVALUATE ANSWER =====
async function evaluateAnswer() {
    // Validation
    const question = elements.questionDisplay.textContent;
    const answer = elements.answerInput.value.trim();
    
    if (question === 'Select a question from the dropdown above...' || question === '') {
        alert('⚠️ Please select a question first!');
        return;
    }
    
    if (!answer) {
        alert('⚠️ Please write an answer before evaluating!');
        return;
    }
    
    if (answer.split(' ').length < 10) {
        alert('⚠️ Your answer is too short! Try to provide more detail (at least 10 words).');
        return;
    }
    
    // Show loading, hide results
    elements.loadingIndicator.style.display = 'block';
    elements.resultsCard.style.display = 'none';
    
    // Scroll to loading indicator
    elements.loadingIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question,
                answer: answer,
                jobRole: 'Software Engineer'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const evaluation = await response.json();
        displayResults(evaluation);
        
    } catch (error) {
        console.error('Evaluation error:', error);
        alert('❌ Error evaluating answer. Please check if the backend is running!');
        elements.loadingIndicator.style.display = 'none';
    }
}

// ===== DISPLAY RESULTS =====
function displayResults(evaluation) {
    // Hide loading
    elements.loadingIndicator.style.display = 'none';
    
    // Show results card
    elements.resultsCard.style.display = 'block';
    
    // Display score
    document.getElementById('scoreValue').textContent = evaluation.score;
    document.getElementById('gradeBadge').textContent = evaluation.grade;
    
    // Color code the grade
    const gradeBadge = document.getElementById('gradeBadge');
    if (evaluation.score >= 90) {
        gradeBadge.style.color = '#10b981'; // Green
    } else if (evaluation.score >= 70) {
        gradeBadge.style.color = '#f59e0b'; // Yellow
    } else {
        gradeBadge.style.color = '#ef4444'; // Red
    }
    
    // Show demo warning if applicable
    const demoWarning = document.getElementById('demoWarning');
    if (evaluation.demo_mode) {
        demoWarning.style.display = 'block';
    } else {
        demoWarning.style.display = 'none';
    }
    
    // Display strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '';
    evaluation.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
    });
    
    // Display weaknesses
    const weaknessesList = document.getElementById('weaknessesList');
    weaknessesList.innerHTML = '';
    evaluation.weaknesses.forEach(weakness => {
        const li = document.createElement('li');
        li.textContent = weakness;
        weaknessesList.appendChild(li);
    });
    
    // Display improved answer
    document.getElementById('improvedAnswer').textContent = evaluation.improved_answer;
    
    // Display tips
    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = '';
    evaluation.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
    
    // Display missing keywords
    const keywordsList = document.getElementById('keywordsList');
    keywordsList.innerHTML = '';
    evaluation.keywords_missing.forEach(keyword => {
        const span = document.createElement('span');
        span.className = 'keyword-tag';
        span.textContent = keyword;
        keywordsList.appendChild(span);
    });
    
    // Scroll to results
    elements.resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== RESET FOR NEW QUESTION =====
function resetForNewQuestion() {
    elements.resultsCard.style.display = 'none';
    elements.answerInput.value = '';
    updateWordCount();
    selectRandomQuestion();
    elements.answerInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== COPY FEEDBACK =====
function copyFeedback() {
    const score = document.getElementById('scoreValue').textContent;
    const grade = document.getElementById('gradeBadge').textContent;
    const question = elements.questionDisplay.textContent;
    const answer = elements.answerInput.value;
    
    const strengths = Array.from(document.querySelectorAll('#strengthsList li'))
        .map(li => `• ${li.textContent}`)
        .join('\n');
    
    const weaknesses = Array.from(document.querySelectorAll('#weaknessesList li'))
        .map(li => `• ${li.textContent}`)
        .join('\n');
    
    const improvedAnswer = document.getElementById('improvedAnswer').textContent;
    
    const feedbackText = `
📊 AI Interview Coach - Evaluation Report
==========================================

Question: ${question}

Your Answer: ${answer}

Score: ${score}/100 (Grade: ${grade})

✅ Strengths:
${strengths}

⚠️ Areas for Improvement:
${weaknesses}

💡 Improved Answer:
${improvedAnswer}

==========================================
Generated by AI Interview Coach
    `.trim();
    
    navigator.clipboard.writeText(feedbackText).then(() => {
        alert('✅ Feedback copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('❌ Failed to copy. Please try again.');
    });
}
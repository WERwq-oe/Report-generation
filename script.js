// Global variables
let currentTheme = 'light';
let generatedReport = '';
let generatedQuiz = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Set up navigation
    setupNavigation();
    
    // Load Google Fonts for handwritten text
    loadHandwrittenFont();
}

// Theme Management
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });
}

// Load handwritten font
function loadHandwrittenFont() {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

// Report Generation
async function generateReport() {
    const topic = document.getElementById('reportTopic').value.trim();
    if (!topic) {
        alert('Please enter a topic for the report.');
        return;
    }

    const reportLength = document.querySelector('input[name="reportLength"]:checked').value;
    const textFormat = document.querySelector('input[name="textFormat"]:checked').value;
    const formatting = Array.from(document.querySelectorAll('input[name="formatting"]:checked')).map(cb => cb.value);

    // Show loading modal
    showLoadingModal('report');

    try {
        const reportData = {
            topic,
            length: reportLength,
            format: textFormat,
            formatting
        };

        const response = await fetch('/api/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        const result = await response.json();
        generatedReport = result.content;
        
        hideLoadingModal();
        showReportPreview(result.content);
    } catch (error) {
        console.error('Error generating report:', error);
        hideLoadingModal();
        alert('Failed to generate report. Please try again.');
    }
}

// Quiz Generation
async function generateQuiz() {
    const topic = document.getElementById('quizTopic').value.trim();
    if (!topic) {
        alert('Please enter a topic for the quiz.');
        return;
    }

    const quizTypes = Array.from(document.querySelectorAll('input[name="quizType"]:checked')).map(cb => cb.value);
    if (quizTypes.length === 0) {
        alert('Please select at least one quiz type.');
        return;
    }

    const numQuestions = document.getElementById('numQuestions').value;
    const difficulty = document.getElementById('difficulty').value;

    // Show loading modal
    showLoadingModal('quiz');

    try {
        const quizData = {
            topic,
            types: quizTypes,
            numQuestions: parseInt(numQuestions),
            difficulty
        };

        const response = await fetch('/api/generate-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizData)
        });

        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }

        const result = await response.json();
        generatedQuiz = result;
        
        hideLoadingModal();
        showQuizPreview(result);
    } catch (error) {
        console.error('Error generating quiz:', error);
        hideLoadingModal();
        alert('Failed to generate quiz. Please try again.');
    }
}

// Loading Modal
function showLoadingModal(type) {
    const modal = document.getElementById('loadingModal');
    const messageElement = document.getElementById('loadingMessage');
    
    const messages = [
        'Th Logic is thinking...',
        'Th Logic is creating...',
        'Th Logic is analyzing...',
        'Th Logic is formatting...'
    ];
    
    let messageIndex = 0;
    
    // Animate loading messages
    const messageInterval = setInterval(() => {
        messageElement.textContent = messages[messageIndex];
        messageIndex = (messageIndex + 1) % messages.length;
    }, 1500);
    
    modal.classList.add('active');
    modal.messageInterval = messageInterval;
}

function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal.messageInterval) {
        clearInterval(modal.messageInterval);
    }
    modal.classList.remove('active');
}

// Report Preview
function showReportPreview(content) {
    const modal = document.getElementById('reportModal');
    const preview = document.getElementById('reportPreview');
    
    // Format the content with proper HTML
    const formattedContent = formatReportContent(content);
    preview.innerHTML = formattedContent;
    
    modal.classList.add('active');
}

function formatReportContent(content) {
    // Apply formatting based on markdown-like syntax
    let formatted = content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>');
    
    // Handle tables - convert markdown tables to HTML
    formatted = formatted.replace(/\|(.+)\|\n\|[-:\s\|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
        const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
        const tableRows = rows.trim().split('\n').map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        let tableHTML = '<table class="preview-table"><thead><tr>';
        headerCells.forEach(cell => {
            tableHTML += `<th>${cell}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        tableRows.forEach(row => {
            if (row.length > 0) {
                tableHTML += '<tr>';
                row.forEach(cell => {
                    tableHTML += `<td>${cell}</td>`;
                });
                tableHTML += '</tr>';
            }
        });
        
        tableHTML += '</tbody></table>';
        return tableHTML;
    });
    
    formatted = formatted
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hlu])/gm, '<p>')
        .replace(/(?<![hlu]>)$/gm, '</p>');
    
    // Wrap consecutive list items in ul/ol tags
    formatted = formatted.replace(/(<li>(?:(?!<li>).)*<\/li>\s*)+/g, '<ul>$&</ul>');
    formatted = formatted.replace(/(<li>\d+\.(?:(?!<li>).)*<\/li>\s*)+/g, '<ol>$&</ol>');
    
    return formatted;
}

// Quiz Preview
function showQuizPreview(quiz) {
    const modal = document.getElementById('quizModal');
    const preview = document.getElementById('quizPreview');
    
    let html = '<div class="quiz-info"><h3>' + quiz.topic + '</h3>';
    html += '<p>Questions: ' + quiz.questions.length + ' | Difficulty: ' + quiz.difficulty + '</p></div>';
    
    quiz.questions.forEach((question, index) => {
        html += '<div class="question-item">';
        html += '<div class="question-title">' + (index + 1) + '. ' + question.question + '</div>';
        
        if (question.type === 'mcq') {
            question.options.forEach((option, optIndex) => {
                html += '<div class="option" onclick="selectOption(this)">';
                html += '<input type="radio" name="q' + index + '" value="' + optIndex + '">';
                html += '<span>' + option + '</span></div>';
            });
        } else if (question.type === 'oneword') {
            html += '<input type="text" class="form-control" placeholder="Your answer...">';
        } else if (question.type === 'flashcard') {
            html += '<div class="flashcard" onclick="flipCard(this)">';
            html += '<div class="card-front">' + question.question + '</div>';
            html += '<div class="card-back" style="display:none;">' + question.answer + '</div>';
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    preview.innerHTML = html;
    modal.classList.add('active');
}

// Quiz Functionality
function selectOption(element) {
    const radio = element.querySelector('input[type="radio"]');
    radio.checked = true;
}

function flipCard(element) {
    const front = element.querySelector('.card-front');
    const back = element.querySelector('.card-back');
    
    if (front.style.display !== 'none') {
        front.style.display = 'none';
        back.style.display = 'block';
    } else {
        front.style.display = 'block';
        back.style.display = 'none';
    }
}

function startQuiz() {
    if (!generatedQuiz) return;
    
    // Close the preview modal
    closeModal('quizModal');
    
    // Create and show interactive quiz
    showInteractiveQuiz(generatedQuiz);
}

// Interactive Quiz Functionality
function showInteractiveQuiz(quiz) {
    const modal = document.getElementById('quizModal');
    const preview = document.getElementById('quizPreview');
    
    let currentQuestion = 0;
    let userAnswers = [];
    let score = 0;
    
    function renderQuestion() {
        const question = quiz.questions[currentQuestion];
        let html = `
            <div class="interactive-quiz">
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((currentQuestion + 1) / quiz.questions.length) * 100}%"></div>
                    </div>
                    <span>Question ${currentQuestion + 1} of ${quiz.questions.length}</span>
                </div>
                
                <div class="current-question">
                    <h4>${question.question}</h4>
        `;
        
        if (question.type === 'mcq') {
            question.options.forEach((option, index) => {
                html += `
                    <button class="quiz-option" onclick="selectQuizAnswer(${index})">
                        ${option}
                    </button>
                `;
            });
        } else if (question.type === 'oneword') {
            html += `
                <input type="text" id="onewordAnswer" class="form-control quiz-input" 
                       placeholder="Enter your answer..." onkeypress="handleEnterKey(event)">
            `;
        } else if (question.type === 'flashcard') {
            html += `
                <div class="flashcard-container">
                    <div class="flashcard-interactive" id="flashcard-${currentQuestion}">
                        <div class="card-front-interactive">${question.question}</div>
                        <div class="card-back-interactive" style="display:none;">${question.answer}</div>
                    </div>
                    <button class="btn btn-secondary" onclick="flipInteractiveCard()">
                        <i class="fas fa-sync-alt"></i> Flip Card
                    </button>
                </div>
            `;
        }
        
        html += `
                </div>
                
                <div class="quiz-navigation">
        `;
        
        if (currentQuestion > 0) {
            html += `<button class="btn btn-secondary" onclick="previousQuestion()">Previous</button>`;
        }
        
        if (question.type === 'flashcard') {
            html += `<button class="btn btn-primary" onclick="nextQuestion()">Next</button>`;
        } else if (currentQuestion === quiz.questions.length - 1) {
            html += `<button class="btn btn-primary" onclick="finishQuiz()">Finish Quiz</button>`;
        } else {
            html += `<button class="btn btn-primary" onclick="nextQuestion()" disabled id="nextBtn">Next</button>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        preview.innerHTML = html;
    }
    
    // Store functions in global scope
    window.selectQuizAnswer = function(answerIndex) {
        userAnswers[currentQuestion] = answerIndex;
        document.querySelectorAll('.quiz-option').forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index === answerIndex) {
                btn.classList.add('selected');
            }
        });
        document.getElementById('nextBtn').disabled = false;
    };
    
    window.handleEnterKey = function(event) {
        if (event.key === 'Enter') {
            const answer = event.target.value.trim();
            if (answer) {
                userAnswers[currentQuestion] = answer;
                nextQuestion();
            }
        }
    };
    
    window.flipInteractiveCard = function() {
        const front = document.querySelector('.card-front-interactive');
        const back = document.querySelector('.card-back-interactive');
        
        if (front.style.display !== 'none') {
            front.style.display = 'none';
            back.style.display = 'block';
        } else {
            front.style.display = 'block';
            back.style.display = 'none';
        }
    };
    
    window.nextQuestion = function() {
        const question = quiz.questions[currentQuestion];
        
        if (question.type === 'oneword') {
            const answer = document.getElementById('onewordAnswer').value.trim();
            if (!answer) {
                alert('Please enter an answer before proceeding.');
                return;
            }
            userAnswers[currentQuestion] = answer;
        }
        
        currentQuestion++;
        if (currentQuestion < quiz.questions.length) {
            renderQuestion();
        } else {
            finishQuiz();
        }
    };
    
    window.previousQuestion = function() {
        currentQuestion--;
        renderQuestion();
    };
    
    window.finishQuiz = function() {
        // Calculate score
        quiz.questions.forEach((question, index) => {
            if (question.type === 'mcq' && userAnswers[index] === question.correctAnswer) {
                score++;
            } else if (question.type === 'oneword' && userAnswers[index] && 
                      userAnswers[index].toLowerCase() === question.answer.toLowerCase()) {
                score++;
            } else if (question.type === 'flashcard') {
                score++; // Flashcards always count as correct for engagement
            }
        });
        
        showQuizResults();
    };
    
    function showQuizResults() {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        let html = `
            <div class="quiz-results">
                <div class="results-header">
                    <i class="fas fa-trophy"></i>
                    <h3>Quiz Complete!</h3>
                </div>
                
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-number">${percentage}%</span>
                    </div>
                    <p>You scored ${score} out of ${quiz.questions.length} questions correctly!</p>
                </div>
                
                <div class="performance-message">
        `;
        
        if (percentage >= 90) {
            html += `<p class="excellent">🎉 Excellent work! You have a great understanding of ${quiz.topic}!</p>`;
        } else if (percentage >= 70) {
            html += `<p class="good">👍 Good job! You have a solid grasp of ${quiz.topic}!</p>`;
        } else if (percentage >= 50) {
            html += `<p class="average">📚 Not bad! Consider reviewing ${quiz.topic} to improve your understanding.</p>`;
        } else {
            html += `<p class="needs-work">💪 Keep studying! ${quiz.topic} requires more practice.</p>`;
        }
        
        html += `
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-secondary" onclick="retakeQuiz()">
                        <i class="fas fa-redo"></i> Retake Quiz
                    </button>
                    <button class="btn btn-primary" onclick="closeModal('quizModal')">
                        <i class="fas fa-check"></i> Done
                    </button>
                </div>
            </div>
        `;
        
        preview.innerHTML = html;
    }
    
    window.retakeQuiz = function() {
        currentQuestion = 0;
        userAnswers = [];
        score = 0;
        renderQuestion();
    };
    
    // Update modal header for interactive mode
    const modalHeader = modal.querySelector('.modal-header h3');
    modalHeader.textContent = `${quiz.topic} - Interactive Quiz`;
    
    // Hide download buttons during interactive mode
    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.style.display = 'none';
    
    // Start the quiz
    renderQuestion();
    modal.classList.add('active');
}

// Download Functions
async function downloadReport(format) {
    if (!generatedReport) return;
    
    try {
        const response = await fetch('/api/download-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: generatedReport,
                format: format
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report. Please try again.');
    }
}

async function downloadQuiz() {
    if (!generatedQuiz) return;
    
    try {
        const response = await fetch('/api/download-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(generatedQuiz)
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quiz.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error downloading quiz:', error);
        alert('Failed to download quiz. Please try again.');
    }
}

// Modal Functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// FAQ Functions
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Event Listeners for modals
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
    }
});
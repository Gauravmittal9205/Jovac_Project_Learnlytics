import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';

function RecommendationPage() {
  const { topic } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [answers, setAnswers] = useState([]);

  // Quiz questions based on topic
  const quizData = {
    "advanced-algorithms": {
      title: "Advanced Algorithms Quiz",
      description: "Test your knowledge of algorithm design patterns and problem-solving strategies.",
      questions: [
        {
          question: "Which algorithm is best suited for finding the shortest path in a graph with non-negative edge weights?",
          options: [
            "Dijkstra's Algorithm",
            "Bellman-Ford Algorithm", 
            "Floyd-Warshall Algorithm",
            "Kruskal's Algorithm"
          ],
          correct: 0
        },
        {
          question: "What is the time complexity of the QuickSort algorithm in the worst case?",
          options: [
            "O(n log n)",
            "O(n²)",
            "O(log n)",
            "O(n)"
          ],
          correct: 1
        },
        {
          question: "Which data structure is most efficient for implementing a priority queue?",
          options: [
            "Array",
            "Linked List",
            "Binary Heap",
            "Stack"
          ],
          correct: 2
        },
        {
          question: "What technique is used in Dynamic Programming to avoid redundant calculations?",
          options: [
            "Greedy Approach",
            "Memoization",
            "Backtracking",
            "Divide and Conquer"
          ],
          correct: 1
        },
        {
          question: "Which sorting algorithm is stable and has O(n log n) worst-case time complexity?",
          options: [
            "QuickSort",
            "MergeSort",
            "HeapSort",
            "BubbleSort"
          ],
          correct: 1
        }
      ]
    },
    "database-design": {
      title: "Database Design Quiz",
      description: "Test your understanding of database concepts, normalization, and design principles.",
      questions: [
        {
          question: "What is the first normal form (1NF) in database design?",
          options: [
            "Eliminating duplicate columns",
            "Eliminating duplicate rows",
            "Each cell contains only atomic values",
            "Creating separate tables for related data"
          ],
          correct: 2
        },
        {
          question: "Which type of join returns all records from the left table and matching records from the right table?",
          options: [
            "INNER JOIN",
            "LEFT JOIN",
            "RIGHT JOIN",
            "FULL OUTER JOIN"
          ],
          correct: 1
        },
        {
          question: "What is the purpose of an index in a database?",
          options: [
            "To store data",
            "To improve query performance",
            "To enforce constraints",
            "To define relationships"
          ],
          correct: 1
        },
        {
          question: "Which normal form deals with transitive dependencies?",
          options: [
            "First Normal Form (1NF)",
            "Second Normal Form (2NF)",
            "Third Normal Form (3NF)",
            "Boyce-Codd Normal Form (BCNF)"
          ],
          correct: 2
        },
        {
          question: "What does ACID stand for in database transactions?",
          options: [
            "Atomicity, Consistency, Isolation, Durability",
            "Access, Control, Identity, Data",
            "Automatic, Consistent, Independent, Direct",
            "Analysis, Consistency, Integrity, Durability"
          ],
          correct: 0
        }
      ]
    },
    "math-problem-sets": {
      title: "Mathematics Quiz",
      description: "Test your mathematical reasoning and problem-solving skills.",
      questions: [
        {
          question: "What is the derivative of sin(x) with respect to x?",
          options: [
            "cos(x)",
            "-cos(x)",
            "sin(x)",
            "-sin(x)"
          ],
          correct: 0
        },
        {
          question: "What is the sum of the first n natural numbers?",
          options: [
            "n(n+1)/2",
            "n(n-1)/2",
            "n²/2",
            "n(n+1)"
          ],
          correct: 0
        },
        {
          question: "In a right triangle with legs a and b, and hypotenuse c, what is the relationship?",
          options: [
            "a + b = c",
            "a² + b² = c²",
            "a × b = c",
            "a/b = c"
          ],
          correct: 1
        },
        {
          question: "What is the value of log₂(8)?",
          options: [
            "2",
            "3",
            "4",
            "8"
          ],
          correct: 1
        },
        {
          question: "What is the probability of rolling a 6 on a fair six-sided die?",
          options: [
            "1/2",
            "1/3",
            "1/6",
            "1/4"
          ],
          correct: 2
        }
      ]
    }
  };

  const currentQuiz = quizData[topic] || {
    title: "Quiz Not Found",
    description: "The selected quiz is not available.",
    questions: []
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showResult]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);
      
      if (selectedAnswer === currentQuiz.questions[currentQuestion].correct) {
        setScore(score + 1);
      }
    }

    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] !== undefined ? answers[currentQuestion + 1] : null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] !== undefined ? answers[currentQuestion - 1] : null);
    }
  };

  const handleSubmitQuiz = () => {
    let finalScore = score;
    if (selectedAnswer !== null && selectedAnswer === currentQuiz.questions[currentQuestion].correct) {
      finalScore += 1;
    }
    
    // Calculate final score
    const finalAnswers = [...answers];
    if (selectedAnswer !== null) {
      finalAnswers[currentQuestion] = selectedAnswer;
    }
    
    finalScore = finalAnswers.reduce((acc, answer, index) => {
      if (answer === currentQuiz.questions[index].correct) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    setScore(finalScore);
    setShowResult(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (currentQuiz.questions.length === 0) {
    return (
      <div className="quiz-container not-found">
        <div className="quiz-header">
          <h1>Quiz Not Available</h1>
          <p>The selected quiz topic is not available. Please choose a different topic.</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    return (
      <div className="quiz-container result-page">
        <div className="result-content">
          <div className="result-icon">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="result-title">Quiz Completed!</h1>
          <div className="result-score">
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
            </div>
            <p className="score-text">
              You scored {score} out of {currentQuiz.questions.length} questions
            </p>
          </div>
          <div className="result-feedback">
            {percentage >= 90 && <p className="excellent">Excellent! You have mastered this topic!</p>}
            {percentage >= 80 && percentage < 90 && <p className="good">Great job! You have a solid understanding.</p>}
            {percentage >= 60 && percentage < 80 && <p className="average">Good effort! Review the topics to improve further.</p>}
            {percentage < 60 && <p className="needs-improvement">Keep practicing! Consider reviewing the material again.</p>}
          </div>
          <div className="result-actions">
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Retake Quiz
            </button>
            <button className="btn-home" onClick={() => window.history.back()}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{currentQuiz.title}</h1>
          <p>{currentQuiz.description}</p>
        </div>
        <div className="quiz-progress">
          <div className="timer">⏱️ {formatTime(timeLeft)}</div>
          <div className="question-counter">
            Question {currentQuestion + 1} of {currentQuiz.questions.length}
          </div>
          <div className="progress-bar-quiz">
            <div 
              className="progress-fill-quiz" 
              style={{width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%`}}
            ></div>
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-section">
          <h2 className="question-text">
            {currentQuiz.questions[currentQuestion].question}
          </h2>
          
          <div className="options-container">
            {currentQuiz.questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className={`option ${selectedAnswer === index ? 'selected' : ''} ${answers[currentQuestion] === index ? 'answered' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="option-indicator">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="option-text">
                  {option}
                </div>
                {answers[currentQuestion] === index && (
                  <div className="check-icon">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button 
            className="nav-btn prev"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          
          <div className="question-status">
            {currentQuestion + 1} / {currentQuiz.questions.length}
          </div>
          
          {currentQuestion === currentQuiz.questions.length - 1 ? (
            <button 
              className="nav-btn submit"
              onClick={handleSubmitQuiz}
              disabled={selectedAnswer === null}
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              className="nav-btn next"
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default RecommendationPage;
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// GET /api/quiz/:topic - Get quiz by topic
router.get('/:topic', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      topic: req.params.topic, 
      isActive: true 
    });
    
    if (!quiz) {
      return res.status(404).json({ 
        message: 'Quiz not found',
        success: false 
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// GET /api/quiz - Get all available quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .select('topic title description difficulty category totalQuestions timeLimit passingScore')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// POST /api/quiz/:topic/submit - Submit quiz answers
router.post('/:topic/submit', async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const quiz = await Quiz.findOne({ topic: req.params.topic });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const results = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer === question.correct;
      if (isCorrect) {
        score += question.points || 1;
      }
      return {
        questionIndex: index,
        selectedAnswer: answer,
        correctAnswer: question.correct,
        isCorrect,
        points: isCorrect ? question.points || 1 : 0,
        explanation: question.explanation
      };
    });

    const percentage = Math.round((score / quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0)) * 100);

    // Update quiz statistics
    quiz.metadata.totalAttempts += 1;
    quiz.metadata.averageScore = 
      (quiz.metadata.averageScore * (quiz.metadata.totalAttempts - 1) + percentage) / 
      quiz.metadata.totalAttempts;
    await quiz.save();

    res.json({
      success: true,
      score,
      percentage,
      totalQuestions: quiz.questions.length,
      results,
      passed: percentage >= quiz.passingScore,
      feedback: getFeedback(percentage)
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

function getFeedback(percentage) {
  if (percentage >= 90) return "Excellent! You have mastered this topic!";
  if (percentage >= 80) return "Great job! You have a solid understanding.";
  if (percentage >= 60) return "Good effort! Review the topics to improve further.";
  return "Keep practicing! Consider reviewing the material again.";
}

module.exports = router;
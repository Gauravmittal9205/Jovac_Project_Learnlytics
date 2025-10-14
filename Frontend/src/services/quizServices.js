const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const quizService = {
  // Get quiz by topic
  async getQuizByTopic(topic) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${topic}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch quiz');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Get all available quizzes
  async getAllQuizzes() {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch quizzes');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Submit quiz answers
  async submitQuiz(topic, answers, timeSpent) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${topic}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers, timeSpent }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit quiz');
      }
      
      return data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }
};
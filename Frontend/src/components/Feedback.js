import React, { useState, useRef, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';

const SESSION_KEY = 'learnlytics_session';
const API_URL = 'http://localhost:5000/api/auth';

function readSession(){
  try { 
    const raw = localStorage.getItem(SESSION_KEY); 
    return raw ? JSON.parse(raw) : null; 
  } catch { 
    return null; 
  }
}

function clearSession(){ 
  localStorage.removeItem(SESSION_KEY); 
}
function FeedbackPage(){
  const session = readSession();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    lessonClarity: 4,
    quizDifficulty: 3,
    satisfaction: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const handleFeedbackChange = (field, value) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const submitFeedback = () => {
    alert('Thank you for your feedback! It helps us improve your learning experience.');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {(session?.name || 'Student').split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{session?.name || 'Student'}</h4>
            <p>Student</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <NavLink to="/risk-status" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Risk Status</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Profile</span>
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <NavLink to="/my-instructors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">My Instructors</span>
            </NavLink>
            <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Schedule</span>
            </NavLink>
            <NavLink to="/course-analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Course Analysis</span>
            </NavLink>
            <NavLink to="/academic-performance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Academic Performance</span>
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item active">
              <span className="nav-text">Feedback</span>
            </Link>
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Feedback</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2 className="section-title">Provide Your Feedback</h2>
            <p className="section-description">
              Your feedback helps us improve the learning experience. Please take a moment to share your thoughts.
            </p>
            
            <div className="feedback-card">
              <div className="feedback-item">
                <label>Lesson Clarity</label>
                <p className="feedback-description">How clear and understandable were the lessons?</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star ${star <= feedback.lessonClarity ? 'active' : ''}`}
                      onClick={() => handleFeedbackChange('lessonClarity', star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="rating-label">
                  {feedback.lessonClarity === 1 && 'Very Unclear'}
                  {feedback.lessonClarity === 2 && 'Unclear'}
                  {feedback.lessonClarity === 3 && 'Neutral'}
                  {feedback.lessonClarity === 4 && 'Clear'}
                  {feedback.lessonClarity === 5 && 'Very Clear'}
                </div>
              </div>
              
              <div className="feedback-item">
                <label>Quiz Difficulty</label>
                <p className="feedback-description">How would you rate the difficulty level of the quizzes?</p>
                <div className="difficulty-slider">
                  <span>Too Easy</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={feedback.quizDifficulty}
                    onChange={(e) => handleFeedbackChange('quizDifficulty', parseInt(e.target.value))}
                    className="slider"
                  />
                  <span>Too Hard</span>
                  <div className="slider-value">{feedback.quizDifficulty}/5</div>
                </div>
                <div className="rating-label">
                  {feedback.quizDifficulty === 1 && 'Too Easy'}
                  {feedback.quizDifficulty === 2 && 'Easy'}
                  {feedback.quizDifficulty === 3 && 'Just Right'}
                  {feedback.quizDifficulty === 4 && 'Hard'}
                  {feedback.quizDifficulty === 5 && 'Too Hard'}
                </div>
              </div>
              
              <div className="feedback-item">
                <label>Overall Satisfaction</label>
                <p className="feedback-description">How satisfied are you with your learning experience?</p>
                <div className="satisfaction-buttons">
                  <button
                    className={`satisfaction-btn ${feedback.satisfaction ? 'active' : ''}`}
                    onClick={() => handleFeedbackChange('satisfaction', true)}
                  >
                    Satisfied
                  </button>
                  <button
                    className={`satisfaction-btn ${!feedback.satisfaction ? 'active' : ''}`}
                    onClick={() => handleFeedbackChange('satisfaction', false)}
                  >
                    Not Satisfied
                  </button>
                </div>
              </div>

              <div className="feedback-item">
                <label>Additional Comments</label>
                <p className="feedback-description">Any additional feedback or suggestions?</p>
                <textarea 
                  className="feedback-textarea"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  rows="4"
                />
              </div>
              
              <div className="feedback-actions">
                <button className="btn primary" onClick={submitFeedback}>
                  Submit Feedback
                </button>
                <button className="btn ghost" onClick={() => {
                  setFeedback({
                    lessonClarity: 4,
                    quizDifficulty: 3,
                    satisfaction: true
                  });
                }}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
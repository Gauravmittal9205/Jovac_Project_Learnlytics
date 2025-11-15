import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { FaStar, FaSmile, FaFrown, FaMeh, FaPaperPlane, FaCamera, FaCheckCircle, FaTimes } from 'react-icons/fa';

const SESSION_KEY = 'learnlytics_session';
const FEEDBACK_API_URL = 'http://localhost:5000/api/feedback';

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

function FeedbackPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [feedback, setFeedback] = useState({
    rating: 0,
    feedbackType: 'suggestion',
    message: '',
    email: session?.email || '',
    screenshot: null,
    satisfaction: 3,
    difficulty: 3,
    wouldRecommend: null,
    courseComments: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { 
    if (!session) navigate('/login'); 
  }, [navigate, session]);

  // Auto-hide submit message after a few seconds
  useEffect(() => {
    if (!submitMessage) return;

    const timer = setTimeout(() => {
      setSubmitMessage('');
      setSubmitted(false);
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [submitMessage]);

  const handleChange = (field, value) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedback(prev => ({ ...prev, screenshot: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setFeedback(prev => ({ ...prev, screenshot: null }));
  };

  const resetForm = () => {
    setFeedback({
      rating: 0,
      feedbackType: 'suggestion',
      message: '',
      email: session?.email || '',
      screenshot: null,
      satisfaction: 3,
      difficulty: 3,
      wouldRecommend: null,
      courseComments: ''
    });
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token}`
        },
        body: JSON.stringify({
          ...feedback,
          userId: session?.userId
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        setSubmitMessage('Feedback submitted successfully!');
        resetForm();
      } else {
        const data = await response.json().catch(() => ({}));
        setSubmitMessage(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('Error submitting feedback. Please try again.');
    }
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
            <h1>Share Your Feedback</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="feedback-container">

              <div className="feedback-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  General Feedback
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'course' ? 'active' : ''}`}
                  onClick={() => setActiveTab('course')}
                >
                  Course Feedback
                </button>
              </div>

              <form onSubmit={submitFeedback} className="feedback-form">

                {activeTab === 'general' ? (
                  <>
                    <div className="feedback-section">
                      <h3>How would you rate your experience?</h3>
                      <div className="emoji-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`emoji-btn ${feedback.rating === star ? 'active' : ''}`}
                            onClick={() => handleChange('rating', star)}
                            aria-label={`Rate ${star} star`}
                          >
                            {star <= 2 ? (
                              <FaFrown className="emoji" />
                            ) : star <= 4 ? (
                              <FaMeh className="emoji" />
                            ) : (
                              <FaSmile className="emoji" />
                            )}
                            <span className="star">
                              <FaStar className={feedback.rating >= star ? 'filled' : ''} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="feedback-section">
                      <h3>What type of feedback are you providing?</h3>
                      <div className="feedback-type">
                        {['suggestion', 'bug', 'compliment', 'question'].map((type) => (
                          <label key={type} className="radio-label">
                            <input
                              type="radio"
                              name="feedbackType"
                              checked={feedback.feedbackType === type}
                              onChange={() => handleChange('feedbackType', type)}
                            />
                            <span className="radio-custom"></span>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="feedback-section">
                      <h3>Your Feedback</h3>
                      <textarea
                        placeholder="Share your thoughts, suggestions, or report issues..."
                        value={feedback.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        rows="5"
                        required
                      />
                    </div>

                    <div className="feedback-section">
                      <h3>Would you recommend us to a friend?</h3>
                      <div className="recommendation">
                        <button
                          type="button"
                          className={`rec-btn ${feedback.wouldRecommend === true ? 'active' : ''}`}
                          onClick={() => handleChange('wouldRecommend', true)}
                        >
                          Yes, definitely!
                        </button>
                        <button
                          type="button"
                          className={`rec-btn ${feedback.wouldRecommend === false ? 'active' : ''}`}
                          onClick={() => handleChange('wouldRecommend', false)}
                        >
                          Probably not
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="feedback-section">
                      <h3>Course Satisfaction</h3>
                      <div className="satisfaction-slider">
                        <span>Not Satisfied</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={feedback.satisfaction}
                          onChange={(e) => handleChange('satisfaction', parseInt(e.target.value))}
                        />
                        <span>Very Satisfied</span>
                        <div className="slider-value">
                          {Array(feedback.satisfaction).fill('★').join('')}
                        </div>
                      </div>
                    </div>

                    <div className="feedback-section">
                      <h3>Course Difficulty</h3>
                      <div className="difficulty-slider">
                        <span>Too Easy</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={feedback.difficulty}
                          onChange={(e) => handleChange('difficulty', parseInt(e.target.value))}
                        />
                        <span>Too Hard</span>
                        <div className="slider-value">
                          {feedback.difficulty}/5
                        </div>
                      </div>
                    </div>

                    <div className="feedback-section">
                      <h3>Additional Comments</h3>
                      <textarea
                        placeholder="What did you like or what can be improved?"
                        value={feedback.courseComments}
                        onChange={(e) => handleChange('courseComments', e.target.value)}
                        rows="4"
                      />
                    </div>
                  </>
                )}

                <div className="feedback-actions">

                  <div className="screenshot-upload">
                    <input
                      type="file"
                      id="screenshot"
                      accept="image/*"
                      onChange={handleScreenshot}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="screenshot" className="screenshot-btn">
                      <FaCamera /> {feedback.screenshot ? 'Change Screenshot' : 'Add Screenshot'}
                    </label>
                    {feedback.screenshot && (
                      <div className="screenshot-preview">
                        <img src={feedback.screenshot} alt="Screenshot preview" />
                        <button 
                          type="button" 
                          className="remove-screenshot"
                          onClick={removeScreenshot}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button 
                      type="button" 
                      className="btn secondary"
                      onClick={resetForm}
                    >
                      Clear Form
                    </button>
                    <button 
                      type="submit" 
                      className="btn primary"
                      disabled={!feedback.message}
                    >
                      <FaPaperPlane /> Submit Feedback
                    </button>
                  </div>
                  {submitMessage && (
                    <div className={`feedback-submit-message ${submitted ? 'success' : 'error'}`}>
                      {submitted && <FaCheckCircle className="success-icon" />}
                      <span>{submitMessage}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

    </div>
  );
}

export default FeedbackPage;
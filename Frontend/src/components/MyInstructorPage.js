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
const mockInstructors = [
  {
    id: 1,
    name: 'Dr. Smith',
    subject: 'Mathematics',
    avatar: 'SM',
    imageUrl: 'https://images.unsplash.com/photo-1542838183-500f135b3e21?q=80&w=1740&auto=format&fit=crop',
    bio: 'Dr. Smith specializes in advanced calculus and has over 15 years of teaching experience. He is known for his clear explanations and practical problem-solving approach.',
    rating: 4.8,
    courses: ['Advanced Calculus', 'Linear Algebra', 'Differential Equations'],
    mentorship: {
      sessions: 12,
      lastSession: 'September 10, 2025'
    }
  },
  {
    id: 2,
    name: 'Prof. Johnson',
    subject: 'Programming',
    avatar: 'JO',
    imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1812&auto=format&fit=crop',
    bio: 'Prof. Johnson is an expert in data structures and algorithms. He has a passion for helping students master complex coding concepts through hands-on projects.',
    rating: 4.5,
    courses: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Web Development Basics'],
    mentorship: {
      sessions: 8,
      lastSession: 'September 12, 2025'
    }
  },
  {
    id: 3,
    name: 'Ms. Williams',
    subject: 'Physics',
    avatar: 'WI',
    imageUrl: 'https://images.unsplash.com/photo-1542749363-2339d67ef733?q=80&w=1740&auto=format&fit=crop',
    bio: 'Ms. Williams is a research scientist and a visiting faculty member. Her classes are highly engaging, focusing on real-world applications of physics principles.',
    rating: 4.9,
    courses: ['Quantum Mechanics', 'Thermodynamics', 'Classical Physics'],
    mentorship: {
      sessions: 5,
      lastSession: 'August 28, 2025'
    }
  },
];

function MyInstructorsPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const handleViewDetailsClick = (instructor) => {
    setSelectedInstructor(instructor);
  };

  const closeModal = () => {
    setSelectedInstructor(null);
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
            <NavLink to="/overview" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Overview</span>
            </NavLink>
            <NavLink to="/risk-status" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Risk Status</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Profile</span>
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item active">
              <span className="nav-text">My Instructors</span>
            </Link>
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
            <NavLink to="/feedback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Feedback</span>
            </NavLink>
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
            <h1>My Instructors</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Your Mentors & Instructors</h2>
            <div className="instructors-grid">
              {mockInstructors.map(instructor => (
                <div 
                  key={instructor.id} 
                  className="instructor-card"
                >
                  <div className="instructor-card-top">
                    {instructor.imageUrl ? (
                      <img src={instructor.imageUrl} alt={instructor.name} className="instructor-photo" />
                    ) : (
                      <div className="instructor-card-avatar">{instructor.avatar}</div>
                    )}
                    <div className="instructor-info">
                      <h3 className="instructor-name">{instructor.name}</h3>
                      <p className="instructor-subject">{instructor.subject}</p>
                      <div className="instructor-rating">
                        <span className="rating-score">{instructor.rating}</span>
                        <span className="rating-stars">⭐</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetailsClick(instructor)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-section ask-doubt-section">
                <h4>Ask a Doubt</h4>
                <p>Have a question for this instructor? Write it here.</p>
                <textarea 
                  className="doubt-textarea" 
                  placeholder="Enter your question here..." 
                ></textarea>
                <button className="doubt-submit-btn">Submit Doubt</button>
              </div>
        </div>
        
      </div>
      

      {/* Instructor Details Modal */}
      {selectedInstructor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="instructor-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            <div className="modal-header">
              {selectedInstructor.imageUrl ? (
                <img src={selectedInstructor.imageUrl} alt={selectedInstructor.name} className="modal-photo" />
              ) : (
                <div className="modal-avatar">{selectedInstructor.avatar}</div>
              )}
              <div className="modal-title">
                <h3>{selectedInstructor.name}</h3>
                <p>{selectedInstructor.subject}</p>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>About</h4>
                <p>{selectedInstructor.bio}</p>
              </div>
              <div className="modal-section">
                <h4>Mentorship Details</h4>
                <div className="mentorship-details">
                  <span>Total Sessions: <strong>{selectedInstructor.mentorship.sessions}</strong></span>
                  <span>Last Session: <strong>{selectedInstructor.mentorship.lastSession}</strong></span>
                </div>
              </div>
              <div className="modal-section">
                <h4>Courses Taught</h4>
                <ul className="courses-list">
                  {selectedInstructor.courses.map((course, index) => (
                    <li key={index}>{course}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-section feedback-section">
                <h4>Rating & Feedback</h4>
                <div className="current-rating">
                  <span className="rating-label">Average Rating:</span>
                  <span className="rating-score">{selectedInstructor.rating} ⭐</span>
                </div>
                <button className="feedback-btn">Give Feedback</button>
              </div>
            </div>
          </div>
          
        </div>
        
      )}
    </div>
  );
}
export default MyInstructorsPage
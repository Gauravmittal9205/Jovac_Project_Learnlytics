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
const mockCourseData = [
  {
    id: 1,
    subject: 'Mathematics',
    score: '92%',
    status: 'Excellent',
    averageScore: '85%',
    classRank: 'Top 5%',
    instructorNotes: "Gaurav, your performance in Mathematics is outstanding. Keep up the excellent work, and consider exploring more advanced topics in Number Theory to challenge yourself.",
    topics: [
      { name: 'Algebra', score: '95%', status: 'Excellent' },
      { name: 'Calculus', score: '90%', status: 'Excellent' },
      { name: 'Geometry', score: '89%', status: 'Good' },
    ],
  },
  {
    id: 2,
    subject: 'Programming',
    score: '88%',
    status: 'Good',
    averageScore: '80%',
    classRank: 'Top 10%',
    instructorNotes: "Your progress in Programming is solid. To improve your problem-solving speed, I recommend dedicating more time to mastering data structures like Trees and Graphs.",
    topics: [
      { name: 'Data Structures', score: '82%', status: 'Good' },
      { name: 'Algorithms', score: '88%', status: 'Good' },
      { name: 'Web Development', score: '95%', status: 'Excellent' },
    ],
  },
  {
    id: 3,
    subject: 'Physics',
    score: '75%',
    status: 'Average',
    averageScore: '80%',
    classRank: 'Top 50%',
    instructorNotes: "You are doing well in foundational concepts, but you need to work on practical applications. Attend the problem-solving sessions and ask more doubts on the portal.",
    topics: [
      { name: 'Kinematics', score: '80%', status: 'Good' },
      { name: 'Mechanics', score: '70%', status: 'Average' },
      { name: 'Thermodynamics', score: '75%', status: 'Average' },
    ],
  },
];

function CourseAnalysisPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const handleExpand = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
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
            <NavLink to="/my-instructors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">My Instructors</span>
            </NavLink>
            <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Schedule</span>
            </NavLink>
            <Link to="/course-analysis" className="nav-item active">
              <span className="nav-text">Course Analysis</span>
            </Link>
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
            <h1>Course Analysis</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Course Performance Analysis</h2>
            
            {mockCourseData.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header" onClick={() => handleExpand(course.subject)}>
                  <h3>{course.subject}</h3>
                  <div className="course-stats">
                    <span className="score">Score: {course.score}</span>
                    <span className="status status-tag">{course.status}</span>
                    <span className="toggle-icon">{expandedSubject === course.subject ? '−' : '+'}</span>
                  </div>
                </div>

                {expandedSubject === course.subject && (
                  <div className="course-details">
                    <div className="performance-summary">
                      <div className="summary-card">
                        <p>Average Class Score</p>
                        <h4>{course.averageScore}</h4>
                      </div>
                      <div className="summary-card">
                        <p>Your Class Rank</p>
                        <h4>{course.classRank}</h4>
                      </div>
                    </div>
                    
                    <div className="topic-breakdown">
                      <h4>Topic-wise Breakdown</h4>
                      <ul className="topic-list">
                        {course.topics.map((topic, index) => (
                          <li key={index} className="topic-item">
                            <span className="topic-name">{topic.name}</span>
                            <span className="topic-score">{topic.score}</span>
                            <span className={`status-tag status-${topic.status.toLowerCase()}`}>{topic.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="instructor-notes">
                      <h4>Instructor Notes</h4>
                      <p>{course.instructorNotes}</p>
                    </div>

                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
export default CourseAnalysisPage;
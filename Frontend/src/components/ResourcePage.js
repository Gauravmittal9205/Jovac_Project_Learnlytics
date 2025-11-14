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
const resourcesData = {
  'Video Lectures': {
    'Mathematics': [
      { id: 1, title: 'Calculus I - Limits', url: 'https://www.youtube.com/watch?v=WsQQvHm4lSw' },
      { id: 2, title: 'Algebra II - Linear Equations', url: 'https://www.youtube.com/watch?v=0L-dEp8TuvU&list=PLlxE9WKuvDj85E5j0KBDvf4CFscn3L5hH' },
    ],
    'Physics': [
      { id: 3, title: 'Kinematics - Motion in 1D', url: 'https://www.youtube.com/watch?v=CBvaO-uDvs8&list=PL_A4M5IAkMadyoou3Fl2jR0pG3X1Wi6xA' },
      { id: 4, title: 'Newtonian Mechanics', url: 'https://www.youtube.com/watch?v=zftiLfSVEmI&list=PLh190Xdu5f-vFLr9WEu9lAMK5XYvoqpDv' },
    ],
  },
  'Notes': {
    'Mathematics': [
      { id: 1, title: 'Calculus Notes (PDF)', url: 'https://example.com/notes/math-calc.pdf' },
      { id: 2, title: 'Algebra Practice Sheet', url: 'https://example.com/notes/math-algebra.pdf' },
    ],
    'Physics': [
      { id: 3, title: 'Physics Formulae', url: 'https://example.com/notes/physics-formulae.docx' },
    ],
  },
  'Sample Quizzes': {
    'Mathematics': [
      { id: 1, title: 'Quiz 1: Limits & Continuity', url: 'https://example.com/quiz/math-q1' },
      { id: 2, title: 'Quiz 2: Derivatives', url: 'https://example.com/quiz/math-q2' },
    ],
    'Physics': [
      { id: 3, title: 'Quiz 1: Kinematics', url: 'https://example.com/quiz/physics-q1' },
    ],
  },
  'Practice Questions': {
    'Mathematics': [
      { id: 1, title: 'Math Qs - Chapter 1', url: 'https://example.com/questions/math-ch1' },
      { id: 2, title: 'Math Qs - Chapter 2', url: 'https://example.com/questions/math-ch2' },
    ],
    'Physics': [
      { id: 3, title: 'Physics Qs - Chapter 1', url: 'https://example.com/questions/physics-ch1' },
    ],
  },
};

function ResourcesPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Video Lectures');
  const [activeSubject, setActiveSubject] = useState('');

  // Set the first subject as active when a new tab is clicked
  useEffect(() => {
    if (resourcesData[activeTab]) {
      const firstSubject = Object.keys(resourcesData[activeTab])[0];
      setActiveSubject(firstSubject);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const currentSubjects = resourcesData[activeTab] || {};
  const currentResources = currentSubjects[activeSubject] || [];

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Retained from original code */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
            <Link to="/Studentresources" className="nav-item active">
              <span className="nav-text">Resources</span>
            </Link>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => { clearSession(); navigate('/'); }}>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Resources</h1>
          </div>
        </div>
        <div className="dashboard-container">
          <div className="dashboard-section">
            {/* Main Tabs */}
            <div className="tabs-header">
              {Object.keys(resourcesData).map(tabName => (
                <button
                  key={tabName}
                  className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
                  onClick={() => setActiveTab(tabName)}
                >
                  {tabName}
                </button>
              ))}
            </div>

            {/* Subject Sub-tabs */}
            <div className="subject-tabs">
              {Object.keys(currentSubjects).map(subjectName => (
                <button
                  key={subjectName}
                  className={`subject-tab ${activeSubject === subjectName ? 'active' : ''}`}
                  onClick={() => setActiveSubject(subjectName)}
                >
                  {subjectName}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="resources-content">
              {currentResources.length > 0 ? (
                <div className="resources-list">
                  {currentResources.map(resource => (
                    <div key={resource.id} className="resource-item-card">
                      <h3>{resource.title}</h3>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        View Resource
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No resources available for this subject yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ResourcesPage;
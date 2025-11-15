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
const mockSchedule = [
  {
    day: 'Monday',
    classes: [
      { id: 1, time: '9:00 AM - 10:30 AM', subject: 'Advanced Calculus', instructor: 'Dr. Smith' },
      { id: 2, time: '11:00 AM - 12:30 PM', subject: 'Linear Algebra', instructor: 'Dr. Singh' },
      { id: 3, time: '2:00 PM - 3:30 PM', subject: 'Data Structures & Algorithms', instructor: 'Prof. Johnson' },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      { id: 4, time: '10:00 AM - 11:30 AM', subject: 'Thermodynamics', instructor: 'Ms. Williams' },
      { id: 5, time: '1:00 PM - 2:30 PM', subject: 'Web Development Basics', instructor: 'Prof. Johnson' },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { id: 6, time: '9:00 AM - 10:30 AM', subject: 'Differential Equations', instructor: 'Dr. Smith' },
      { id: 7, time: '1:00 PM - 2:30 PM', subject: 'Quantum Mechanics', instructor: 'Ms. Williams' },
    ],
  },
  {
    day: 'Thursday',
    classes: [
      { id: 8, time: '11:00 AM - 12:30 PM', subject: 'Object-Oriented Programming', instructor: 'Prof. Johnson' },
      { id: 9, time: '3:00 PM - 4:30 PM', subject: 'Classical Physics', instructor: 'Ms. Williams' },
    ],
  },
  {
    day: 'Friday',
    classes: [
      { id: 10, time: '9:00 AM - 10:30 AM', subject: 'Advanced Calculus', instructor: 'Dr. Smith' },
      { id: 11, time: '1:00 PM - 2:30 PM', subject: 'Data Structures & Algorithms', instructor: 'Prof. Johnson' },
    ],
  },
];
function SchedulePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Set the initial selected day to the current day of the week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(today);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const todaySchedule = mockSchedule.find(schedule => schedule.day === selectedDay);

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Your existing sidebar code */}
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
            <Link to="/schedule" className="nav-item active">
              <span className="nav-text">Schedule</span>
            </Link>
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
            <h1>Schedule</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Weekly Schedule</h2>
            <div className="day-selector">
              {mockSchedule.map((schedule) => (
                <button
                  key={schedule.day}
                  className={`day-button ${selectedDay === schedule.day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(schedule.day)}
                >
                  {schedule.day}
                </button>
              ))}
            </div>

            <div className="daily-schedule-card">
              <h3>{todaySchedule?.day}Today's Classes</h3>
              {todaySchedule && todaySchedule.classes.length > 0 ? (
                <div className="classes-list">
                  {todaySchedule.classes.map((classItem) => (
                    <div key={classItem.id} className="class-item">
                      <div className="class-time">{classItem.time}</div>
                      <div className="class-details">
                        <div className="subject-name">{classItem.subject}</div>
                        <div className="instructor-name">with {classItem.instructor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-classes">
                  <p>No classes scheduled for today! Enjoy your day off.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SchedulePage
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiBook, FiCheckCircle, FiAlertTriangle, FiPlus, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SESSION_KEY = 'learnlytics_session';
const API_URL = 'http://localhost:5000/api/auth';

// Color mapping for subjects
const subjectColors = {
  'Mathematics': '#3b82f6',
  'Physics': '#10b981',
  'Chemistry': '#8b5cf6',
  'Computer Science': '#f59e0b',
  'Engineering': '#ec4899',
  'default': '#6b7280'
};

// Mock data
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = Array.from({length: 14}, (_, i) => `${8 + Math.floor(i/2)}:${i % 2 === 0 ? '00' : '30'}`);

const mockSchedule = {
  classes: [
    { id: 1, day: 'Monday', startTime: '09:00', endTime: '10:30', subject: 'Advanced Calculus', instructor: 'Dr. Smith', room: 'A101', color: subjectColors['Mathematics'] },
    { id: 2, day: 'Monday', startTime: '11:00', endTime: '12:30', subject: 'Linear Algebra', instructor: 'Dr. Singh', room: 'B205', color: subjectColors['Mathematics'] },
    { id: 3, day: 'Monday', startTime: '14:00', endTime: '15:30', subject: 'Data Structures', instructor: 'Prof. Johnson', room: 'C301', color: subjectColors['Computer Science'] },
    { id: 4, day: 'Tuesday', startTime: '10:00', endTime: '11:30', subject: 'Thermodynamics', instructor: 'Ms. Williams', room: 'D102', color: subjectColors['Physics'] },
    { id: 5, day: 'Wednesday', startTime: '09:00', endTime: '10:30', subject: 'Differential Equations', instructor: 'Dr. Smith', room: 'A101', color: subjectColors['Mathematics'] },
  ],
  studySessions: [
    { id: 1, subject: 'Advanced Calculus', date: '2025-11-17', startTime: '16:00', endTime: '17:30', completed: false },
    { id: 2, subject: 'Data Structures', date: '2025-11-19', startTime: '15:00', endTime: '16:30', completed: false },
  ]
};

// Helper functions
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

function getDaySchedule(day) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const classes = mockSchedule.classes.filter(cls => cls.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Add isToday flag to each class
  return classes.map(cls => ({
    ...cls,
    isToday: day === today
  }));
}

function getUpcomingStudySessions() {
  const today = new Date().toISOString().split('T')[0];
  return mockSchedule.studySessions
    .filter(session => session.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function SchedulePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable');
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[new Date().getDay()]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
    description: '',
    status: 'Not Started'
  });

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const daySchedule = getDaySchedule(selectedDay);
  const upcomingSessions = getUpcomingStudySessions();
  
  // Sort assignments by due date
  const upcomingAssignments = [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const assignmentStats = upcomingAssignments.reduce((acc, assignment) => {
    acc.total += 1;
    if (assignment.status === 'Completed') acc.completed += 1;
    if (assignment.status === 'In Progress') acc.inProgress += 1;
    if (assignment.status === 'Not Started') acc.pending += 1;
    return acc;
  }, { total: 0, completed: 0, inProgress: 0, pending: 0 });
  const summaryCards = [
    { label: 'Total', value: assignmentStats.total, color: '#2563eb' },
    { label: 'In Progress', value: assignmentStats.inProgress, color: '#16a34a' },
    { label: 'Pending', value: assignmentStats.pending, color: '#ea580c' },
    { label: 'Completed', value: assignmentStats.completed, color: '#0ea5e9' }
  ];

  const handleAddStudySession = () => {
    // Implementation for adding a new study session
    console.log('Add new study session');
  };

  const handleAssignmentComplete = (id, complete) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === id 
        ? { ...assignment, status: complete ? 'Completed' : 'Not Started' } 
        : assignment
    ));
  };

  const handleAddAssignment = () => {
    setShowAssignmentForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    const assignment = {
      ...newAssignment,
      id: generateId(),
      progress: 0
    };
    
    setAssignments([...assignments, assignment]);
    setNewAssignment({
      title: '',
      subject: '',
      dueDate: '',
      priority: 'medium',
      description: '',
      status: 'Not Started'
    });
    setShowAssignmentForm(false);
  };

  const handleCancelAdd = () => {
    setShowAssignmentForm(false);
    setNewAssignment({
      title: '',
      subject: '',
      dueDate: '',
      priority: 'medium',
      description: '',
      status: 'Not Started'
    });
  };

  // Function to check if two time periods overlap
  const isOverlapping = (time1, time2) => {
    const [start1, end1] = [time1.startTime, time1.endTime].map(t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    });
    const [start2, end2] = [time2.startTime, time2.endTime].map(t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    });
    return start1 < end2 && start2 < end1;
  };

  // Group overlapping classes
  const groupOverlappingClasses = (classes) => {
    if (classes.length === 0) return [];
    
    // Sort classes by start time
    const sorted = [...classes].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    const groups = [];
    let currentGroup = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const currentClass = sorted[i];
      const overlaps = currentGroup.some(cls => isOverlapping(cls, currentClass));
      
      if (overlaps) {
        currentGroup.push(currentClass);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [currentClass];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  // Render the timetable view
  const renderTimetable = () => {
    const timeSlotHeight = 60; // pixels per hour
    const startHour = 8; // 8 AM start time
    const overlappingGroups = groupOverlappingClasses(daySchedule);

    return (
      <div className="timetable-container">
        <div className="timetable-header">
          <h3>Class Schedule</h3>
        </div>

        <div className="day-selector">
          {daysOfWeek.map(day => (
            <button
              key={day}
              className={`day-button ${selectedDay === day ? 'active' : ''} ${day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'today' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="timetable">
          <div className="time-column">
            {timeSlots.map((time, index) => (
              <div key={index} className="time-slot">
                {time}
              </div>
            ))}
          </div>
          
          <div className="schedule-grid">
            {daySchedule.length > 0 ? (
              // Render each group of overlapping classes
              overlappingGroups.map((group, groupIndex) => (
                group.map((cls, index) => {
                  // Calculate position and height in pixels
                  const [startH, startM] = cls.startTime.split(':').map(Number);
                  const [endH, endM] = cls.endTime.split(':').map(Number);
                  
                  // Calculate top position in pixels
                  const top = ((startH - startHour) * timeSlotHeight) + 
                             (startM / 60 * timeSlotHeight);
                  
                  // Calculate height in pixels
                  const duration = ((endH * 60 + endM) - (startH * 60 + startM));
                  const height = (duration / 60) * timeSlotHeight;
                  
                  // Calculate width and left position for overlapping classes
                  const groupSize = group.length;
                  const width = `calc(${100 / groupSize}% - ${(groupSize - 1) * 5}px)`;
                  const left = `${(index % groupSize) * (100 / groupSize)}%`;
                  
                  return (
                    <motion.div
                      key={cls.id}
                      className="class-block"
                      data-subject={cls.subject}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        width: width,
                        left: left,
                        zIndex: 1,
                        backgroundColor: cls.color || subjectColors['default'],
                        borderLeftColor: cls.color || subjectColors['default']
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="class-subject">{cls.subject}</div>
                      <div className="class-details">
                        <span>{cls.room}</span>
                        <span>{cls.instructor}</span>
                      </div>
                      <div className="class-time">
                        {cls.startTime} - {cls.endTime}
                      </div>
                    </motion.div>
                  );
                })
              ))
            ) : (
              <div className="empty-timetable">
                <FiCalendar size={48} />
                <h4>No classes scheduled</h4>
                <p>You don't have any classes scheduled for {selectedDay}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
            <h1>Academic Planner</h1>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Navigation Tabs */}
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <FiCalendar className="mr-2" /> Timetable
            </button>
            <button 
              className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              <FiBook className="mr-2" /> Assignments
            </button>
          </div>

          {/* Timetable View */}
          {activeTab === 'timetable' && renderTimetable()}

          {/* Assignments View */}
          {activeTab === 'assignments' && (
            <div className="assignments-view">
              <div className="assignments-header">
                <div>
                  <h3>Upcoming Assignments</h3>
                  <p className="subtext">Track deadlines, progress, and priorities in one place.</p>
                </div>
                <button className="btn-primary" onClick={handleAddAssignment}>
                  <FiPlus /> Add Assignment
                </button>
              </div>

              {showAssignmentForm && (
                <div className="assignment-form-container">
                  <h4>Add New Assignment</h4>
                  <form onSubmit={handleSubmitAssignment} className="assignment-form">
                    <div className="form-group">
                      <label>Title</label>
                      <input 
                        type="text" 
                        name="title" 
                        value={newAssignment.title}
                        onChange={handleInputChange}
                        required 
                        placeholder="Assignment title"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject</label>
                        <input 
                          type="text" 
                          name="subject" 
                          value={newAssignment.subject}
                          onChange={handleInputChange}
                          required 
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Due Date</label>
                        <input 
                          type="date" 
                          name="dueDate" 
                          value={newAssignment.dueDate}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Priority</label>
                      <select 
                        name="priority" 
                        value={newAssignment.priority}
                        onChange={handleInputChange}
                        className="priority-select"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Description (Optional)</label>
                      <textarea 
                        name="description" 
                        value={newAssignment.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Add any additional details..."
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={handleCancelAdd}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Add Assignment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="assignments-summary">
                {summaryCards.map(card => (
                  <div key={card.label} className="summary-card">
                    <span className="summary-value" style={{ color: card.color }}>{card.value}</span>
                    <span className="summary-label">{card.label}</span>
                  </div>
                ))}
              </div>

              <div className="assignments-list">
                {upcomingAssignments.map(assignment => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-card-content">
                      <div className="assignment-header">
                        <h4>{assignment.title}</h4>
                        <span className={`status-badge ${assignment.status.toLowerCase().replace(' ', '-')}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="assignment-meta">
                        <span className="subject-tag" style={{ backgroundColor: subjectColors[assignment.subject.split(' ')[0]] || subjectColors['default'] }}>
                          {assignment.subject}
                        </span>
                        <span className="assignment-priority-label">Priority: {assignment.priority}</span>
                      </div>
                      <div className="assignment-meta">
                        <span className="due-date">
                          <FiClock /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="assignment-description">
                        {assignment.description || 'No description provided.'}
                      </div>
                    </div>
                    <div className="assignment-actions">
                      <button 
                        className={`submit-status-btn ${assignment.status === 'Completed' ? 'submitted' : ''}`}
                        onClick={() => handleAssignmentComplete(assignment.id, assignment.status !== 'Completed')}
                      >
                        {assignment.status === 'Completed' ? (
                          <>
                            <FiCheckCircle className="submit-icon" /> Submitted
                          </>
                        ) : (
                          <>
                            <FiUpload className="submit-icon" /> Submit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
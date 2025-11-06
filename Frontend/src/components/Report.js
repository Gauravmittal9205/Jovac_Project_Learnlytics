import React, { useState, useRef, useEffect, useContext } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart, 
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar
} from "recharts";
function WeeklyReport(){
  const session = readSession();
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  // Mock data for demonstration
  const studentData = {
    name: session?.name || 'John Doe',
    course: 'Computer Science',
    year: '2024',
    semester: 'Spring',
    photo: '👨‍🎓',
    attendance: 87,
    avgQuizScore: 78,
    totalStudyHours: 142,
    engagementScore: 82,
    riskLevel: 'Low',
    engagementTrend: [
      { week: 'Week 1', score: 75 },
      { week: 'Week 2', score: 78 },
      { week: 'Week 3', score: 82 },
      { week: 'Week 4', score: 85 },
      { week: 'Week 5', score: 80 },
      { week: 'Week 6', score: 88 },
      { week: 'Week 7', score: 82 }
    ],
    timeDistribution: [
      { activity: 'Videos', hours: 45, percentage: 32 },
      { activity: 'Quizzes', hours: 28, percentage: 20 },
      { activity: 'Reading', hours: 35, percentage: 25 },
      { activity: 'Assignments', hours: 34, percentage: 23 }
    ],
    performanceData: [
      { subject: 'Mathematics', score: 85, status: 'good' },
      { subject: 'Programming', score: 92, status: 'excellent' },
      { subject: 'Data Structures', score: 78, status: 'good' },
      { subject: 'Algorithms', score: 65, status: 'needs-improvement' },
      { subject: 'Database', score: 88, status: 'good' }
    ],
    recommendations: [
      { type: 'video', title: 'Advanced Algorithm Techniques', reason: 'Based on your Algorithms performance' },
      { type: 'reading', title: 'Data Structures Fundamentals', reason: 'To strengthen your foundation' },
      { type: 'quiz', title: 'Practice Quiz: Sorting Algorithms', reason: 'Targeted practice for weak areas' }
    ]
  };

  const downloadReport = () => {
    setShowReportModal(true);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleCourseAction = (course, action) => {
    if (action === 'view') {
      handleCourseClick(course);
    } else if (action === 'download') {
      alert(`Downloading detailed report for ${course.subject}...`);
    }
  };

  const handleCardHover = (index) => {
    setHoveredCard(index);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
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
            {studentData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{studentData.name}</h4>
            <p>{studentData.course}</p>
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
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <Link to="/weekly-report" className="nav-item active">
              <span className="nav-text">Weekly Report</span>
            </Link>
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
            <h1>Weekly Report</h1>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{studentData.engagementScore}%</span>
                <span className="stat-label">Engagement</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{studentData.riskLevel}</span>
                <span className="stat-label">Risk Level</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Overall Report Graph Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Overall Performance Trend</h2>
           


    <div className="report-card">
      <div className="card-header">
        <h3 className="card-title">Weekly Report</h3>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{currentScore}%</span>
            <span className="stat-label">Engagement</span>
          </div>
          <div className="stat-item">
            <span className="stat-value risk-low">Low</span>
            <span className="stat-label">Risk Level</span>
          </div>
        </div>
      </div>

      <div className="performance-section">
        
        <div className="chart-container-recharts">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={engagementData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <YAxis domain={[70, 90]} hide /> {/* Set the domain for a better view */}
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ stroke: '#ddd', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3f51b5"
                strokeWidth={3}
                dot={{ stroke: '#fff', strokeWidth: 2, r: 6 }}
                activeDot={{ stroke: '#3f51b5', strokeWidth: 2, r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-stat">
          <span className="stat-label">Current Score:</span>
          <span className="stat-value score-primary">{currentScore}%</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Trend:</span>
          <span className={`stat-value trend ${trend === 'Improving' ? 'trend-positive' : ''}`}>
            {trend === 'Improving' ? '↗ Improving' : 'Stable'}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Peak Score:</span>
          <span className="stat-value score-primary">{peakScore}%</span>
        </div>
      </div>
    </div>
          </div>

          {/* Course Report Section */}
          <div className="dashboard-section">
            <div className="section-header">
        <h2 className="section-title">Course Performance Report</h2>
        <div className="section-actions">
          <button className="btn-icon" title="Filter courses">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 3L2 3L10 12.46L10 19L14 21L14 12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-icon" title="Sort by performance">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M6 12H18M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-icon" title="View more options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="19" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="course-stats-overview">
        <div className="stat-box gradient-1">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{totalCourses}</span>
            <span className="stat-label">Total Courses</span>
          </div>
        </div>
        
        <div className="stat-box gradient-2">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{averageScore}%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
        
        <div className="stat-box gradient-3">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{excellentCourses}</span>
            <span className="stat-label">Excellent</span>
          </div>
        </div>
        
        <div className="stat-box gradient-4">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{needsAttentionCourses}</span>
            <span className="stat-label">Needs Attention</span>
          </div>
        </div>
      </div>

            <div className="course-report-grid">
              {weeklyData.performanceData.map((course, index) => (
                <div 
                  key={index} 
                  className={`course-report-card ${course.status} hover-lift ${hoveredCard === index ? 'hovered' : ''}`}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="card-header">
                    <div className="course-icon">
                      {course.subject === 'Mathematics' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Programming' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Data Structures' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Algorithms' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Database' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12C3 14.2 6.6 16 12 16C17.4 16 21 14.2 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 5V19C3 21.2 6.6 23 12 23C17.4 23 21 21.2 21 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="course-info">
                      <h4>{course.subject}</h4>
                      <p className="course-code">CS-{100 + index}</p>
                    </div>
                    <div className="course-actions">
                      <button 
                        className="action-btn" 
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseAction(course, 'view');
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn" 
                        title="Download report"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseAction(course, 'download');
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="performance-section">
                      <div className="score-display">
                        <div className="score-circle">
                          <div className="score-value">{course.score}%</div>
                          <div className="score-label">Score</div>
                        </div>
                        <div className="score-details">
                          <div className={`performance-badge ${course.status}`}>
                            {course.status === 'excellent' ? '🌟 Excellent' : 
                             course.status === 'good' ? '✅ Good' : '⚠️ Needs Improvement'}
                          </div>
                          <div className="score-trend">
                            {course.score > 80 ? '↗️' : course.score > 60 ? '→' : '↘️'} 
                            {course.score > 80 ? ' Improving' : course.score > 60 ? ' Stable' : ' Declining'}
                          </div>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Overall Progress</span>
                          <span>{course.score}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${course.status}`} 
                              style={{ width: `${course.score}%` }}
                            ></div>
                            <div className="progress-glow"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="course-metrics">
                      <div className="metric-row">
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">8/10</span>
                            <span className="metric-label">Assignments</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">6/8</span>
                            <span className="metric-label">Quizzes</span>
                          </div>
                        </div>
                      </div>
                      <div className="metric-row">
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5904 20.2 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">85%</span>
                            <span className="metric-label">Participation</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">24h</span>
                            <span className="metric-label">Study Time</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="course-insights">
                      <div className="insight-item">
                        <span className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="insight-text">
                          {course.status === 'excellent' ? 'Outstanding performance! Keep up the great work.' :
                           course.status === 'good' ? 'Good progress. Consider focusing on weak areas.' :
                           'Focus needed. Consider additional study time and resources.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="btn-outline">
                      View Detailed Report
                    </button>
                    <button className={`btn-action ${course.status}`}>
                      {course.status === 'needs-improvement' ? 'Get Help' : 'Continue'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="course-actions-footer">
              <button className="btn-primary">
                📊 Generate All Course Reports
              </button>
              <button className="btn-secondary">
                📈 Compare Performance
              </button>
              <button className="btn-outline">
                📤 Export All Data
              </button>
            </div>
          </div>

          {/* Reports Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Generate Reports</h2>
            <div className="reports-card">
              <div className="report-info">
                <h3>Comprehensive Progress Report</h3>
                <p>Download your detailed progress report including performance trends, course analysis, and personalized recommendations.</p>
                <div className="report-features">
                  <span>Performance Analytics</span>
                  <span>Engagement Trends</span>
                  <span>Course Breakdown</span>
                  <span>Risk Assessment</span>
                  <span>Recommendations</span>
                  <span>Study Insights</span>
                </div>
              </div>
              <div className="report-actions">
                <button className="btn primary" onClick={downloadReport}>
                  Download PDF Report
                </button>
                <button className="btn ghost">
                  Export Excel Data
                </button>
                <button className="btn ghost">
                  Share Report
                </button>
              </div>
            </div>
          </div>

          {/* Course Details Modal */}
          {showCourseDetails && selectedCourse && (
            <div className="modal-overlay" onClick={() => setShowCourseDetails(false)}>
              <div className="modal-content course-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{selectedCourse.subject} - Detailed Report</h3>
                  <button className="modal-close" onClick={() => setShowCourseDetails(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="course-detail-content">
                    <div className="course-detail-header">
                      <div className="course-detail-icon">
                        {selectedCourse.subject === 'Mathematics' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Programming' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Data Structures' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Algorithms' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Database' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 12C3 14.2 6.6 16 12 16C17.4 16 21 14.2 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 5V19C3 21.2 6.6 23 12 23C17.4 23 21 21.2 21 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="course-detail-info">
                        <h4>{selectedCourse.subject}</h4>
                        <p>Computer Science Course</p>
                        <div className={`performance-badge ${selectedCourse.status}`}>
                          {selectedCourse.status === 'excellent' ? '🌟 Excellent' : 
                           selectedCourse.status === 'good' ? '✅ Good' : '⚠️ Needs Improvement'}
                        </div>
                      </div>
                    </div>

                    <div className="course-detail-metrics">
                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Overall Score</span>
                        </div>
                        <div className="metric-value">{selectedCourse.score}%</div>
                        <div className="metric-progress">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${selectedCourse.status}`} 
                              style={{ width: `${selectedCourse.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Assignments</span>
                        </div>
                        <div className="metric-value">8/10</div>
                        <div className="metric-subtitle">80% Completion</div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Quizzes</span>
                        </div>
                        <div className="metric-value">6/8</div>
                        <div className="metric-subtitle">75% Completion</div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5904 20.2 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Participation</span>
                        </div>
                        <div className="metric-value">85%</div>
                        <div className="metric-subtitle">Active Engagement</div>
                      </div>
                    </div>

                    <div className="course-detail-insights">
                      <h5>Performance Insights</h5>
                      <div className="insights-list">
                        <div className="insight-item">
                          <span className="insight-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="insight-content">
                            <strong>Strengths:</strong>
                            <p>
                              {selectedCourse.status === 'excellent' ? 'Consistent high performance across all areas' :
                               selectedCourse.status === 'good' ? 'Good understanding of core concepts' :
                               'Some areas showing improvement potential'}
                            </p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="insight-content">
                            <strong>Focus Areas:</strong>
                            <p>
                              {selectedCourse.status === 'needs-improvement' ? 'Consider additional study time and practice' :
                               'Continue current study approach for optimal results'}
                            </p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="insight-content">
                            <strong>Recommendations:</strong>
                            <p>
                              {selectedCourse.status === 'excellent' ? 'Maintain current study habits and consider advanced topics' :
                               selectedCourse.status === 'good' ? 'Focus on weak areas while maintaining strengths' :
                               'Increase study time and seek additional resources'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-detail-actions">
                    <button className="btn-primary" onClick={() => {
                      alert(`Generating detailed report for ${selectedCourse.subject}...`);
                    }}>
                      📄 Generate Report
                    </button>
                    <button className="btn-secondary" onClick={() => {
                      alert(`Downloading data for ${selectedCourse.subject}...`);
                    }}>
                      📥 Download Data
                    </button>
                    <button className="btn-outline" onClick={() => setShowCourseDetails(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Modal */}
          {showReportModal && (
            <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
              <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Comprehensive Progress Report</h3>
                  <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="report-preview">
                    <div className="report-header">
                      <h4>Student Progress Report</h4>
                      <p>Generated on {new Date().toLocaleDateString()}</p>
                      <p>Student: {studentData.name} | Course: {studentData.course}</p>
                    </div>
                    
                    <div className="report-summary">
                      <h5>Overall Performance Summary</h5>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Overall Performance:</span>
                          <span className="summary-value good">Good (82%)</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Engagement Trend:</span>
                          <span className="summary-value positive">↗ Improving</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Risk Level:</span>
                          <span className="summary-value low">Low Risk</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Study Hours:</span>
                          <span className="summary-value">{studentData.totalStudyHours}h</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Attendance:</span>
                          <span className="summary-value">{studentData.attendance}%</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Quiz Average:</span>
                          <span className="summary-value">{studentData.avgQuizScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="report-courses">
                      <h5>Course Performance Breakdown</h5>
                      <div className="course-performance-list">
                        {studentData.performanceData.map((course, index) => (
                          <div key={index} className="course-performance-item">
                            <div className="course-name">{course.subject}</div>
                            <div className="course-score">
                              <div className="score-bar">
                                <div 
                                  className={`score-fill ${course.status}`} 
                                  style={{ width: `${course.score}%` }}
                                ></div>
                              </div>
                              <span className="score-text">{course.score}%</span>
                            </div>
                            <div className={`course-status ${course.status}`}>
                              {course.status === 'excellent' ? 'Excellent' : 
                               course.status === 'good' ? 'Good' : 'Needs Improvement'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="report-trends">
                      <h5>Weekly Performance Trend</h5>
                      <div className="trend-chart-mini">
                        {studentData.engagementTrend.map((point, index) => (
                          <div key={index} className="trend-point" style={{
                            left: `${(index / (studentData.engagementTrend.length - 1)) * 100}%`,
                            bottom: `${point.score}%`
                          }}>
                            <div className="trend-dot"></div>
                            <div className="trend-value">{point.score}%</div>
                          </div>
                        ))}
                        <div className="trend-line"></div>
                      </div>
                    </div>

                    <div className="report-recommendations">
                      <h5>Key Recommendations & Next Steps</h5>
                      <ul>
                        <li>Focus on Algorithm concepts - current score: 65% (Priority: High)</li>
                        <li>Continue strong performance in Programming (92%) - maintain current study habits</li>
                        <li>Increase study time for Data Structures to reach 85%+ target</li>
                        <li>Maintain consistent study schedule - current 142 hours is good</li>
                        <li>Consider joining study groups for challenging subjects</li>
                      </ul>
                    </div>

                    <div className="report-insights">
                      <h5>Study Insights</h5>
                      <div className="insights-grid">
                        <div className="insight-item">
                          <span className="insight-icon">📚</span>
                          <div>
                            <strong>Time Distribution</strong>
                            <p>Most time spent on Videos (32%), followed by Reading (25%)</p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">🎯</span>
                          <div>
                            <strong>Focus Areas</strong>
                            <p>Algorithms needs attention, Programming is your strength</p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">📈</span>
                          <div>
                            <strong>Progress Trend</strong>
                            <p>Overall improvement trend with peak at Week 6 (88%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="report-actions">
                    <button className="btn primary" onClick={() => {
                      // Simulate PDF generation and download
                      const reportData = {
                        student: studentData.name,
                        course: studentData.course,
                        date: new Date().toLocaleDateString(),
                        performance: studentData.performanceData,
                        trends: studentData.engagementTrend,
                        summary: {
                          overall: studentData.engagementScore,
                          attendance: studentData.attendance,
                          studyHours: studentData.totalStudyHours,
                          riskLevel: studentData.riskLevel
                        }
                      };
                      console.log('Generating PDF with data:', reportData);
                      alert('Comprehensive PDF report downloaded successfully!');
                      setShowReportModal(false);
                    }}>
                      📄 Download PDF Report
                    </button>
                    <button className="btn ghost" onClick={() => {
                      alert('Excel data exported successfully!');
                    }}>
                      📊 Export Excel Data
                    </button>
                    <button className="btn ghost" onClick={() => setShowReportModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
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
function OverviewPage() {
  
  const session = readSession();
   const navigate = useNavigate();
   const [sidebarOpen, setSidebarOpen] = useState(true);
  

   useEffect(() => {
     if (!session) {
       navigate('/login');
       return;
     }
   }, [navigate, session]);
 
   // Use data directly from session
   const userName = session?.name || "Student";
   const userEmail = session?.email || "";
 
   const studentData = {
     name: userName,
     email: userEmail,
     course: "Computer Science",
     year: "3rd Year",
     semester: "Fall 2024",
     photo: "👨‍🎓",
     attendance: 95,
     avgQuizScore: 87,
     totalStudyHours: 42,
     engagementScore: 92,
     riskLevel: "Low",
     data: [
       { week: "Week 1", score: 85 },
       { week: "Week 2", score: 88 },
       { week: "Week 3", score: 92 },
       { week: "Week 4", score: 33 },
       { week: "Week 5", score: 94 },
       { week: "Week 6", score: 96 },
     ],
     timeData: [
       { activity: "Lectures", hours: 15, percentage: 35 },
       { activity: "Assignments", hours: 12, percentage: 28 },
       { activity: "Study", hours: 10, percentage: 23 },
       { activity: "Projects", hours: 6, percentage: 14 },
     ],
     performanceData: [
       { subject: "Mathematics", score: 92, status: "excellent" },
       { subject: "Programming", score: 88, status: "good" },
       { subject: "Data Structures", score: 85, status: "good" },
       { subject: "Algorithms", score: 90, status: "excellent" },
       { subject: "Database", score: 78, status: "needs-improvement" },
     ],
     recommendations: [
       {
         type: "study",
         title: "Advanced Algorithms",
         reason: "Based on your strong performance in basic algorithms",
       },
       {
         type: "practice",
         title: "Database Design",
         reason: "Improve your database management skills",
       },
       {
         type: "resource",
         title: "Math Problem Sets",
         reason: "Maintain your excellent math performance",
       },
     ],
   };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  const Colors = ["#8b5cf6"];

  // Risk level dummy data
  const riskData = [{ name: "Risk", value: studentData.engagementScore }];
  const needleAngle = (studentData.engagementScore / 100) * 180;
  const riskLevel = studentData.riskLevel;
  

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {studentData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
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
              navigate("/");
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        

        <div className="dashboard-container">
          
          <div className="welcome-banner-modern">
            <div className="banner-content-wrapper">
              <div className="banner-text-section">
                <p className="banner-date-text">September 4, 2023</p>
                <h1 className="banner-welcome-title">Welcome back, {studentData.name.split(' ')[0]}!</h1>
                <p className="banner-welcome-subtitle">Always stay updated in your student portal</p>
              </div>
              <div className="banner-illustration-section">
                <div className="illustration-character-3d">👨‍🎓</div>
                <div className="floating-element elem-1">🎓</div>
                <div className="floating-element elem-2">📚</div>
                <div className="floating-element elem-3">🔒</div>
                <div className="floating-element elem-4">☕</div>
              </div>
            </div>
          </div>
          <div className="overview-main-grid">
          <div className="overview-left-col">
          <div className="modern-section-card">
                <h2 className="modern-section-heading">Quick Stat</h2>
                <div className="finance-cards-grid">
                  <div className="finance-stat-card">
                    <div className="finance-icon-wrapper">✅</div>
                    <div className="finance-details">
                      <p className="finance-value">95%</p>
                      <p className="finance-label-text">Attendence</p>
                    </div>
                  </div>
                  <div className="finance-stat-card finance-highlighted">
                    <div className="finance-icon-wrapper">📈</div>
                    <div className="finance-details">
                      <p className="finance-value">340</p>
                      <p className="finance-label-text">Engagement Score</p>
                    </div>
                  </div>
                  <div className="finance-stat-card">
                    <div className="finance-icon-wrapper">🎯</div>
                    <div className="finance-details">
                      <p className="finance-value">89%</p>
                      <p className="finance-label-text">Quiz Score</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modern-section-card">
                <div className="section-header-with-action">
                  <h2 className="modern-section-heading">Enrolled Courses</h2>
                  <button className="see-all-link">See all</button>
                </div>
                <div className="enrolled-courses-grid">
                  <div className="enrolled-course-card">
                    <div className="course-icon-display" style={{backgroundColor: '#1a7bd9'}}>
                      💻
                    </div>
                    <h3 className="course-card-title">Object oriented programming</h3>
                    <button className="course-view-button">View</button>
                  </div>
                  <div className="enrolled-course-card">
                    <div className="course-icon-display" style={{backgroundColor: '#16b0a9'}}>
                      📊
                    </div>
                    <h3 className="course-card-title">Fundamentals of database systems</h3>
                    <button className="course-view-button">View</button>
                  </div>
                </div>
              </div>
              </div>
              <div className="overview-left-col">
              <div className="modern-section-card">
                <div className="section-header-with-action">
                  <h2 className="modern-section-heading">Daily notice</h2>
                  <button className="see-all-link">See all</button>
                </div>
                <div className="daily-notices-list">
                  <div className="notice-list-item">
                    <h3 className="notice-item-title">Prelim payment due</h3>
                    <p className="notice-item-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit.</p>
                    <button className="notice-see-more-btn">See more</button>
                  </div>
                  <div className="notice-list-item">
                    <h3 className="notice-item-title">Exam schedule</h3>
                    <p className="notice-item-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit.</p>
                    <button className="notice-see-more-btn">See more</button>
                  </div>
                </div>
                </div>
                </div>
              
              </div>
              
          

         

          {/* Enhanced Recommendations Section */}
<div className="dashboard-section">
  <div className="section-header">
    <h2 className="section-title">Suggested for You</h2>
    <p className="section-subtitle">Personalized recommendations based on your learning goals</p>
  </div>
  
  <div className="recommendations-grid">
    {studentData.recommendations.map((rec, index) => (
      <div key={index} className="recommendation-card enhanced">
        <div className="card-header">
          <div className={`rec-icon ${rec.type}`}>
            {rec.type === 'course' && '📚'}
            {rec.type === 'quiz' && '🧠'}
            {rec.type === 'tutorial' && '💡'}
            {rec.type === 'practice' && '🎯'}
          </div>
          <div className="rec-type-badge">
            {rec.type}
          </div>
        </div>
        
        <div className="card-content">
          <h4 className="rec-title">{rec.title}</h4>
          <p className="rec-description">{rec.reason}</p>
          
          {rec.difficulty && (
            <div className="rec-meta">
              <span className={`difficulty-badge ${rec.difficulty.toLowerCase()}`}>
                {rec.difficulty}
              </span>
              {rec.duration && (
                <span className="duration-info">⏱️ {rec.duration}</span>
              )}
            </div>
          )}
          
          {rec.progress !== undefined && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${rec.progress}%`}}
                ></div>
              </div>
              <span className="progress-text">{rec.progress}% complete</span>
            </div>
          )}
        </div>
        
        <div className="card-actions">
  <button
    className="btn-recommendation-primary"
    onClick={() => {
              if (rec.type === 'course' || rec.type === 'tutorial') {
                navigate(`/learn/${rec.title.replace(/\s+/g, "-").toLowerCase()}`);
              } else if (rec.type === 'quiz') {
                navigate(`/quiz/${rec.title.replace(/\s+/g, "-").toLowerCase()}`);
              } else {
                navigate(`/recommendation/${rec.title.replace(/\s+/g, "-").toLowerCase()}`);
              }
            }}
          >
            Start Now
            </button>

</div>

      </div>
    ))}
  </div>
</div>
        </div>
      </div>
    </div>
    
  );
}
export default OverviewPage;
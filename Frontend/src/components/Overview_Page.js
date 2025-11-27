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
   const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
  

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

   const announcementsData = [
     {
       id: 1,
       type: "urgent",
       badge: "Urgent",
       time: "30 mins ago",
       title: "Mid-term Exam Schedule Updated",
       shortDesc: "CS301 Mid-term exam has been rescheduled to next Monday due to venue change. Please check your email for details.",
       fullDetails: {
         course: "CS301 - Data Structures",
         newDate: "Monday, December 18, 2024",
         time: "9:00 AM - 11:00 AM",
         venue: "Main Auditorium, Block C",
         reason: "The previous venue is under maintenance. All students must attend at the new location.",
         instructor: "Dr. Sarah Johnson",
         contact: "sarah.johnson@university.edu",
         additionalInfo: "Please bring your student ID card and stationery. Electronic devices are not allowed during the exam."
       }
     },
     {
       id: 2,
       type: "info",
       badge: "Info",
       time: "2 hours ago",
       title: "New Learning Resources Available",
       shortDesc: "Advanced Python tutorials and practice problems have been added to the resource center.",
       fullDetails: {
         resources: [
           "Python Advanced OOP Concepts - 12 video tutorials",
           "Data Analysis with Pandas - Interactive notebook",
           "Web Scraping Best Practices - Documentation",
           "Machine Learning Basics - 50+ practice problems"
         ],
         addedBy: "Resource Center Team",
         category: "Programming & Development",
         accessLink: "/resources/python-advanced",
         difficulty: "Intermediate to Advanced",
         estimatedTime: "15-20 hours of content",
         additionalInfo: "These resources are curated specifically for students looking to advance their Python skills beyond fundamentals."
       }
     },
     {
       id: 3,
       type: "event",
       badge: "Event",
       time: "1 day ago",
       title: "Guest Lecture: AI in Industry",
       shortDesc: "Join us this Friday for a special guest lecture on AI applications in modern industry.",
       fullDetails: {
         speaker: "Dr. Michael Chen",
         company: "TechCorp AI Solutions",
         speakerBio: "Chief AI Architect with 15+ years of experience in implementing AI solutions",
         date: "Friday, December 15, 2024",
         time: "2:00 PM - 4:00 PM",
         venue: "University Auditorium",
         topics: [
           "Real-world AI implementation challenges",
           "Machine Learning in production systems",
           "Career opportunities in AI/ML",
           "Q&A Session"
         ],
         registration: "Registration is mandatory - Limited seats available",
         benefits: "Attendance certificate will be provided",
         additionalInfo: "This is a great opportunity to network with industry professionals and learn about practical AI applications."
       }
     }
   ];

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
                <h2 className="modern-section-heading">Quick Stats</h2>
                <div className="stats-cards-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon-wrapper">✅</div>
                    <div className="stat-details">
                      <p className="stat-value">95%</p>
                      <p className="stat-label">Attendance</p>
                    </div>
                  </div>
                  <div className="stat-card secondary">
                    <div className="stat-icon-wrapper">📈</div>
                    <div className="stat-details">
                      <p className="stat-value">340</p>
                      <p className="stat-label">Engagement Score</p>
                    </div>
                  </div>
                  <div className="stat-card tertiary">
                    <div className="stat-icon-wrapper">🎯</div>
                    <div className="stat-details">
                      <p className="stat-value">89%</p>
                      <p className="stat-label">Quiz Score</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modern-section-card">
                <div className="section-header-with-action">
                  <h2 className="modern-section-heading">Recent Activity</h2>
                  <button className="see-all-link">View all</button>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <h4>Assignment Submitted</h4>
                      <p>Data Structures - Week 5 Assignment</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">🎥</div>
                    <div className="activity-content">
                      <h4>Lecture Watched</h4>
                      <p>Algorithm Design - Lecture 12</p>
                      <span className="activity-time">5 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">🏆</div>
                    <div className="activity-content">
                      <h4>Quiz Completed</h4>
                      <p>Database Systems - SQL Fundamentals</p>
                      <span className="activity-time">1 day ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">💬</div>
                    <div className="activity-content">
                      <h4>Forum Post</h4>
                      <p>Replied to "Help with Recursion"</p>
                      <span className="activity-time">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modern-section-card">
                <div className="section-header-with-action">
                  <h2 className="modern-section-heading">Quick Actions</h2>
                </div>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn primary-action"
                    onClick={() => navigate('/academic-performance')}
                  >
                    <span className="action-icon">📝</span>
                    <span className="action-text">Submit Assignment</span>
                  </button>
                  <button 
                    className="quick-action-btn secondary-action"
                    onClick={() => navigate('/Studentresources')}
                  >
                    <span className="action-icon">📚</span>
                    <span className="action-text">Browse Resources</span>
                  </button>
                  <button 
                    className="quick-action-btn tertiary-action"
                    onClick={() => navigate('/help')}
                  >
                    <span className="action-icon">💬</span>
                    <span className="action-text">Ask Question</span>
                  </button>
                  <button 
                    className="quick-action-btn quaternary-action"
                    onClick={() => navigate('/course-analysis')}
                  >
                    <span className="action-icon">📊</span>
                    <span className="action-text">View Progress</span>
                  </button>
                </div>
              </div>
              </div>
              <div className="overview-right-col">
              <div className="modern-section-card">
                <div className="section-header-with-action">
                  <h2 className="modern-section-heading">Announcements</h2>
                  <button className="see-all-link">See all</button>
                </div>
                <div className="announcements-list">
                  {announcementsData.map((announcement) => (
                    <div 
                      key={announcement.id}
                      className={`announcement-item ${announcement.type} ${expandedAnnouncement === announcement.id ? 'expanded' : ''}`}
                      onClick={() => setExpandedAnnouncement(expandedAnnouncement === announcement.id ? null : announcement.id)}
                    >
                      <div className="announcement-header">
                        <span className={`announcement-badge ${announcement.type}`}>{announcement.badge}</span>
                        <span className="announcement-time">{announcement.time}</span>
                      </div>
                      <h4>{announcement.title}</h4>
                      <p className="announcement-short-desc">{announcement.shortDesc}</p>
                      
                      {expandedAnnouncement === announcement.id && (
                        <div className="announcement-details">
                          <div className="details-divider"></div>
                          
                          {announcement.type === 'urgent' && (
                            <div className="details-content">
                              <div className="detail-row">
                                <strong>📚 Course:</strong>
                                <span>{announcement.fullDetails.course}</span>
                              </div>
                              <div className="detail-row">
                                <strong>📅 New Date:</strong>
                                <span>{announcement.fullDetails.newDate}</span>
                              </div>
                              <div className="detail-row">
                                <strong>⏰ Time:</strong>
                                <span>{announcement.fullDetails.time}</span>
                              </div>
                              <div className="detail-row">
                                <strong>📍 Venue:</strong>
                                <span>{announcement.fullDetails.venue}</span>
                              </div>
                              <div className="detail-row">
                                <strong>💡 Reason:</strong>
                                <span>{announcement.fullDetails.reason}</span>
                              </div>
                              <div className="detail-row">
                                <strong>👨‍🏫 Instructor:</strong>
                                <span>{announcement.fullDetails.instructor}</span>
                              </div>
                              <div className="detail-row">
                                <strong>📧 Contact:</strong>
                                <span>{announcement.fullDetails.contact}</span>
                              </div>
                              <div className="detail-note">
                                <strong>Note:</strong> {announcement.fullDetails.additionalInfo}
                              </div>
                            </div>
                          )}
                          
                          {announcement.type === 'info' && (
                            <div className="details-content">
                              <div className="detail-row">
                                <strong>📂 Category:</strong>
                                <span>{announcement.fullDetails.category}</span>
                              </div>
                              <div className="detail-row">
                                <strong>📊 Difficulty:</strong>
                                <span>{announcement.fullDetails.difficulty}</span>
                              </div>
                              <div className="detail-row">
                                <strong>⏱️ Estimated Time:</strong>
                                <span>{announcement.fullDetails.estimatedTime}</span>
                              </div>
                              <div className="detail-section">
                                <strong>📚 Available Resources:</strong>
                                <ul className="resources-list">
                                  {announcement.fullDetails.resources.map((resource, idx) => (
                                    <li key={idx}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="detail-row">
                                <strong>👥 Added by:</strong>
                                <span>{announcement.fullDetails.addedBy}</span>
                              </div>
                              <div className="detail-note">
                                <strong>Info:</strong> {announcement.fullDetails.additionalInfo}
                              </div>
                            </div>
                          )}
                          
                          {announcement.type === 'event' && (
                            <div className="details-content">
                              <div className="detail-row">
                                <strong>🎤 Speaker:</strong>
                                <span>{announcement.fullDetails.speaker}</span>
                              </div>
                              <div className="detail-row">
                                <strong>🏢 Company:</strong>
                                <span>{announcement.fullDetails.company}</span>
                              </div>
                              <div className="detail-row">
                                <strong>📅 Date:</strong>
                                <span>{announcement.fullDetails.date}</span>
                              </div>
                              <div className="detail-row">
                                <strong>⏰ Time:</strong>
                                <span>{announcement.fullDetails.time}</span>
                              </div>
                              <div className="detail-row">
                                <strong>📍 Venue:</strong>
                                <span>{announcement.fullDetails.venue}</span>
                              </div>
                              <div className="detail-section">
                                <strong>📋 Topics Covered:</strong>
                                <ul className="resources-list">
                                  {announcement.fullDetails.topics.map((topic, idx) => (
                                    <li key={idx}>{topic}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="detail-row">
                                <strong>📝 Registration:</strong>
                                <span>{announcement.fullDetails.registration}</span>
                              </div>
                              <div className="detail-row">
                                <strong>🎁 Benefits:</strong>
                                <span>{announcement.fullDetails.benefits}</span>
                              </div>
                              <div className="detail-note">
                                <strong>About Speaker:</strong> {announcement.fullDetails.speakerBio}
                              </div>
                              <div className="detail-note">
                                {announcement.fullDetails.additionalInfo}
                              </div>
                            </div>
                          )}
                          
                          <div className="details-footer">
                            <span className="click-hint">Click again to close</span>
                          </div>
                        </div>
                      )}
                      
                      {expandedAnnouncement !== announcement.id && (
                        <div className="announcement-click-hint">
                          <span>Click to view more details →</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modern-section-card">
                <div className="section-header-with-action">
                  <h2 className="modern-section-heading">Upcoming Events</h2>
                  <button className="see-all-link">Calendar</button>
                </div>
                <div className="events-list">
                  <div className="event-item">
                    <div className="event-date">
                      <span className="date-day">15</span>
                      <span className="date-month">Dec</span>
                    </div>
                    <div className="event-content">
                      <h4>Mid-term Exam</h4>
                      <p>CS301 - Data Structures</p>
                      <span className="event-time">9:00 AM - 11:00 AM</span>
                    </div>
                  </div>
                  <div className="event-item">
                    <div className="event-date">
                      <span className="date-day">17</span>
                      <span className="date-month">Dec</span>
                    </div>
                    <div className="event-content">
                      <h4>Assignment Due</h4>
                      <p>CS201 - Programming Fundamentals</p>
                      <span className="event-time">11:59 PM</span>
                    </div>
                  </div>
                  <div className="event-item">
                    <div className="event-date">
                      <span className="date-day">18</span>
                      <span className="date-month">Dec</span>
                    </div>
                    <div className="event-content">
                      <h4>Guest Lecture</h4>
                      <p>AI in Modern Industry</p>
                      <span className="event-time">2:00 PM - 4:00 PM</span>
                    </div>
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
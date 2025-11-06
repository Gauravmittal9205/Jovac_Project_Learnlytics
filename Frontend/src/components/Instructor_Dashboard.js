import React, { useState, useRef, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
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
function InstructorDashboard(){
  const session = readSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [tas, setTas] = useState([]);
  const [courseView, setCourseView] = useState(null); // 'view' | 'manage' | 'gradebook' | 'announcements'

  // Instructor-specific mock data (separate from student data)
  const instructorData = {
    summary: { totalStudents: 24, activeCourses: 3, avgEngagementPct: 87, atRiskCount: 2 },
    courses: [
      { id: 'CS101', code: 'CS-101', section: 'A', term: 'Fall 2025', title: 'Intro to CS', enrolled: 12, limit: 30, avgScore: 81, risk: 'Low', lastActivity: '2d ago', schedule: 'Mon/Wed 10:00-11:30', officeHours: 'Thu 2-4 PM', syllabusUrl: '#' },
      { id: 'DS201', code: 'DS-201', section: 'B', term: 'Fall 2025', title: 'Data Structures', enrolled: 8, limit: 25, avgScore: 76, risk: 'Medium', lastActivity: '5h ago', schedule: 'Tue/Thu 11:00-12:30', officeHours: 'Fri 1-3 PM', syllabusUrl: '#' },
      { id: 'AL301', code: 'AL-301', section: 'C', term: 'Fall 2025', title: 'Algorithms', enrolled: 4, limit: 20, avgScore: 69, risk: 'High', lastActivity: '1h ago', schedule: 'Mon 3-5 PM', officeHours: 'Wed 11-12', syllabusUrl: '#' },
      { id: 'ML401', code: 'ML-401', section: 'D', term: 'Fall 2025', title: 'Machine Learning', enrolled: 22, limit: 35, avgScore: 88, risk: 'Low', lastActivity: '3d ago', schedule: 'Fri 9-11 AM', officeHours: 'Tue 4-5 PM', syllabusUrl: '#' }
    ],
    students: [
      { id: 'S001', name: 'Aarav Singh', course: 'CS101', engagementPct: 92 },
      { id: 'S002', name: 'Isha Patel', course: 'DS201', engagementPct: 85 },
      { id: 'S003', name: 'Ravi Kumar', course: 'AL301', engagementPct: 63 }
    ],
    analytics: {
      weeklyEngagement: [72, 75, 78, 80, 82, 86, 87],
      riskBreakdown: [
        { label: 'Low', value: 18 },
        { label: 'Medium', value: 4 },
        { label: 'High', value: 2 }
      ]
    },
    resources: [
      { type: 'rubric', name: 'Assignment Rubric Template', link: '#' },
      { type: 'policy', name: 'Late Submission Policy', link: '#' },
      { type: 'guide', name: 'Engagement Best Practices', link: '#' }
    ]
  };

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const resourceCatalog = {
    'res-guides': {
      links: [
        { label: 'Engagement Best Practices (PDF)', href: '#' },
        { label: 'Assessment Design Guide (PDF)', href: '#' },
        { label: 'Accessibility Checklist (DOCX)', href: '#' },
        { label: 'Effective Feedback Techniques (PDF)', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      images: [
        'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=60'
      ]
    },
    'res-templates': {
      links: [
        { label: 'Course Syllabus Template (Google Doc)', href: '#' },
        { label: 'Project Rubric (XLSX)', href: '#' },
        { label: 'Weekly Plan Template (DOCX)', href: '#' },
        { label: 'Announcement Templates (DOCX)', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      images: [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=60'
      ]
    },
    'res-policies': {
      links: [
        { label: 'Late Submission Policy (DOCX)', href: '#' },
        { label: 'Academic Integrity Statement (PDF)', href: '#' },
        { label: 'Grading Policy (PDF)', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
      images: [
        'https://images.unsplash.com/photo-1555375771-14b2a63968a2?auto=format&fit=crop&w=800&q=60'
      ]
    },
    'res-tools': {
      links: [
        { label: 'Plagiarism Checker', href: '#' },
        { label: 'LMS Sync Guide', href: '#' },
        { label: 'Quiz Randomizer Tool', href: '#' },
        { label: 'Video Captioning Helper', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
      images: [
        'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60'
      ]
    },
  };

  const openManage = (course) => {
    setSelectedCourse(course);
    // Mock roster/TAs per course for now
    setRoster([
      { id: 'S001', name: 'Aarav Singh', email: 'aarav@example.com' },
      { id: 'S002', name: 'Isha Patel', email: 'isha@example.com' }
    ]);
    setTas([{ id: 'T001', name: 'TA Neha', email: 'neha@example.com' }]);
    setManageOpen(true);
    setCourseView('manage');
  };

  const exportRosterCsv = () => {
    const header = 'id,name,email';
    const rows = roster.map(r => `${r.id},${r.name},${r.email}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedCourse?.id || 'course'}-roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importRosterCsv = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const dataLines = lines.slice(1); // drop header
      const parsed = dataLines.map((l, idx) => {
        const [id, name, email] = l.split(',');
        return { id: id || `S${100+idx}`, name: name || '', email: email || '' };
      });
      setRoster(parsed);
    };
    reader.readAsText(file);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar (profile card only) */}
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
          <div className="instructor-profile-card">
            <div className="profile-top">
              {session?.photoUrl ? (
                <img className="profile-photo-img" src={session.photoUrl} alt="Instructor" />
              ) : (
                <div className="profile-avatar">
                  {(session?.name || 'Instructor').split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <div className="profile-info">
                <h4>{session?.name || 'Instructor'}</h4>
                <p>Instructor</p>
              </div>
            </div>
            <p className="profile-bio">Empowering learners with engaging coursework and data-driven guidance.</p>
            <div className="profile-meta">
              <div>Department: Computer Science</div>
              <div>Email: instructor@example.com</div>
            </div>
            <div className="profile-tags">
              <span className="tag">Teaching</span>
              <span className="tag">Analytics</span>
              <span className="tag">Mentorship</span>
            </div>
            <div className="profile-stats">
              <div className="stat-chip">24 Students</div>
              <div className="stat-chip">3 Courses</div>
            </div>
            <div className="profile-actions">
              <button className="btn small" onClick={() => navigate('/profile')}>View Profile</button>
              <button className="btn small ghost" onClick={() => navigate('/resources')}>Resources</button>
            </div>
          </div>
        </div>

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
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'courses' ? 'My Courses' : activeTab === 'students' ? 'Students' : activeTab === 'analytics' ? 'Analytics' : 'Resources'}</h1>
          </div>
          <div className="header-right">
            <button className="btn ghost" onClick={() => navigate('/')}>Back</button>
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{instructorData.summary.totalStudents}</span>
                <span className="stat-label">Students</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{instructorData.summary.activeCourses}</span>
                <span className="stat-label">Courses</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              {/* Welcome Header with Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                color: 'white',
                boxShadow: '0 4px 20px rgba(26, 123, 217, 0.3)'
              }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  Welcome back, {session?.name || 'Instructor'}! 👋
                </h2>
                <p style={{ fontSize: '1rem', opacity: '0.95', margin: 0 }}>
                  Here's what's happening with your courses today
                </p>
              </div>

              {/* Quick Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(26, 123, 217, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Total Students</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.totalStudents}</div>
                    <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Across all courses</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    top: '-30px',
                    right: '-30px'
                  }}></div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #2f8de4 0%, #1a7bd9 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(47, 141, 228, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Active Courses</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.activeCourses}</div>
                    <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Currently teaching</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    top: '-30px',
                    right: '-30px'
                  }}></div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #16b0a9 0%, #0ea89e 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(22, 176, 169, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Avg Engagement</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.avgEngagementPct}%</div>
                    <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Overall performance</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    top: '-30px',
                    right: '-30px'
                  }}></div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>At Risk Students</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.atRiskCount}</div>
                    <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Need attention</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    top: '-30px',
                    right: '-30px'
                  }}></div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Quick Actions Card */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    Quick Actions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button style={{
                      padding: '0.875rem 1.25rem',
                      background: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(26, 123, 217, 0.3)',
                      transition: 'transform 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                      <span style={{ fontSize: '1.25rem' }}>📝</span>
                      Create Assignment
                    </button>
                    <button style={{
                      padding: '0.875rem 1.25rem',
                      background: 'linear-gradient(135deg, #2f8de4 0%, #1a7bd9 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(47, 141, 228, 0.3)',
                      transition: 'transform 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                      <span style={{ fontSize: '1.25rem' }}>📢</span>
                      Post Announcement
                    </button>
                    <button style={{
                      padding: '0.875rem 1.25rem',
                      background: 'linear-gradient(135deg, #16b0a9 0%, #0ea89e 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(22, 176, 169, 0.3)',
                      transition: 'transform 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                      <span style={{ fontSize: '1.25rem' }}>📅</span>
                      Schedule Session
                    </button>
                  </div>
                </div>

                {/* Upcoming Items Card */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📋</span>
                    Upcoming Items
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        Assignment 2 due Friday
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>CS101</div>
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      borderLeft: '4px solid #f093fb'
                    }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        Quiz: Trees & Graphs next Tuesday
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>DS201</div>
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      borderLeft: '4px solid #4facfe'
                    }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        Office Hours: Thursday 3PM
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>All Courses</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🔔</span>
                  Recent Activity
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { icon: '👤', text: 'Aarav Singh submitted Assignment 1', time: '2 hours ago', color: '#1a7bd9' },
                    { icon: '📊', text: 'New analytics report available for CS101', time: '5 hours ago', color: '#16b0a9' },
                    { icon: '💬', text: 'Isha Patel posted a question in DS201', time: '1 day ago', color: '#2f8de4' }
                  ].map((activity, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: activity.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {activity.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                          {activity.text}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'courses' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '700' }}>My Courses</h2>
              
              {/* Courses Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {instructorData.courses.map((course, index) => {
                  // Course gradient colors
                  const courseGradients = [
                    { bg: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)', light: '#e0f2fe' },
                    { bg: 'linear-gradient(135deg, #2f8de4 0%, #1a7bd9 100%)', light: '#ecfeff' },
                    { bg: 'linear-gradient(135deg, #16b0a9 0%, #0ea89e 100%)', light: '#cffafe' },
                    { bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', light: '#d1fae5' }
                  ];
                  
                  const gradient = courseGradients[index % courseGradients.length];
                  
                  return (
                    <div 
                      key={course.id}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                      }}
                    >
                      {/* Course Header with Gradient */}
                      <div style={{
                        background: gradient.bg,
                        padding: '1.5rem',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Decorative Circle */}
                        <div style={{
                          position: 'absolute',
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          top: '-50px',
                          right: '-50px'
                        }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 2 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                              {course.title}
                            </h4>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              background: course.risk === 'Low' ? 'rgba(74, 222, 128, 0.3)' 
                                : course.risk === 'Medium' ? 'rgba(251, 191, 36, 0.3)' 
                                : 'rgba(248, 113, 113, 0.3)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              border: `1px solid ${course.risk === 'Low' ? '#4ade80' 
                                : course.risk === 'Medium' ? '#fbbf24' 
                                : '#f87171'}`
                            }}>
                              {course.risk} Risk
                            </span>
                          </div>
                          <div style={{ fontSize: '0.875rem', opacity: '0.9' }}>
                            {course.code} • Sec {course.section} • {course.term}
                          </div>
                        </div>
                      </div>

                      {/* Course Metrics */}
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: gradient.light,
                            borderRadius: '12px'
                          }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                              {course.enrolled}/{course.limit}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                              Enrolled
                            </div>
                          </div>
                          
                          <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: gradient.light,
                            borderRadius: '12px'
                          }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                              {course.avgScore}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                              Avg Score
                            </div>
                          </div>
                          
                          <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: gradient.light,
                            borderRadius: '12px'
                          }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                              {course.lastActivity}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                              Activity
                            </div>
                          </div>
                        </div>

                        {/* Course Details */}
                        <div style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          borderRadius: '12px',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1rem' }}>📅</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Schedule</div>
                              <div style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '600' }}>{course.schedule}</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1rem' }}>🕐</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Office Hours</div>
                              <div style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '600' }}>{course.officeHours}</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1rem' }}>📄</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Syllabus</div>
                              <a 
                                href={course.syllabusUrl} 
                                style={{ 
                                  fontSize: '0.875rem', 
                                  color: '#1a7bd9', 
                                  fontWeight: '600',
                                  textDecoration: 'none'
                                }}
                              >
                                View Document →
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.75rem'
                        }}>
                          <button 
                            onClick={() => { setSelectedCourse(course); setCourseView('view'); }}
                            style={{
                              padding: '0.75rem',
                              background: gradient.bg,
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            📖 View
                          </button>
                          
                          <button 
                            onClick={() => openManage(course)}
                            style={{
                              padding: '0.75rem',
                              background: '#1f2937',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#1f2937'}
                          >
                            ⚙️ Manage
                          </button>
                          
                          <button 
                            onClick={() => { setSelectedCourse(course); setCourseView('gradebook'); }}
                            style={{
                              padding: '0.75rem',
                              background: 'white',
                              color: '#1f2937',
                              border: '2px solid #e5e7eb',
                              borderRadius: '10px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'border-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                          >
                            📊 Gradebook
                          </button>
                          
                          <button 
                            onClick={() => { setSelectedCourse(course); setCourseView('announcements'); }}
                            style={{
                              padding: '0.75rem',
                              background: 'white',
                              color: '#1f2937',
                              border: '2px solid #e5e7eb',
                              borderRadius: '10px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'border-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                          >
                            📢 Announcements
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Course Button */}
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 123, 217, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 123, 217, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 123, 217, 0.3)';
                }}
                >
                  ➕ Add New Course
                </button>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'students' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '700' }}>My Students</h2>
              
              {/* Students Grid with Avatar Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '2rem',
                padding: '1rem'
              }}>
                {instructorData.students.map((student, index) => {
                  // Avatar colors - vibrant gradients
                  const avatarColors = [
                    'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                    'linear-gradient(135deg, #2f8de4 0%, #1a7bd9 100%)',
                    'linear-gradient(135deg, #16b0a9 0%, #0ea89e 100%)',
                    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                  ];
                  
                  return (
                    <div 
                      key={student.id}
                      onClick={() => navigate('/student-dashboard')}
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      }}
                    >
                      {/* Avatar Circle */}
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: avatarColors[index % avatarColors.length],
                        margin: '0 auto 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Avatar Initial */}
                        <span style={{ zIndex: 2 }}>
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                        
                        {/* Decorative Circle */}
                        <div style={{
                          position: 'absolute',
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          top: '-20px',
                          right: '-20px'
                        }}></div>
                      </div>
                      
                      {/* Student Name */}
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                        transition: 'color 0.3s ease'
                      }}>
                        {student.name}
                      </h3>
                      
                      {/* Course Badge */}
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        marginBottom: '0.75rem'
                      }}>
                        {student.course}
                      </div>
                      
                      {/* Engagement Bar */}
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                            Engagement
                          </span>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '700',
                            color: student.engagementPct >= 80 ? '#10b981' : student.engagementPct >= 60 ? '#f59e0b' : '#ef4444'
                          }}>
                            {student.engagementPct}%
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${student.engagementPct}%`,
                            height: '100%',
                            background: student.engagementPct >= 80 
                              ? 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)'
                              : student.engagementPct >= 60 
                              ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)'
                              : 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Add More Students Button */}
              <div style={{ 
                marginTop: '2rem', 
                textAlign: 'center' 
              }}>
                <button style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 123, 217, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 123, 217, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 123, 217, 0.3)';
                }}
                >
                  + Add New Student
                </button>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'analytics' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '700' }}>Analytics & Performance</h2>
              
              {/* Summary Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a7bd9 0%, #16b0a9 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(26, 123, 217, 0.4)'
                }}>
                  <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Total Students</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.totalStudents}</div>
                  <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Across all courses</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #2f8de4 0%, #1a7bd9 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(47, 141, 228, 0.4)'
                }}>
                  <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Active Courses</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.activeCourses}</div>
                  <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Currently teaching</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #16b0a9 0%, #0ea89e 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(22, 176, 169, 0.4)'
                }}>
                  <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Avg Engagement</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.avgEngagementPct}%</div>
                  <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Overall performance</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                }}>
                  <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>At Risk Students</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{instructorData.summary.atRiskCount}</div>
                  <div style={{ fontSize: '0.75rem', opacity: '0.8', marginTop: '0.5rem' }}>Needs attention</div>
                </div>
              </div>

              {/* Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Weekly Engagement Chart */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                    Weekly Engagement Trend
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={instructorData.analytics.weeklyEngagement.map((value, index) => ({
                      week: `Week ${index + 1}`,
                      engagement: value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        dot={{ fill: '#667eea', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Risk Breakdown Chart - 3D Style */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                    Risk Breakdown
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={instructorData.analytics.riskBreakdown}
                        cx="50%"
                        cy="45%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, label }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 30;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text 
                              x={x} 
                              y={y} 
                              fill="#1f2937" 
                              textAnchor={x > cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              style={{ fontSize: '0.875rem', fontWeight: '600' }}
                            >
                              {`${label}: ${value}`}
                            </text>
                          );
                        }}
                      >
                        {instructorData.analytics.riskBreakdown.map((entry, index) => {
                          const colors = [
                            { main: '#4ade80', shadow: '#22c55e' },
                            { main: '#fbbf24', shadow: '#f59e0b' },
                            { main: '#f87171', shadow: '#ef4444' }
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length].main}
                              stroke={colors[index % colors.length].shadow}
                              strokeWidth={3}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        boxShadow: '0 2px 4px rgba(74, 222, 128, 0.3)'
                      }}></div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Low: 18</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)'
                      }}></div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Medium: 4</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                        boxShadow: '0 2px 4px rgba(248, 113, 113, 0.3)'
                      }}></div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>High: 2</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Course Performance Bar Chart */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                marginBottom: '2rem'
              }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                  Course Performance Overview
                </h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={instructorData.courses.map(course => ({
                    name: course.code,
                    avgScore: course.avgScore,
                    enrolled: course.enrolled
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#667eea" name="Average Score" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="enrolled" fill="#4facfe" name="Enrolled Students" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Student Engagement Area Chart */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                  Student Engagement Distribution
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={instructorData.students.map(student => ({
                    name: student.name.split(' ')[0],
                    engagement: student.engagementPct
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#f093fb" 
                      fill="url(#colorEngagement)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'resources' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2>Resources</h2>
              <div className="resource-tiles">
                {[
                  { key: 'guides', title: 'Guides', color: '#fbbf24', desc: 'Best practices and how-tos', icon: '📘', count: 8, highlights: ['Engagement tips', 'Assessment design'] },
                  { key: 'templates', title: 'Templates', color: '#f87171', desc: 'Rubrics, syllabi, checklists', icon: '🧩', count: 12, highlights: ['Project rubric', 'Syllabus v2.1'] },
                  { key: 'policies', title: 'Policies', color: '#8b5cf6', desc: 'Classroom and grading policies', icon: '⚖️', count: 5, highlights: ['Late work policy', 'Academic integrity'] },
                  { key: 'tools', title: 'Tools', color: '#f97316', desc: 'Integrations and utilities', icon: '🛠️', count: 6, highlights: ['Plagiarism checker', 'LMS sync'] }
                ].map((tile, idx) => (
                  <button key={tile.key} className="resource-tile" style={{ ['--tile-color']: tile.color }} onClick={() => setCourseView(`res-${tile.key}`)}>
                    <div className="tile-icon" aria-hidden="true">{tile.icon}</div>
                    <div className="tile-body">
                      <div className="tile-title">{tile.title}</div>
                      <div className="tile-desc">{tile.desc}</div>
                      <ul className="tile-highlights">
                        {tile.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                      <div>
                        <button type="button" className="btn small light" onClick={(e) => { e.stopPropagation(); setCourseView(`res-${tile.key}`); }}>Open</button>
                    </div>
                    </div>
                    <div className="tile-aside">
                      <span className="tile-count">{tile.count}</span>
                      <div className="tile-num" aria-hidden="true">{idx+1}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Bottom expanded navbar */}
        <div className="bottom-nav">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses</button>
          <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Resources</button>
          <NavLink to="/my-students" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>My Students</NavLink>
        </div>
        {/* On-screen detail panel (View/Manage/Gradebook/Announcements) */}
        {(courseView && (selectedCourse || String(courseView).startsWith('res-'))) && (
          <div className="course-detail-panel">
            <div className="panel-header">
              {String(courseView).startsWith('res-') ? (
                <>
                  <div>
                    <h3 className="panel-title">Resources</h3>
                    <div className="panel-sub">{courseView==='res-guides' ? 'Guides' : courseView==='res-templates' ? 'Templates' : courseView==='res-policies' ? 'Policies' : 'Tools'}</div>
                  </div>
                  <div className="panel-tabs">
                    <button className="btn ghost" onClick={()=>{ setCourseView(null); setManageOpen(false); }}>Close</button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="panel-title">{selectedCourse.title}</h3>
                    <div className="panel-sub">{selectedCourse.code} • Sec {selectedCourse.section} • {selectedCourse.term}</div>
                  </div>
                  <div className="panel-tabs">
                    <button className={`tab-btn ${courseView==='view'?'active':''}`} onClick={()=>setCourseView('view')}>View</button>
                    <button className={`tab-btn ${courseView==='manage'?'active':''}`} onClick={()=>{ if(!manageOpen) openManage(selectedCourse); else setCourseView('manage'); }}>Manage</button>
                    <button className={`tab-btn ${courseView==='gradebook'?'active':''}`} onClick={()=>setCourseView('gradebook')}>Gradebook</button>
                    <button className={`tab-btn ${courseView==='announcements'?'active':''}`} onClick={()=>setCourseView('announcements')}>Announcements</button>
                    <button className="btn ghost" onClick={()=>{ setCourseView(null); setManageOpen(false); }}>Close</button>
                  </div>
                </>
              )}
            </div>
            <div className="panel-body">
              {courseView==='view' && (
                <div className="panel-grid">
                  <div className="panel-card">
                    <h4>Overview</h4>
                    <p>Enrolled: {selectedCourse.enrolled}/{selectedCourse.limit}</p>
                    <p>Average Score: {selectedCourse.avgScore}%</p>
                    <p>Last Activity: {selectedCourse.lastActivity}</p>
                  </div>
                  <div className="panel-card">
                    <h4>Upcoming</h4>
                    <ul className="list plain">
                      <li>Assignment 2 due Friday</li>
                      <li>Quiz next Tuesday</li>
                    </ul>
                  </div>
                </div>
              )}
              {courseView==='manage' && (
                <div className="manage-grid">
                  <div className="manage-section">
                    <h4>Roster</h4>
                    <div className="roster-list">
                      {roster.map(s => (
                        <div key={s.id} className="roster-row">
                          <div>
                            <strong>{s.name}</strong>
                            <div className="muted">{s.email}</div>
                          </div>
                          <button className="btn small ghost" onClick={() => setRoster(prev => prev.filter(r => r.id !== s.id))}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="roster-actions">
                      <button className="btn small" onClick={exportRosterCsv}>Export CSV</button>
                      <label className="btn small ghost">
                        Import CSV
                        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => e.target.files && e.target.files[0] && importRosterCsv(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                  <div className="manage-section">
                    <h4>Invite</h4>
                    <div className="invite-box">
                      <div>Join Code: <strong>{selectedCourse.id}-JOIN</strong></div>
                      <div>Invite Link:</div>
                      <div className="invite-link">https://app.learnlytics.example/join/{selectedCourse.id}</div>
                      <div className="invite-actions">
                        <button className="btn small" onClick={() => navigator.clipboard.writeText(`${selectedCourse.id}-JOIN`)}>Copy Code</button>
                        <button className="btn small ghost" onClick={() => navigator.clipboard.writeText(`https://app.learnlytics.example/join/${selectedCourse.id}`)}>Copy Link</button>
                      </div>
                    </div>
                    <h4>Teaching Assistants</h4>
                    <div className="roster-list">
                      {tas.map(t => (
                        <div key={t.id} className="roster-row">
                          <div>
                            <strong>{t.name}</strong>
                            <div className="muted">{t.email}</div>
                          </div>
                          <button className="btn small ghost" onClick={() => setTas(prev => prev.filter(x => x.id !== t.id))}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="roster-actions">
                      <button className="btn small" onClick={() => setTas(prev => [...prev, { id: `T${100+prev.length}`, name: 'New TA', email: 'ta@example.com' }])}>Add TA</button>
                    </div>
                  </div>
                </div>
              )}
              {courseView==='gradebook' && (
                <div className="panel-card">
                  <h4>Gradebook (placeholder)</h4>
                  <p>Display grade distribution and per-student grades here.</p>
                </div>
              )}
              {courseView==='announcements' && (
                <div className="panel-card">
                  <h4>Announcements (placeholder)</h4>
                  <p>Create and manage course announcements.</p>
                </div>
              )}
              {String(courseView).startsWith('res-') && (
                <div className="panel-grid">
                  <div className="panel-card">
                    <h4>{courseView==='res-guides' ? 'Guides' : courseView==='res-templates' ? 'Templates' : courseView==='res-policies' ? 'Policies' : 'Tools'} — Featured Video</h4>
                    <div className="video-wrapper">
                      <iframe
                        src={(resourceCatalog[courseView]?.videoUrl) || ''}
                        title="Resource Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <div className="panel-card">
                    <h4>Resources</h4>
                    <ul className="resource-links">
                      {(resourceCatalog[courseView]?.links || []).map((item, i) => (
                        <li key={i}><a className="resource-link" href={item.href} target="_blank" rel="noreferrer">{item.label}</a></li>
                      ))}
                    </ul>
                    <div className="gallery">
                      {(resourceCatalog[courseView]?.images || []).map((src, i) => (
                        <img key={i} className="gallery-img" src={src} alt="Resource visual" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default InstructorDashboard;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FiChevronDown, FiChevronUp, FiDownload, FiPrinter, FiFilter, FiSearch } from 'react-icons/fi';
import '../styles/CourseAnalysisPage.css';

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

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
const COLORS = {
  Excellent: '#10B981',
  Good: '#3B82F6',
  Average: '#F59E0B',
  NeedsImprovement: '#EF4444'
};

const mockCourseData = [
  {
    id: 1,
    subject: 'Mathematics',
    score: 92,
    status: 'Excellent',
    averageScore: 85,
    classRank: 'Top 5%',
    progress: 75,
    completedTopics: 12,
    totalTopics: 15,
    instructorNotes: "Gaurav, your performance in Mathematics is outstanding. Keep up the excellent work, and consider exploring more advanced topics in Number Theory to challenge yourself.",
    topics: [
      { name: 'Algebra', score: 95, status: 'Excellent', completed: true },
      { name: 'Calculus', score: 90, status: 'Excellent', completed: true },
      { name: 'Geometry', score: 89, status: 'Good', completed: true },
      { name: 'Trigonometry', score: 82, status: 'Good', completed: true },
      { name: 'Number Theory', score: 0, status: 'Not Started', completed: false },
    ],
    performanceData: [
      { name: 'Week 1', score: 85, average: 78 },
      { name: 'Week 2', score: 88, average: 82 },
      { name: 'Week 3', score: 92, average: 85 },
      { name: 'Week 4', score: 90, average: 83 },
      { name: 'Week 5', score: 94, average: 87 },
    ]
  },
  // ... other courses with similar structure
];

const PerformanceGauge = ({ value, label }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = COLORS.Excellent;
  if (percentage < 70) color = COLORS.NeedsImprovement;
  else if (percentage < 85) color = COLORS.Good;
  else if (percentage < 95) color = COLORS.Excellent;
  
  return (
    <div className="gauge-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold">
          {percentage}%
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
};

const TopicProgressBar = ({ name, score, status, completed }) => {
  const color = COLORS[status] || '#9CA3AF';
  
  return (
    <div className="topic-progress">
      <div className="topic-info">
        <span className="topic-name">{name}</span>
        <span className="topic-score">{score}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{
            width: `${score}%`,
            backgroundColor: color,
            opacity: completed ? 1 : 0.5
          }}
        />
      </div>
      <span className={`status-tag`} style={{ backgroundColor: color }}>
        {status}
      </span>
    </div>
  );
};

function CourseAnalysisPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [expandedSubject, setExpandedSubject] = useState('Mathematics');
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const handleExpand = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  const currentCourse = mockCourseData[0]; // For demo, using first course
  
  const renderPerformanceChart = () => (
    <div className="chart-container">
      <h4>Performance Trend</h4>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentCourse.performanceData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Your Score']}
              labelFormatter={(label) => `Week: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={COLORS.Excellent} 
              strokeWidth={2} 
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="logo-shield">L</div>
              <span className="brand-text">Learnlytics</span>
            </div>
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(false)}
            >
              ←
            </button>
          </div>
          
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {(session?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h4>{session?.name || 'User'}</h4>
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
                navigate('/login');
              }}
            >
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      )}
      
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
            <h1>Course Performance Analytics</h1>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="time-filter">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <button className="btn btn-icon">
              <FiFilter />
              <span>Filter</span>
            </button>
            <button className="btn btn-primary">
              <FiDownload />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Course Overview Section */}
          <div className="overview-section">
            <div className="course-header">
              <h2>{currentCourse.subject} Analysis</h2>
              <div className="course-actions">
                <button className="btn btn-outline">
                  <FiPrinter />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Your Score</h4>
                <div className="stat-value">{currentCourse.score}%</div>
                <div className="stat-change positive">+5% from last month</div>
              </div>
              
              <div className="stat-card">
                <h4>Class Average</h4>
                <div className="stat-value">{currentCourse.averageScore}%</div>
                <div className="stat-change">+2% from last month</div>
              </div>
              
              <div className="stat-card">
                <h4>Class Rank</h4>
                <div className="stat-value">{currentCourse.classRank}</div>
                <div className="stat-change positive">↑ 3 positions</div>
              </div>
              
              <div className="stat-card progress-card">
                <div className="progress-card-header">
                  <h4>Course Progress</h4>
                  <span className="progress-percentage">{currentCourse.progress}%</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${currentCourse.progress}%`,
                        background: `linear-gradient(90deg, ${COLORS.Excellent}, ${COLORS.Good})`,
                        boxShadow: `0 2px 4px ${COLORS.Excellent}40`
                      }}
                    />
                  </div>
                  <div className="progress-labels">
                    <span className="progress-text">
                      {currentCourse.completedTopics} of {currentCourse.totalTopics} topics
                    </span>
                    <span className="progress-remaining">
                      {currentCourse.totalTopics - currentCourse.completedTopics} remaining
                    </span>
                  </div>
                </div>
                <div className="progress-actions">
                  <button className="btn-progress">
                    <span>Continue Learning</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Left Column */}
            <div className="content-col">
              {/* Performance Gauge */}
              <div className="card">
                <div className="card-header">
                  <h3>Overall Performance</h3>
                </div>
                <div className="card-body">
                  <div className="gauge-wrapper">
                    <PerformanceGauge 
                      value={currentCourse.score} 
                      label="Your Score" 
                    />
                    <PerformanceGauge 
                      value={currentCourse.averageScore} 
                      label="Class Average" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Topic Breakdown */}
              <div className="card">
                <div className="card-header">
                  <h3>Topic Performance</h3>
                  <div className="card-actions">
                    <button className="btn-text">View All</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="topics-list">
                    {currentCourse.topics.map((topic, index) => (
                      <TopicProgressBar 
                        key={index}
                        name={topic.name}
                        score={topic.score}
                        status={topic.status}
                        completed={topic.completed}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="content-col">
              {/* Performance Trend */}
              <div className="card">
                <div className="card-header">
                  <h3>Performance Trend</h3>
                  <div className="card-actions">
                    <select 
                      value={timeRange} 
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="select-small"
                    >
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                      <option value="semester">Semester</option>
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={currentCourse.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fill: '#6B7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Your Score']}
                          labelFormatter={(label) => `Week: ${label}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke={COLORS.Excellent} 
                          strokeWidth={2} 
                          dot={{ r: 4, fill: COLORS.Excellent, strokeWidth: 2, stroke: 'white' }}
                          activeDot={{ r: 6, stroke: COLORS.Excellent, strokeWidth: 2, fill: 'white' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke="#9CA3AF" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                        <Legend 
                          verticalAlign="top"
                          height={36}
                          formatter={(value) => {
                            if (value === 'score') return 'Your Score';
                            if (value === 'average') return 'Class Average';
                            return value;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructor Notes */}
          <div className="card">
            <div className="card-header">
              <h3>Instructor Feedback</h3>
            </div>
            <div className="card-body">
              <div className="instructor-notes">
                <div className="instructor-avatar">
                  {currentCourse.instructorNotes.split(' ')[0].charAt(0)}
                </div>
                <div className="notes-content">
                  <div className="notes-header">
                    <h4>From: Instructor</h4>
                    <span className="notes-date">Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <p>{currentCourse.instructorNotes}</p>
                  <div className="notes-actions">
                    <button className="btn-text">Reply</button>
                    <button className="btn-text">Request Meeting</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="card recommendations-card">
            <div className="card-header">
              <h3>📋 Recommended Actions</h3>
              <div className="header-decoration" />
            </div>
            <div className="card-body">
              <div className="recommendations-grid">
                <div className="recommendation-item" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderLeft: '4px solid #0ea5e9'
                }}>
                  <div className="recommendation-icon" style={{ backgroundColor: '#bae6fd' }}>📚</div>
                  <div className="recommendation-content">
                    <h4 style={{ color: '#0369a1' }}>Focus on Weak Areas</h4>
                    <p>Spend more time on topics marked as 'Needs Improvement' in your dashboard.</p>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '65%', backgroundColor: '#0ea5e9' }}></div>
                      </div>
                      <span className="progress-text">65% students improved</span>
                    </div>
                  </div>
                </div>
                
                <div className="recommendation-item" style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderLeft: '4px solid #22c55e'
                }}>
                  <div className="recommendation-icon" style={{ backgroundColor: '#bbf7d0' }}>🎯</div>
                  <div className="recommendation-content">
                    <h4 style={{ color: '#15803d' }}>Set Study Goals</h4>
                    <p>Set specific, measurable goals for each study session to track your progress.</p>
                    <div className="action-buttons">
                      <button className="btn-action" style={{ backgroundColor: '#22c55e' }}>Set Goals</button>
                      <button className="btn-action-outline" style={{ borderColor: '#22c55e', color: '#15803d' }}>Learn More</button>
                    </div>
                  </div>
                </div>
                
                <div className="recommendation-item" style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderLeft: '4px solid #ef4444'
                }}>
                  <div className="recommendation-icon" style={{ backgroundColor: '#fecaca' }}>💡</div>
                  <div className="recommendation-content">
                    <h4 style={{ color: '#b91c1c' }}>Join Study Groups</h4>
                    <p>Collaborate with peers to enhance your understanding of complex topics.</p>
                    <div className="tag-container">
                      <span className="tag" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>Active Now: 12 groups</span>
                      <span className="tag" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>New: 3 groups</span>
                    </div>
                  </div>
                </div>
                
                <div className="recommendation-item" style={{
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  borderLeft: '4px solid #8b5cf6'
                }}>
                  <div className="recommendation-icon" style={{ backgroundColor: '#ddd6fe' }}>📊</div>
                  <div className="recommendation-content">
                    <h4 style={{ color: '#6d28d9' }}>Weekly Progress Review</h4>
                    <p>Review your weekly performance and adjust your study plan accordingly.</p>
                    <div className="stats-row">
                      <div className="stat">
                        <span className="stat-value">85%</span>
                        <span className="stat-label">Completion</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">12/15</span>
                        <span className="stat-label">Topics</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">4.8★</span>
                        <span className="stat-label">Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <style jsx>{`
              .recommendations-card {
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
              }
              .card-header {
                position: relative;
                padding: 1.25rem 1.5rem;
                background: #fff;
                border-bottom: 1px solid #e5e7eb;
              }
              .card-header h3 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }
              .header-decoration {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
              }
              .recommendations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.25rem;
                padding: 1.5rem;
              }
              .recommendation-item {
                padding: 1.5rem;
                border-radius: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
                position: relative;
                overflow: hidden;
              }
              .recommendation-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              }
              .recommendation-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              .recommendation-content h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1.1rem;
                font-weight: 600;
              }
              .recommendation-content p {
                margin: 0 0 1rem 0;
                color: #4b5563;
                font-size: 0.95rem;
                line-height: 1.5;
              }
              .progress-container {
                margin-top: 1rem;
              }
              .progress-bar {
                height: 6px;
                background-color: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 0.5rem;
              }
              .progress-fill {
                height: 100%;
                border-radius: 3px;
              }
              .progress-text {
                font-size: 0.8rem;
                color: #6b7280;
                display: block;
              }
              .action-buttons {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
              }
              .btn-action {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                font-size: 0.9rem;
                cursor: pointer;
                transition: opacity 0.2s;
              }
              .btn-action:hover {
                opacity: 0.9;
              }
              .btn-action-outline {
                padding: 0.5rem 1rem;
                background: transparent;
                border: 1px solid;
                border-radius: 6px;
                font-weight: 500;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
              }
              .btn-action-outline:hover {
                background-color: rgba(0, 0, 0, 0.02);
              }
              .tag-container {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-top: 0.75rem;
              }
              .tag {
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.8rem;
                font-weight: 500;
              }
              .stats-row {
                display: flex;
                gap: 1.5rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(0, 0, 0, 0.05);
              }
              .stat {
                text-align: center;
              }
              .stat-value {
                display: block;
                font-weight: 600;
                color: #1f2937;
                font-size: 1.1rem;
              }
              .stat-label {
                font-size: 0.75rem;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              @media (max-width: 768px) {
                .recommendations-grid {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="gamification-section">
        <div className="gamification-header">
          <div className="gamification-title">
            <div className="gamification-icon">🎮</div>
            <span>Gamification Hub</span>
          </div>
        </div>

        {/* Gaming Stats */}
        <div className="gamification-stats">
          <div className="stat-card-gaming">
            <div className="stat-icon-gaming">⭐</div>
            <div className="stat-value-gaming">2,450</div>
            <div className="stat-label-gaming">Total Points</div>
          </div>
          <div className="stat-card-gaming">
            <div className="stat-icon-gaming">🔥</div>
            <div className="stat-value-gaming">15</div>
            <div className="stat-label-gaming">Day Streak</div>
          </div>
          <div className="stat-card-gaming">
            <div className="stat-icon-gaming">🏆</div>
            <div className="stat-value-gaming">Level 8</div>
            <div className="stat-label-gaming">Current Level</div>
          </div>
          <div className="stat-card-gaming">
            <div className="stat-icon-gaming">📈</div>
            <div className="stat-value-gaming">85%</div>
            <div className="stat-label-gaming">Completion Rate</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card">
          <div className="card-header">
            <h3>Achievements</h3>
          </div>
          <div className="card-body">
            <div className="achievements-grid">
              <div className="achievement-card unlocked">
                <div className="achievement-badge">🎯</div>
                <div className="achievement-name">Perfect Score</div>
                <div className="achievement-description">Score 100% in any quiz</div>
              </div>
              <div className="achievement-card unlocked">
                <div className="achievement-badge">📚</div>
                <div className="achievement-name">Bookworm</div>
                <div className="achievement-description">Complete 50 lessons</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-badge">🚀</div>
                <div className="achievement-name">Speed Demon</div>
                <div className="achievement-description">Complete quiz in under 2 minutes</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-badge">💎</div>
                <div className="achievement-name">Gem Collector</div>
                <div className="achievement-description">Earn 1000 points</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-badge">🌟</div>
                <div className="achievement-name">Star Student</div>
                <div className="achievement-description">Top 10 in class</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-badge">🎓</div>
                <div className="achievement-name">Scholar</div>
                <div className="achievement-description">Complete a course</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3 className="leaderboard-title">🏆 Class Leaderboard</h3>
          </div>
          <ul className="leaderboard-list">
            <li className="leaderboard-item">
              <div className="leaderboard-rank rank-1">1</div>
              <div className="leaderboard-user">
                <div className="leaderboard-avatar">AS</div>
                <span className="leaderboard-name">Alex Smith</span>
              </div>
              <span className="leaderboard-score">3,250 pts</span>
            </li>
            <li className="leaderboard-item">
              <div className="leaderboard-rank rank-2">2</div>
              <div className="leaderboard-user">
                <div className="leaderboard-avatar">SJ</div>
                <span className="leaderboard-name">Sarah Johnson</span>
              </div>
              <span className="leaderboard-score">2,980 pts</span>
            </li>
            <li className="leaderboard-item">
              <div className="leaderboard-rank rank-3">3</div>
              <div className="leaderboard-user">
                <div className="leaderboard-avatar">MC</div>
                <span className="leaderboard-name">Mike Chen</span>
              </div>
              <span className="leaderboard-score">2,750 pts</span>
            </li>
            <li className="leaderboard-item">
              <div className="leaderboard-rank rank-default">4</div>
              <div className="leaderboard-user">
                <div className="leaderboard-avatar">You</div>
                <span className="leaderboard-name">You</span>
              </div>
              <span className="leaderboard-score">2,450 pts</span>
            </li>
            <li className="leaderboard-item">
              <div className="leaderboard-rank rank-default">5</div>
              <div className="leaderboard-user">
                <div className="leaderboard-avatar">EW</div>
                <span className="leaderboard-name">Emma Wilson</span>
              </div>
              <span className="leaderboard-score">2,320 pts</span>
            </li>
          </ul>
        </div>

        {/* Weekly Challenges */}
        <div className="weekly-challenges">
          <div className="challenges-header">
            <h3 className="challenges-title">🎯 Weekly Challenges</h3>
          </div>
          <div className="challenges-list">
            <div className="challenge-item">
              <div className="challenge-info">
                <div className="challenge-name">Complete 5 Quizzes</div>
                <div className="challenge-progress">3/5 completed</div>
              </div>
              <div className="challenge-reward">
                <span>🎁</span>
                <span>100 pts</span>
              </div>
            </div>
            <div className="challenge-item">
              <div className="challenge-info">
                <div className="challenge-name">Study Streak</div>
                <div className="challenge-progress">15/7 days</div>
              </div>
              <div className="challenge-reward">
                <span>🔥</span>
                <span>200 pts</span>
              </div>
            </div>
            <div className="challenge-item">
              <div className="challenge-info">
                <div className="challenge-name">Help 3 Friends</div>
                <div className="challenge-progress">1/3 helped</div>
              </div>
              <div className="challenge-reward">
                <span>💝</span>
                <span>150 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CourseAnalysisPage;
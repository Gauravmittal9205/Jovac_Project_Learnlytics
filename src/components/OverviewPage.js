import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Overview.css';

// Bar Chart Component
const BarChart = ({ data, height = 200 }) => {
  // Ensure we have valid data
  if (!data || data.length === 0) return <div>No data available</div>;
  
  // Calculate maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value || 0), 1);
  
  return (
    <div className="bar-chart-container">
      <div className="bar-chart" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          // Calculate bar height as percentage of max value
          const barHeight = ((item.value || 0) / maxValue) * 100;
          
          return (
            <div key={index} className="bar-chart-group">
              <div className="bar-value" style={{ bottom: '100%' }}>
                {item.value}
              </div>
              <div 
                className="bar" 
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: '#f0f0f0',
                  minHeight: '4px',
                  width: '40px',
                  margin: '0 8px',
                  position: 'relative',
                  borderRadius: '0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '5px',
                  boxSizing: 'border-box'
                }}
              >
                <div 
                  className="bar-fill"
                  style={{
                    backgroundColor: '#f0f0f0',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    borderRadius: '0',
                  }}
                />
              </div>
              <div className="bar-label">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend.value > 0 ? 'positive' : 'negative'}`}>
            {trend.icon} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const OverviewPage = ({ session }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { 
    if (!session) navigate('/login'); 
  }, [navigate, session]);

  const reportData = {
    weeklyStats: [
      { label: 'Mon', value: 8 },
      { label: 'Tue', value: 12 },
      { label: 'Wed', value: 10 },
      { label: 'Thu', value: 14 },
      { label: 'Fri', value: 9 },
      { label: 'Sat', value: 6 },
      { label: 'Sun', value: 4 },
    ],
    subjectPerformance: [
      { subject: 'Math', score: 85, target: 80 },
      { subject: 'Science', score: 78, target: 75 },
      { subject: 'History', score: 92, target: 85 },
      { subject: 'English', score: 88, target: 82 },
    ],
    timeSpent: {
      total: 42,
      byActivity: [
        { activity: 'Lectures', hours: 12, color: '#4CAF50' },
        { activity: 'Assignments', hours: 18, color: '#2196F3' },
        { activity: 'Reading', hours: 8, color: '#9C27B0' },
        { activity: 'Practice', hours: 4, color: '#FF9800' },
      ]
    },
    progress: {
      completion: 68,
      lastWeek: 54,
      tasksCompleted: 17,
      totalTasks: 25,
    },
  };

  // Calculate time distribution for the bar chart
  const timeDistributionData = reportData.timeSpent.byActivity.map(item => ({
    label: item.activity,
    value: item.hours,
    color: item.color,
    percentage: Math.round((item.hours / reportData.timeSpent.total) * 100)
  }));

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
            {session?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD'}
          </div>
          <div className="profile-info">
            <h4>{session?.name || 'John Doe'}</h4>
            <p>Computer Science</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item active">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('learnlytics_session');
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
            <h1>Overview</h1>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{reportData.progress.completion}%</span>
                <span className="stat-label">Engagement</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">Low</span>
                <span className="stat-label">Risk Level</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">
          {/* 2x2 Grid Dashboard */}
          <div className="dashboard-grid">
            {/* Weekly Study Hours */}
            <div className="dashboard-card">
              <h2>Weekly Study Hours</h2>
              <BarChart 
                data={reportData.weeklyStats} 
                barColor="#4CAF50"
                height={200}
              />
              <div className="card-footer">
                <span>Total: {reportData.weeklyStats.reduce((sum, day) => sum + day.value, 0)} hours</span>
                <span className="trend positive">↑ 12% from last week</span>
              </div>
            </div>

            {/* Time Distribution */}
            <div className="dashboard-card">
              <h2>Time Spent by Activity</h2>
              <div className="bar-chart-legend">
                {reportData.timeSpent.byActivity.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span 
                      className="legend-color" 
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="legend-label">{item.activity}</span>
                  </div>
                ))}
              </div>
              <BarChart 
                data={timeDistributionData}
                height={180}
              />
              <div className="card-footer">
                <span>Total: {reportData.timeSpent.total} hours</span>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="dashboard-card">
              <h2>Subject Performance</h2>
              <div className="subject-grid">
                {reportData.subjectPerformance.map((subject, index) => (
                  <div key={index} className="subject-item">
                    <div className="subject-name">{subject.subject}</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${subject.score}%`,
                          backgroundColor: subject.score >= subject.target ? '#4CAF50' : '#FF9800'
                        }}
                      ></div>
                    </div>
                    <div className="subject-score">{subject.score}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-card stats-grid">
              <h2>Quick Stats</h2>
              <div className="stats-container">
                <StatCard 
                  title="Course Progress" 
                  value={`${reportData.progress.completion}%`} 
                  icon="📊"
                  color="#4CAF50"
                  trend={{ value: 14, label: 'from last week', icon: '↑' }}
                />
                <StatCard 
                  title="Tasks Completed" 
                  value={`${reportData.progress.tasksCompleted}/${reportData.progress.totalTasks}`} 
                  icon="✅"
                  color="#2196F3"
                />
                <StatCard 
                  title="Study Streak" 
                  value="12 days" 
                  icon="🔥"
                  color="#FF5722"
                />
                <StatCard 
                  title="Avg. Daily Hours" 
                  value="6.0 hrs" 
                  icon="⏱️"
                  color="#9C27B0"
                  trend={{ value: 8, label: 'from last week', icon: '↑' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

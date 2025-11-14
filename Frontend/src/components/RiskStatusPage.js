import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart, 
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
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


// Auth helpers
export const SESSION_KEY = 'learnlytics_session';
export const API_URL = 'http://localhost:5000/api/auth';


export function readSession(){
  try { 
    const raw = localStorage.getItem(SESSION_KEY); 
    return raw ? JSON.parse(raw) : null; 
  } catch { 
    return null; 
  }
}

export function writeSession(session){ 
  localStorage.setItem(SESSION_KEY, JSON.stringify(session)); 
}
export function clearSession(){ 
  localStorage.removeItem(SESSION_KEY); 
}
function RiskStatusPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);
  const RiskAnalysisData = {
    data : [
  { name: 'Week 1', value: 25 },
  { name: 'Week 2', value: 20 },
  { name: 'Week 3', value: 15 },
  { name: 'Week 4', value: 18 },
  { name: 'Week 5', value: 15 },
]
  };
  const historicalData = {
  summary: [
    { title: "Average Risk Level", value: "18%", colorClass: "low-risk" },
    { title: "Highest Risk Period", value: "Week 2 (25%)", colorClass: "high-risk" },
    { title: "Risk Improvement", value: "-10%", colorClass: "positive" },
    { title: "Interventions Used", value: "2", colorClass: "" },
  ],
  timeline: [
    { week: "Week 1", risk: "25% Risk", note: "Initial assessment" },
    { week: "Week 2", risk: "20% Risk", note: "Improved attendance" },
    { week: "Week 3", risk: "15% Risk", note: "Better quiz scores" },
    { week: "Week 4", risk: "18% Risk", note: "Assignment delay" },
    { week: "Week 5", risk: "15% Risk", note: "Current status" },
  ]
};
  const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p className="value">{`Risk: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
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
            <h1>Risk Status</h1>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Risk Overview Section */}
          <div className="dashboard-section">
            <h2>Academic Risk Assessment</h2>
            <div className="risk-overview">
              <div className="risk-summary-card">
                <div className="risk-level-indicator">
                  <div className="risk-gauge">
                    <div className="gauge-circle low-risk">
                      <div className="gauge-center">
                        <div className="risk-score">15%</div>
                      </div>
                    </div>
                  </div>
                  <div className="risk-status">
                    <h3>Low Risk</h3>
                    <p>Your academic performance is on track</p>
                  </div>
                </div>
                <div className="risk-factors">
                  <div className="factor-item positive">
                    <span className="factor-icon">✓</span>
                    <span>High attendance (95%)</span>
                  </div>
                  <div className="factor-item positive">
                    <span className="factor-icon">✓</span>
                    <span>Consistent quiz scores (87%)</span>
                  </div>
                  <div className="factor-item positive">
                    <span className="factor-icon">✓</span>
                    <span>Active participation (92%)</span>
                  </div>
                  <div className="factor-item warning">
                    <span className="factor-icon">⚠</span>
                    <span>Database course needs attention (78%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis Charts */}
          <div className="dashboard-section">
            <h2>Risk Analysis Breakdown</h2>
            <div className="risk-charts-grid">
             <div className="chart-card">
      <h3>Risk Trend Over Time</h3>
      <div className="risk-trend-chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={RiskAnalysisData.data}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
            <YAxis
              domain={[0, 30]} // Adjust domain based on your expected risk percentage range
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              hide // Hide Y-axis for a cleaner look, as values are shown on points
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#5a7dfd"
              strokeWidth={3}
              dot={{ stroke: '#5a7dfd', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, stroke: '#5a7dfd', strokeWidth: 4 }}
              label={({ value, index, x, y }) => (
                <text x={x} y={y - 15} dy={-4} fill="#5a7dfd" textAnchor="middle" className="chart-label-value">
                  {`${value}%`}
                </text>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

              <div className="chart-card">
                <h3>Risk Factors Distribution</h3>
                <div className="risk-factors-chart">
                  <div className="factor-bar">
                    <div className="factor-label">Attendance</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '15%'}}></div>
                    </div>
                    <span className="factor-percentage">15%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Quiz Performance</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '20%'}}></div>
                    </div>
                    <span className="factor-percentage">20%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Assignment Submission</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill medium-risk" style={{width: '35%'}}></div>
                    </div>
                    <span className="factor-percentage">35%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Course Engagement</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '10%'}}></div>
                    </div>
                    <span className="factor-percentage">10%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Study Time</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '20%'}}></div>
                    </div>
                    <span className="factor-percentage">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course-Specific Risk Analysis */}
          <div className="dashboard-section">
            <h2>Course-Specific Risk Analysis</h2>
            <div className="course-risk-grid">
              <div className="course-risk-card excellent">
                <div className="course-header">
                  <h4>Mathematics</h4>
                  <span className="risk-badge low">Low Risk</span>
                </div>
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">92%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">98%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Engagement</span>
                    <span className="metric-value">95%</span>
                  </div>
                </div>
                <div className="risk-insights">
                  <p>Excellent performance across all metrics. No intervention needed.</p>
                </div>
              </div>

              <div className="course-risk-card good">
                <div className="course-header">
                  <h4>Programming</h4>
                  <span className="risk-badge low">Low Risk</span>
                </div>
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">88%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">92%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Engagement</span>
                    <span className="metric-value">89%</span>
                  </div>
                </div>
                <div className="risk-insights">
                  <p>Good performance with room for improvement in engagement.</p>
                </div>
              </div>

              <div className="course-risk-card needs-improvement">
                <div className="course-header">
                  <h4>Database</h4>
                  <span className="risk-badge medium">Medium Risk</span>
                </div>
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">78%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">85%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Engagement</span>
                    <span className="metric-value">72%</span>
                  </div>
                </div>
                <div className="risk-insights">
                  <p>Requires attention. Consider additional study time and resources.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Mitigation Recommendations */}
          <div className="dashboard-section">
            <h2>Risk Mitigation Recommendations</h2>
            <div className="recommendations-grid">
              <div className="recommendation-card">
                <div className="rec-icon study"></div>
                <div className="rec-content">
                  <h4>Database Course Support</h4>
                  <p>Schedule additional tutoring sessions for database concepts and practice more SQL queries.</p>
                  <div className="rec-priority high">High Priority</div>
                </div>
              </div>
              <div className="recommendation-card">
                <div className="rec-icon practice"></div>
                <div className="rec-content">
                  <h4>Assignment Submission</h4>
                  <p>Set up reminders for assignment deadlines and break large projects into smaller tasks.</p>
                  <div className="rec-priority medium">Medium Priority</div>
                </div>
              </div>
              <div className="recommendation-card">
                <div className="rec-icon resource"></div>
                <div className="rec-content">
                  <h4>Study Group Formation</h4>
                  <p>Join or form study groups for collaborative learning and peer support.</p>
                  <div className="rec-priority low">Low Priority</div>
                </div>
              </div>
            </div>
          </div>

          {/* Early Warning System */}
          <div className="dashboard-section">
            <h2>Early Warning System</h2>
            <div className="warning-system">
              <div className="warning-status">
                <div className="warning-icon">🟢</div>
                <div className="warning-content">
                  <h3>No Active Warnings</h3>
                  <p>All systems are functioning normally. Continue current study patterns.</p>
                </div>
              </div>
              <div className="warning-thresholds">
                <h4>Warning Thresholds</h4>
                <div className="threshold-item">
                  <span className="threshold-label">Attendance below 80%</span>
                  <span className="threshold-status safe">Safe (95%)</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">Quiz average below 70%</span>
                  <span className="threshold-status safe">Safe (87%)</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">Assignment submission below 90%</span>
                  <span className="threshold-status warning">Monitor (85%)</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">Engagement below 75%</span>
                  <span className="threshold-status safe">Safe (92%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Risk Data */}
          <div className="historical-analysis-section">
      <h2 className="section-title">Historical Risk Analysis</h2>
      
      {/* Historical Summary Dashboard */}
      <div className="historical-summary-card">
        {historicalData.summary.map((item, index) => (
          <div className="summary-item" key={index}>
            <h4 className="summary-title">{item.title}</h4>
            <span className={`summary-value ${item.colorClass}`}>{item.value}</span>
          </div>
        ))}
      </div>

    </div>
        </div>
      </div>
    </div>
  );
}
export default RiskStatusPage;
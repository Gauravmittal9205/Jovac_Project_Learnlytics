import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import RiskAnalysisForm from './RiskAnalysisForm';
import './RiskStatusPage.css';
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
  const [riskData, setRiskData] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [riskHistory, setRiskHistory] = useState([]);
  const [historicalData, setHistoricalData] = useState({
    summary: [
      { title: "Average Risk Level", value: "0%", colorClass: "low-risk" },
      { title: "Highest Risk Period", value: "N/A", colorClass: "" },
      { title: "Risk Trend", value: "Neutral", colorClass: "" },
      { title: "Total Analyses", value: "0", colorClass: "" },
    ],
    timeline: []
  });

  useEffect(() => { 
    if (!session) navigate('/login'); 
    // Load any saved risk data from localStorage
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('riskAnalysisData');
        const savedHistory = localStorage.getItem('riskAnalysisHistory');
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setRiskData(parsedData);
          setShowForm(false);
          
          if (savedHistory) {
            const history = JSON.parse(savedHistory);
            setRiskHistory(history);
            updateHistoricalData(parsedData, history);
          } else {
            updateHistoricalData(parsedData, []);
          }
        }
      } catch (error) {
        console.error('Error loading risk analysis data:', error);
      }
    };
    
    loadData();
  }, [navigate, session]);

  const handleAnalysisComplete = (result, formData) => {
    try {
      const newRiskData = {
        ...result,
        formData,
        timestamp: new Date().toISOString(),
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      // Create a new history array with the new analysis at the beginning
      const updatedHistory = [newRiskData, ...riskHistory].slice(0, 10);
      
      // Update state
      setRiskData(newRiskData);
      setRiskHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem('riskAnalysisData', JSON.stringify(newRiskData));
      localStorage.setItem('riskAnalysisHistory', JSON.stringify(updatedHistory));
      
      // Update UI
      setShowForm(false);
      updateHistoricalData(newRiskData, updatedHistory);
      
      console.log('Analysis saved. History:', updatedHistory); // Debug log
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const updateHistoricalData = (newRiskData, history) => {
    if (!newRiskData) return;
    
    const currentHistory = Array.isArray(history) ? history : [];
    // Add new entry to timeline
    const newEntry = {
      id: newRiskData.id,
      date: newRiskData.date,
      riskScore: newRiskData.riskScore,
      riskLevel: newRiskData.riskLevel.text,
      engagementScore: newRiskData.engagementScore.score,
      engagementLevel: newRiskData.engagementScore.level.text
    };

    // Calculate statistics
    const allRisks = [
      ...currentHistory.map(item => parseFloat(item.riskScore) || 0),
      parseFloat(newRiskData.riskScore) || 0
    ].filter(score => !isNaN(score));
      
    const avgRisk = (allRisks.reduce((a, b) => a + b, 0) / allRisks.length).toFixed(1);
    const highestRisk = Math.max(...allRisks);
    const highestRiskIndex = allRisks.indexOf(highestRisk);
    
    // Determine trend
    let trend = "Neutral";
    let trendClass = "";
    
    if (currentHistory.length > 0) {
      const prevRisk = parseFloat(currentHistory[0]?.riskScore) || 0;
      const currentRisk = parseFloat(newRiskData.riskScore) || 0;
      
      if (currentRisk < prevRisk - 5) {
        trend = "Improving";
        trendClass = "positive";
      } else if (currentRisk > prevRisk + 5) {
        trend = "Increasing";
        trendClass = "high-risk";
      }
    }

    setHistoricalData(prev => ({
      summary: [
        { 
          title: "Average Risk Level", 
          value: `${avgRisk}%`, 
          colorClass: avgRisk < 25 ? "low-risk" : avgRisk < 50 ? "medium-risk" : "high-risk" 
        },
        { 
          title: "Highest Risk", 
          value: `${highestRisk}%`, 
          colorClass: "high-risk",
          tooltip: currentHistory[highestRiskIndex]?.date || 'Current'
        },
        { 
          title: "Risk Trend", 
          value: trend, 
          colorClass: trendClass 
        },
        { 
          title: "Total Analyses", 
          value: history.length + 1, 
          colorClass: "" 
        },
      ],
      timeline: currentHistory.slice(0, 5).map((item) => ({
        id: item.id,
        date: item.date,
        risk: `${item.riskScore}%`,
        level: item.riskLevel,
        engagement: item.engagementScore,
        riskScore: item.riskScore,
        riskLevel: item.riskLevel,
        engagementScore: item.engagementScore,
        engagementLevel: item.engagementLevel
      }))
    }));
  };

  const handleNewAnalysis = () => {
    setShowForm(true);
  };
const handleDownloadReport = (id) => {
  // Implement report download functionality
  console.log(`Downloading report ${id}`);
  // You can add your download logic here
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
          {showForm ? (
            <div className="dashboard-section">
              <div className="form-container">
                <RiskAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
              </div>
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Risk Analysis History</h2>
                  
                </div>
                
                <div className="historical-summary">
                  {historicalData.summary.map((item, index) => (
                    <div 
                      key={index} 
                      className={`summary-item ${item.colorClass}`}
                      title={item.tooltip || ''}
                    >
                      <div className="summary-value">{item.value}</div>
                      <div className="summary-title">{item.title}</div>
                    </div>
                  ))}
                </div>
                
                <div className="risk-history">
                  <h3>Recent Risk Analyses</h3>
                  {riskHistory && riskHistory.length > 0 ? (
                    <div className="history-table">
                      <div className="history-header">
                        <div>Date & Time</div>
                        <div>Risk Score</div>
                        <div>Risk Level</div>
                        <div>Engagement</div>
                        <div>Actions</div>
                      </div>
                      {riskHistory.filter(Boolean).map((item) => (
                        <div key={item.id} className="history-row">
                          <div className="history-date">{item.date}</div>
                          <div className={`history-risk ${item.riskLevel.toLowerCase().replace(' ', '-')}`}>
                            {item.riskScore}%
                          </div>
                          <div>
                            <span className={`risk-badge ${item.riskLevel.toLowerCase().replace(' ', '-')}`}>
                              {item.riskLevel}
                            </span>
                          </div>
                          <div className="history-engagement">
                            <div className="engagement-bar">
                              <div 
                                className="engagement-fill"
                                style={{
                                  width: `${item.engagementScore}%`,
                                  backgroundColor: item.engagementLevel === 'Excellent' ? '#4CAF50' :
                                                 item.engagementLevel === 'Good' ? '#8BC34A' :
                                                 item.engagementLevel === 'Average' ? '#FFC107' :
                                                 item.engagementLevel === 'Below Average' ? '#FF9800' : '#F44336'
                                }}
                              ></div>
                              <span>{item.engagementScore}%</span>
                            </div>
                          </div>
                          <div className="history-actions">
                            <button 
                              className="btn-icon" 
                              title="View Details"
                              onClick={() => {
                                setRiskData(item);
                                setShowForm(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              👁️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">
                      <p>No historical analysis found. Complete a new analysis to start tracking your progress.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Risk Overview Section */}
              <div className="dashboard-section">
                <h2>Academic Risk Assessment</h2>
                <div className="risk-overview">
                  {riskData ? (
                    <div className="risk-summary-card">
                      <div className="risk-level-indicator">
                        <div className="risk-gauge">
                          <div 
                            className={`gauge-circle ${
                              riskData.riskLevel.text.toLowerCase().includes('low') ? 'low-risk' : 
                              riskData.riskLevel.text.toLowerCase().includes('moderate') ? 'medium-risk' : 'high-risk'
                            }`}
                            style={{
                              background: `conic-gradient(
                                ${riskData.riskLevel.color} 0% ${riskData.riskScore}%, 
                                #f0f0f0 ${riskData.riskScore}% 100%
                              )`
                            }}
                          >
                            <div className="gauge-center">
                              <div className="risk-score">{riskData.riskScore}%</div>
                              <div className="risk-level">{riskData.riskLevel.text} Risk</div>
                            </div>
                          </div>
                        </div>
                        <div className="risk-status">
                          <h3>{riskData.riskLevel.text} Risk</h3>
                          <p>Engagement: {riskData.engagementScore.score}% ({riskData.engagementScore.level.text})</p>
                          <p>Last analyzed: {new Date(riskData.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="risk-factors">
                        <div className={`factor-item ${riskData.formData.attendance >= 90 ? 'positive' : 'warning'}`}>
                          <span className="factor-icon">{riskData.formData.attendance >= 90 ? '✓' : '⚠'}</span>
                          <span>Attendance: {riskData.formData.attendance}%</span>
                        </div>
                        <div className={`factor-item ${riskData.formData.quizScores >= 80 ? 'positive' : 'warning'}`}>
                          <span className="factor-icon">{riskData.formData.quizScores >= 80 ? '✓' : '⚠'}</span>
                          <span>Quiz Scores: {riskData.formData.quizScores}%</span>
                        </div>
                        <div className={`factor-item ${riskData.formData.participation >= 80 ? 'positive' : 'warning'}`}>
                          <span className="factor-icon">{riskData.formData.participation >= 80 ? '✓' : '⚠'}</span>
                          <span>Participation: {riskData.formData.participation}%</span>
                        </div>
                        <div className={`factor-item ${riskData.formData.studyHours >= 10 ? 'positive' : 'warning'}`}>
                          <span className="factor-icon">{riskData.formData.studyHours >= 10 ? '✓' : '⚠'}</span>
                          <span>Weekly Study: {riskData.formData.studyHours} hours</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-data">
                      <p>No risk analysis data available. Please complete the assessment form.</p>
                      <button onClick={handleNewAnalysis} className="btn-primary">
                        Start Risk Assessment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Analysis Charts */}
              <div className="dashboard-section">
                <h2>Risk Analysis Breakdown</h2>
                {riskData ? (
                  <div className="risk-charts-grid">
                    <div className="chart-card">
                      <h3>Risk Factors Distribution</h3>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={[
                              { name: 'Attendance', value: parseFloat(riskData.formData.attendance) },
                              { name: 'Quizzes', value: parseFloat(riskData.formData.quizScores) },
                              { name: 'Assignments', value: parseFloat(riskData.formData.assignmentScores) },
                              { name: 'Participation', value: parseFloat(riskData.formData.participation) },
                              { name: 'Study Hours', value: parseFloat(riskData.formData.studyHours) * 5 } // Scale for visibility
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                            <Bar dataKey="value" fill="#5a7dfd">
                              {[0, 1, 2, 3, 4].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                  index === 0 ? '#4CAF50' : 
                                  index === 1 ? '#2196F3' : 
                                  index === 2 ? '#FFC107' : 
                                  index === 3 ? '#FF9800' : '#9C27B0'
                                } />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="chart-card">
                      <h3>Performance Radar</h3>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart 
                            cx="50%" 
                            cy="50%" 
                            outerRadius="80%" 
                            data={[
                              { subject: 'Attendance', A: parseFloat(riskData.formData.attendance), fullMark: 100 },
                              { subject: 'Quizzes', A: parseFloat(riskData.formData.quizScores), fullMark: 100 },
                              { subject: 'Assignments', A: parseFloat(riskData.formData.assignmentScores), fullMark: 100 },
                              { subject: 'Participation', A: parseFloat(riskData.formData.participation), fullMark: 100 },
                              { subject: 'Study Hours', A: parseFloat(riskData.formData.studyHours) * 5, fullMark: 100 },
                            ]}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar 
                              name="Performance" 
                              dataKey="A" 
                              stroke="#5a7dfd" 
                              fill="#5a7dfd" 
                              fillOpacity={0.6} 
                            />
                            <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="chart-card">
                      <h3>Risk Level</h3>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Risk Score', value: parseFloat(riskData.riskScore) },
                                { name: 'Remaining', value: 100 - parseFloat(riskData.riskScore) }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill={riskData.riskLevel.color} />
                              <Cell fill="#e0e0e0" />
                              <Tooltip formatter={(value) => [`${value}%`, value === parseFloat(riskData.riskScore) ? 'Risk Score' : 'Remaining']} />
                            </Pie>
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: 'bold', fill: riskData.riskLevel.color }}>
                              {riskData.riskScore}%
                            </text>
                            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '14px', fill: '#666' }}>
                              {riskData.riskLevel.text} Risk
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>Complete the risk assessment to see detailed analysis.</p>
                  </div>
                )}
              </div>

              {/* Course-Specific Risk Analysis */}
              <div className="dashboard-section">
                <h2>Course-Specific Risk Analysis</h2>
                {riskData ? (
                  <div className="course-risk-grid">
                    <div className={`course-risk-card ${
                      riskData.riskLevel.text.toLowerCase().includes('low') ? 'excellent' : 
                      riskData.riskLevel.text.toLowerCase().includes('moderate') ? 'good' : 'needs-improvement'
                    }`}>
                      <div className="course-header">
                        <h4>{riskData.formData.course || 'Selected Course'}</h4>
                        <span className={`risk-badge ${
                          riskData.riskLevel.text.toLowerCase().includes('low') ? 'low' : 
                          riskData.riskLevel.text.toLowerCase().includes('moderate') ? 'medium' : 'high'
                        }`}>
                          {riskData.riskLevel.text} Risk
                        </span>
                      </div>
                      <div className="risk-metrics">
                        <div className="metric">
                          <span className="metric-label">Quizzes</span>
                          <span className="metric-value">{riskData.formData.quizScores}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Attendance</span>
                          <span className="metric-value">{riskData.formData.attendance}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Engagement</span>
                          <span className="metric-value">{riskData.engagementScore.score}%</span>
                        </div>
                      </div>
                      <div className="risk-insights">
                        <p>
                          {riskData.riskLevel.text === 'Low' ? (
                            'Your performance is on track. Keep up the good work!'
                          ) : riskData.riskLevel.text === 'Moderate' ? (
                            'Your performance needs attention. Consider additional study time and resources.'
                          ) : (
                            'Immediate action is recommended to improve your academic standing.'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Add more course cards if you have data for multiple courses */}
                    <div className="course-risk-card">
                      <div className="course-header">
                        <h4>Additional Course</h4>
                        <span className="risk-badge low">Not Assessed</span>
                      </div>
                      <div className="risk-metrics">
                        <div className="metric">
                          <span className="metric-label">Score</span>
                          <span className="metric-value">--%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Attendance</span>
                          <span className="metric-value">--%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Engagement</span>
                          <span className="metric-value">--%</span>
                        </div>
                      </div>
                      <div className="risk-insights">
                        <p>Complete risk assessment for this course to see detailed analysis.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>Complete the risk assessment to see course-specific analysis.</p>
                  </div>
                )}
              </div>

              {/* Risk Mitigation Recommendations */}
              <div className="dashboard-section">
                <h2>Risk Mitigation Recommendations</h2>
                {riskData ? (
                  <div className="recommendations-grid">
                    {parseFloat(riskData.riskScore) < 25 ? (
                      <div className="recommendation-card">
                        <div className="rec-icon excellent">🌟</div>
                        <div className="rec-content">
                          <h4>Maintain Your Performance</h4>
                          <p>Your risk level is low. Continue with your current study habits and consider helping peers who might be struggling.</p>
                          <div className="rec-priority low">Low Priority</div>
                        </div>
                      </div>
                    ) : parseFloat(riskData.riskScore) < 50 ? (
                      <>
                        <div className="recommendation-card">
                          <div className="rec-icon good">📚</div>
                          <div className="rec-content">
                            <h4>Targeted Improvement</h4>
                            <p>Focus on areas with lower scores to reduce your risk further.</p>
                            {parseFloat(riskData.formData.attendance) < 85 && <p>• Improve attendance to above 90%</p>}
                            {parseFloat(riskData.formData.quizScores) < 70 && <p>• Review quiz materials and practice questions</p>}
                            <div className="rec-priority medium">Medium Priority</div>
                          </div>
                        </div>
                        <div className="recommendation-card">
                          <div className="rec-icon study">⏱️</div>
                          <div className="rec-content">
                            <h4>Time Management</h4>
                            <p>Consider adjusting your study schedule to allocate more time to challenging subjects.</p>
                            <div className="rec-priority medium">Medium Priority</div>
                          </div>
                        </div>
                      </>
                    ) : parseFloat(riskData.riskScore) < 75 ? (
                      <>
                        <div className="recommendation-card">
                          <div className="rec-icon high">⚠️</div>
                          <div className="rec-content">
                            <h4>Immediate Action Required</h4>
                            <p>Your risk level is moderate to high. Consider taking these steps:</p>
                            <ul>
                              <li>Attend all classes and participate actively</li>
                              <li>Schedule regular study sessions (15-20 hours/week)</li>
                              <li>Meet with your instructor during office hours</li>
                            </ul>
                            <div className="rec-priority high">High Priority</div>
                          </div>
                        </div>
                        <div className="recommendation-card">
                          <div className="rec-icon resource">🔄</div>
                          <div className="rec-content">
                            <h4>Utilize Resources</h4>
                            <p>Take advantage of available academic support:</p>
                            <ul>
                              <li>Form or join a study group</li>
                              <li>Utilize tutoring services</li>
                              <li>Review lecture recordings and materials</li>
                            </ul>
                            <div className="rec-priority high">High Priority</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="recommendation-card critical">
                        <div className="rec-icon critical">🚨</div>
                        <div className="rec-content">
                          <h4>Critical Intervention Needed</h4>
                          <p>Your risk level is critical. Take these immediate actions:</p>
                          <ul>
                            <li>Schedule an urgent meeting with your academic advisor</li>
                            <li>Develop a detailed study plan with your instructor</li>
                            <li>Consider reducing other commitments to focus on academics</li>
                            <li>Attend all classes and submit all assignments, even if late</li>
                            <li>Seek help from tutoring services and academic support centers</li>
                          </ul>
                          <div className="rec-priority critical">Critical Priority</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-data">
                    <p>Complete the risk assessment to get personalized recommendations.</p>
                  </div>
                )}
              </div>

              {/* Early Warning System */}
              <div className="dashboard-section">
                <h2>Early Warning System</h2>
                {/* ... */}
              </div>

              {/* Historical Risk Data */}
              <div className="dashboard-section">
  <div className="section-header">
    <div className="header-content">
      <h2>Risk Analysis History</h2>
      <p className="section-subtitle">Track and manage your risk assessment history</p>
    </div>
    <button 
      onClick={handleNewAnalysis}
      className="btn btn-primary with-icon"
    >
      <span className="icon">+</span> New Analysis
    </button>
  </div>
  
  <div className="historical-summary">
    {historicalData.summary.map((item, index) => (
      <div 
        key={index} 
        className={`summary-card ${item.colorClass}`}
        title={item.tooltip || ''}
      >
        <div className="summary-icon">
          {index === 0 ? '📊' : index === 1 ? '📈' : index === 2 ? '📉' : '🔢'}
        </div>
        <div className="summary-content">
          <div className="summary-value">{item.value}</div>
          <div className="summary-title">{item.title}</div>
        </div>
        {index === 2 && (
          <div className={`trend-indicator ${Math.random() > 0.5 ? 'up' : 'down'}`}>
            {Math.random() > 0.5 ? '↑' : '↓'} {Math.floor(Math.random() * 10) + 1}%
          </div>
        )}
      </div>
    ))}
  </div>
  
  <div className="risk-history">
    <div className="section-header compact">
      <h3>Recent Risk Analyses</h3>
      <div className="view-options">
        <button className="btn-text active">All</button>
        <button className="btn-text">High Risk</button>
        <button className="btn-text">Medium Risk</button>
        <button className="btn-text">Low Risk</button>
      </div>
    </div>
    
    <div className="history-table">
      <div className="history-header">
        <div className="header-cell">Date & Time</div>
        <div className="header-cell">Risk Score</div>
        <div className="header-cell">Risk Level</div>
        <div className="header-cell">Engagement</div>
        <div className="header-cell actions">Actions</div>
      </div>
      <div className="history-body">
        {riskHistory.filter(Boolean).map((item) => (
          <div key={item.id} className={`history-row ${item.riskLevel.toLowerCase().replace(' ', '-')}`}>
            <div className="cell date-cell">
              <div className="date">{item.date.split(',')[0]}</div>
              <div className="time">{item.date.split(',').slice(1).join(',').trim()}</div>
            </div>
            <div className="cell score-cell">
              <div className={`risk-score ${item.riskLevel.toLowerCase().replace(' ', '-')}`}>
                {item.riskScore}%
              </div>
            </div>
            <div className="cell level-cell">
              <span className={`risk-badge ${item.riskLevel.toLowerCase().replace(' ', '-')}`}>
                {item.riskLevel}
              </span>
            </div>
            <div className="cell engagement-cell">
              <div className="engagement-wrapper">
                <div className="engagement-bar">
                  <div 
                    className="engagement-fill"
                    style={{
                      width: `${item.engagementScore}%`,
                      backgroundColor: item.engagementLevel === 'Excellent' ? '#10B981' :
                                     item.engagementLevel === 'Good' ? '#34D399' :
                                     item.engagementLevel === 'Average' ? '#F59E0B' :
                                     item.engagementLevel === 'Below Average' ? '#F59E0B' : '#EF4444'
                    }}
                  ></div>
                </div>
                <span className="engagement-score">
                  {item.engagementScore}% <span className="engagement-level">{item.engagementLevel}</span>
                </span>
              </div>
            </div>
            <div className="cell actions-cell">
              <div className="action-buttons">
                <button 
                  className="btn-icon view-btn" 
                  title="View Details"
                  onClick={() => {
                    setRiskData(item);
                    setShowForm(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span className="icon">👁️</span>
                </button>
                <button 
                  className="btn-icon download-btn" 
                  title="Download Report"
                  onClick={() => handleDownloadReport(item.id)}
                >
                  <span className="icon">⬇️</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default RiskStatusPage;
import React, { useState, useRef, useEffect, useContext,useCallback} from 'react';
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
  RadarChart,
  PolarGrid,
  ScatterChart,
  ZAxis,
  Scatter,
  Radar,
  PolarRadiusAxis,
  Legend,
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
const emptySummary = {
  gpa: '',
  attendanceRate: '',
  currentGrade: '',
  predictedGPA: '',
  riskLevel: '',
  projectedAttendanceDrop: '',
  passProbability: '',
  predictionConfidence: '',
};

const emptyStudyPlan = {
  recommendedHours: '',
  focusSubjects: [],
  chapters: [],
  videos: [],
};

const emptyPeerComparison = {
  rankPercentile: '',
  comparedToPeers: {},
};
function AcademicPerformancePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const studentId = session?._id || session?.id || session?.userId || session?.user?._id || 'demo-student';
  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  
  // Light theme styles
  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '2rem',
      color: '#1e293b',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-2px)',
      },
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#475569',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#93c5fd',
        boxShadow: '0 0 0 3px rgba(147, 197, 253, 0.5)',
      },
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s',
      '&:hover': {
        backgroundColor: '#2563eb',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1.25rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e2e8f0',
    },
    grid: {
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      marginBottom: '2rem',
    },
  };

  const [summary, setSummary] = useState(emptySummary);
  const [summaryForm, setSummaryForm] = useState(emptySummary);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [assessmentPerformance, setAssessmentPerformance] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [studyPlan, setStudyPlan] = useState(emptyStudyPlan);
  const [studyPlanForm, setStudyPlanForm] = useState({
    recommendedHours: '',
    focusSubjects: '',
    chapters: '',
    videos: '',
  });
  const [peerComparison, setPeerComparison] = useState(emptyPeerComparison);
  const [peerRankInput, setPeerRankInput] = useState('');
  const [peerEntry, setPeerEntry] = useState({ subject: '', stance: 'higher' });
  const [assignmentProgress, setAssignmentProgress] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [weeklyEntry, setWeeklyEntry] = useState({ week: '', score: '' });
  const [subjectEntry, setSubjectEntry] = useState({ subject: '', score: '' });
  const [assessmentEntry, setAssessmentEntry] = useState({ name: '', score: '' });
  const [weakTopicEntry, setWeakTopicEntry] = useState({ subject: '', topics: '', averageScore: '' });
  const [assignmentEntry, setAssignmentEntry] = useState({ subject: '', completed: '', total: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newStudyEntry, setNewStudyEntry] = useState({ hours: '', score: '' });

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const parseList = (value = '') =>
    value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const handleSummaryFormChange = (field, value) => {
    setSummaryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSummarySubmit = (event) => {
    event.preventDefault();
    setSummary({ ...summaryForm });
  };

  const handleWeeklyEntryChange = (field, value) => {
    setWeeklyEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleWeeklyEntrySubmit = (event) => {
    event.preventDefault();
    if (!weeklyEntry.week || weeklyEntry.score === '') return;
    setPerformanceTrend(prev => [...prev, { week: weeklyEntry.week, score: Number(weeklyEntry.score) }]);
    setWeeklyEntry({ week: '', score: '' });
  };

  const handleSubjectEntryChange = (field, value) => {
    setSubjectEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectEntrySubmit = (event) => {
    event.preventDefault();
    if (!subjectEntry.subject || subjectEntry.score === '') return;
    setSubjectPerformance(prev => [...prev, { subject: subjectEntry.subject, score: Number(subjectEntry.score) }]);
    setSubjectEntry({ subject: '', score: '' });
  };

  const handleAssessmentEntryChange = (field, value) => {
    setAssessmentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentEntrySubmit = (event) => {
    event.preventDefault();
    if (!assessmentEntry.name || assessmentEntry.score === '') return;
    setAssessmentPerformance(prev => [...prev, { name: assessmentEntry.name, score: Number(assessmentEntry.score) }]);
    setAssessmentEntry({ name: '', score: '' });
  };

  const handleWeakTopicChange = (field, value) => {
    setWeakTopicEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleWeakTopicSubmit = (event) => {
    event.preventDefault();
    if (!weakTopicEntry.subject) return;
    setWeakTopics(prev => [
      ...prev,
      {
        subject: weakTopicEntry.subject,
        topics: parseList(weakTopicEntry.topics),
        averageScore: weakTopicEntry.averageScore ? Number(weakTopicEntry.averageScore) : null,
      },
    ]);
    setWeakTopicEntry({ subject: '', topics: '', averageScore: '' });
  };

  const handleAssignmentEntryChange = (field, value) => {
    setAssignmentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAssignmentEntrySubmit = (event) => {
    event.preventDefault();
    if (!assignmentEntry.subject) return;
    setAssignmentProgress(prev => [
      ...prev,
      {
        subject: assignmentEntry.subject,
        completed: assignmentEntry.completed ? Number(assignmentEntry.completed) : 0,
        total: assignmentEntry.total ? Number(assignmentEntry.total) : 0,
      },
    ]);
    setAssignmentEntry({ subject: '', completed: '', total: '' });
  };

  const handleStudyPlanFormChange = (field, value) => {
    setStudyPlanForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStudyPlanSubmit = (event) => {
    event.preventDefault();
    setStudyPlan({
      recommendedHours: studyPlanForm.recommendedHours,
      focusSubjects: parseList(studyPlanForm.focusSubjects),
      chapters: parseList(studyPlanForm.chapters),
      videos: parseList(studyPlanForm.videos),
    });
  };

  const handlePeerRankSubmit = (event) => {
    event.preventDefault();
    setPeerComparison(prev => ({ ...prev, rankPercentile: peerRankInput }));
  };

  const handlePeerEntryChange = (field, value) => {
    setPeerEntry(prev => ({ ...prev, [field]: value }));
  };

  const handlePeerEntrySubmit = (event) => {
    event.preventDefault();
    if (!peerEntry.subject) return;
    setPeerComparison(prev => ({
      ...prev,
      comparedToPeers: {
        ...prev.comparedToPeers,
        [peerEntry.subject]: peerEntry.stance,
      },
    }));
    setPeerEntry({ subject: '', stance: 'higher' });
  };

  const fetchAcademicData = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);

    try {
      const endpoints = [
        { key: 'summary', url: `${apiBase}/api/academic/summary/${studentId}` },
        { key: 'performanceTrend', url: `${apiBase}/api/academic/performance-trend/${studentId}` },
        { key: 'subjectPerformance', url: `${apiBase}/api/academic/subject-performance/${studentId}` },
        { key: 'assessmentPerformance', url: `${apiBase}/api/academic/assessment-performance/${studentId}` },
        { key: 'weakTopics', url: `${apiBase}/api/academic/weak-topics/${studentId}` },
        { key: 'studyPlan', url: `${apiBase}/api/academic/study-plan/${studentId}` },
        { key: 'peerComparison', url: `${apiBase}/api/academic/peer-comparison/${studentId}` },
        { key: 'assignmentProgress', url: `${apiBase}/api/academic/assignment-progress/${studentId}` },
      ];

      const responses = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText || 'Request failed');
            const payload = await res.json();
            return [key, payload];
          } catch (err) {
            console.warn(`Academic API ${key} failed`, err.message);
            return [key, null];
          }
        })
      );

      const data = Object.fromEntries(responses);

      if (data.summary) {
        setSummary(prev => ({ ...prev, ...data.summary }));
        setSummaryForm(prev => ({
          ...prev,
          gpa: data.summary.gpa ?? prev.gpa,
          attendanceRate: data.summary.attendanceRate ?? prev.attendanceRate,
          currentGrade: data.summary.currentGrade ?? prev.currentGrade,
          predictedGPA: data.summary.predictedGPA ?? data.summary.predictedGpa ?? prev.predictedGPA,
          riskLevel: data.summary.riskLevel ?? prev.riskLevel,
          projectedAttendanceDrop: data.summary.projectedAttendanceDrop ?? prev.projectedAttendanceDrop,
          passProbability: data.summary.passProbability ?? data.summary.probabilityPassing ?? prev.passProbability,
          predictionConfidence: data.summary.predictionConfidence ?? data.summary.predictionConfidencePct ?? prev.predictionConfidence,
        }));
      }
      if (Array.isArray(data.performanceTrend) && data.performanceTrend.length) setPerformanceTrend(data.performanceTrend);
      if (Array.isArray(data.subjectPerformance) && data.subjectPerformance.length) setSubjectPerformance(data.subjectPerformance);
      if (Array.isArray(data.assessmentPerformance) && data.assessmentPerformance.length) setAssessmentPerformance(data.assessmentPerformance);
      if (Array.isArray(data.weakTopics) && data.weakTopics.length) setWeakTopics(data.weakTopics);
      if (data.studyPlan) {
        setStudyPlan({
          recommendedHours: data.studyPlan.recommendedHours ?? '',
          focusSubjects: data.studyPlan.focusSubjects || [],
          chapters: data.studyPlan.chapters || [],
          videos: data.studyPlan.videos || [],
        });
        setStudyPlanForm({
          recommendedHours: data.studyPlan.recommendedHours?.toString() || '',
          focusSubjects: (data.studyPlan.focusSubjects || []).join(', '),
          chapters: (data.studyPlan.chapters || []).join(', '),
          videos: (data.studyPlan.videos || []).join(', '),
        });
      }
      if (data.peerComparison) {
        setPeerComparison({
          rankPercentile: data.peerComparison.rankPercentile ?? '',
          comparedToPeers: data.peerComparison.comparedToPeers || {},
        });
        setPeerRankInput(data.peerComparison.rankPercentile?.toString() || '');
      }
      if (Array.isArray(data.assignmentProgress) && data.assignmentProgress.length) setAssignmentProgress(data.assignmentProgress);
    } catch (err) {
      console.error('Academic data fetch failed', err);
      setError('Unable to sync with academic analytics right now. Showing cached insights.');
    } finally {
      setLoading(false);
    }
  }, [apiBase, studentId]);

  useEffect(() => {
    fetchAcademicData();
  }, [fetchAcademicData]);

  const formatProbability = (value) => {
    if (value === undefined || value === null) return 0;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 0;
    return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  };

  const summaryNumericValue = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const predictedGPAValue =
    summaryNumericValue(summary.predictedGPA) ??
    summaryNumericValue(summary.predictedGpa) ??
    summaryNumericValue(summary.gpa);
  const predictedGPA = predictedGPAValue !== null ? predictedGPAValue.toFixed(2) : '—';

  const passProbabilitySource =
    summary.passProbability !== '' && summary.passProbability !== undefined
      ? summary.passProbability
      : summary.probabilityPassing ?? summary.passRate ?? '';
  const passProbability =
    passProbabilitySource !== '' && passProbabilitySource !== undefined
      ? formatProbability(passProbabilitySource)
      : null;

  const attendanceDropValue =
    summary.projectedAttendanceDrop !== '' && summary.projectedAttendanceDrop !== undefined
      ? Number(summary.projectedAttendanceDrop)
      : null;
  const predictionConfidence =
    summary.predictionConfidence !== '' && summary.predictionConfidence !== undefined
      ? formatProbability(summary.predictionConfidence)
      : null;

  const riskLevel = summary.riskLevel || 'Not set';
  const riskClass = `risk-chip ${summary.riskLevel ? summary.riskLevel.toLowerCase() : 'neutral'}`;

  const assignmentProgressWithPercent = assignmentProgress.map(item => {
    const percent = item.total ? Math.round((item.completed / item.total) * 100) : 0;
    return { ...item, percent };
  });

  const scatterData = studyLogs;

  const lastThreeScores = performanceTrend.slice(-3);
  const isDeclining =
    lastThreeScores.length === 3 &&
    lastThreeScores[0].score > lastThreeScores[1].score &&
    lastThreeScores[1].score > lastThreeScores[2].score;
  const weeklyScoreString = lastThreeScores.length ? lastThreeScores.map(item => item.score).join(' → ') : 'insufficient data';

  const averageStudyHours = scatterData.length
    ? (scatterData.reduce((sum, entry) => sum + entry.hours, 0) / scatterData.length).toFixed(1)
    : '—';

  const passProbabilityLabel = passProbability !== null ? `${passProbability}%` : '—';
  const attendanceDropLabel = attendanceDropValue === null ? '—' : attendanceDropValue === 0 ? 'Stable' : `${attendanceDropValue}%`;
  const predictionConfidenceLabel = predictionConfidence !== null ? `${predictionConfidence}%` : '—';

  const peerSubjects = peerComparison?.comparedToPeers || {};

  const hasPerformanceTrend = performanceTrend.length > 0;
  const hasSubjectPerformance = subjectPerformance.length > 0;
  const hasAssessmentPerformance = assessmentPerformance.length > 0;
  const hasAssignments = assignmentProgressWithPercent.length > 0;
  const hasWeakTopics = weakTopics.length > 0;
  const peerSubjectEntries = Object.entries(peerSubjects);
  const hasPeerSubjects = peerSubjectEntries.length > 0;
  const hasStudyPlanData =
    Boolean(studyPlan.recommendedHours) ||
    (Array.isArray(studyPlan.focusSubjects) && studyPlan.focusSubjects.length > 0) ||
    (Array.isArray(studyPlan.chapters) && studyPlan.chapters.length > 0) ||
    (Array.isArray(studyPlan.videos) && studyPlan.videos.length > 0);

  const handleStudyEntryChange = (field, value) => {
    setNewStudyEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleStudyLogSubmit = (event) => {
    event.preventDefault();
    if (!newStudyEntry.hours || !newStudyEntry.score) return;

    const entry = {
      id: Date.now(),
      hours: Number(newStudyEntry.hours),
      score: Number(newStudyEntry.score),
      source: 'Manual Log'
    };

    if (Number.isNaN(entry.hours) || Number.isNaN(entry.score)) return;

    setStudyLogs(prev => [...prev, entry]);
    setNewStudyEntry({ hours: '', score: '' });
  };

  const resetStudyLogs = () => setStudyLogs([]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Retained from original code */}
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
            <Link to="/academic-performance" className="nav-item active">
              <span className="nav-text">Academic Performance</span>
            </Link>
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
            <h1>Academic Performance</h1>
          </div>
          <div className="header-right">
            <button className="ghost-btn" onClick={fetchAcademicData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh AI Insights'}
            </button>
          </div>
        </div>

        <div className="academic-performance-container">
          {error && <div className="inline-alert warning">{error}</div>}
          {loading && !error && <div className="inline-alert info">Crunching latest predictions...</div>}

          <div className="data-entry-panel">
            <div className="section-header">
              <h2 className="section-title">Academic Performance Dashboard</h2>
              <p className="section-description">Track and manage your academic progress with real-time insights and analytics</p>
            </div>
            <div className="data-entry-grid">
              {/* Academic Summary - Full Width */}
              <form className="data-form" onSubmit={handleSummarySubmit}>
                <h3>Academic Summary</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Current GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={summaryForm.gpa}
                      onChange={(e) => handleSummaryFormChange('gpa', e.target.value)}
                      placeholder="e.g. 3.6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Predicted GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={summaryForm.predictedGPA}
                      onChange={(e) => handleSummaryFormChange('predictedGPA', e.target.value)}
                      placeholder="e.g. 3.8"
                    />
                  </div>
                  <div className="form-group">
                    <label>Attendance %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={summaryForm.attendanceRate}
                      onChange={(e) => handleSummaryFormChange('attendanceRate', e.target.value)}
                      placeholder="95"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Grade</label>
                    <input
                      type="text"
                      className="form-control"
                      value={summaryForm.currentGrade}
                      onChange={(e) => handleSummaryFormChange('currentGrade', e.target.value)}
                      placeholder="B+"
                    />
                  </div>
                  <div className="form-group">
                    <label>Risk Level</label>
                    <select 
                      className="form-control"
                      value={summaryForm.riskLevel} 
                      onChange={(e) => handleSummaryFormChange('riskLevel', e.target.value)}
                    >
                      <option value="">Select risk level</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Attendance Drop %</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={summaryForm.projectedAttendanceDrop}
                      onChange={(e) => handleSummaryFormChange('projectedAttendanceDrop', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pass Probability %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={summaryForm.passProbability}
                      onChange={(e) => handleSummaryFormChange('passProbability', e.target.value)}
                      placeholder="90"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confidence %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={summaryForm.predictionConfidence}
                      onChange={(e) => handleSummaryFormChange('predictionConfidence', e.target.value)}
                      placeholder="85"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Update Summary
                  </button>
                </div>
              </form>
              
              {/* Other Forms - Two Column Layout */}
              <div className="forms-container">

              <form className="data-form" onSubmit={handleWeeklyEntrySubmit}>
                <h3>Add Weekly Score</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Week Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={weeklyEntry.week}
                      onChange={(e) => handleWeeklyEntryChange('week', e.target.value)}
                      placeholder="Week 1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={weeklyEntry.score}
                      onChange={(e) => handleWeeklyEntryChange('score', e.target.value)}
                      placeholder="88"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Week</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handleSubjectEntrySubmit}>
                <h3>Subject Average</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subjectEntry.subject}
                      onChange={(e) => handleSubjectEntryChange('subject', e.target.value)}
                      placeholder="Mathematics"
                    />
                  </div>
                  <div className="form-group">
                    <label>Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={subjectEntry.score}
                      onChange={(e) => handleSubjectEntryChange('score', e.target.value)}
                      placeholder="92"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Subject</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handleAssessmentEntrySubmit}>
                <h3>Assessment Type</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Assessment Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={assessmentEntry.name}
                      onChange={(e) => handleAssessmentEntryChange('name', e.target.value)}
                      placeholder="Quizzes, Midterm, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={assessmentEntry.score}
                      onChange={(e) => handleAssessmentEntryChange('score', e.target.value)}
                      placeholder="85"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Assessment</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handleWeakTopicSubmit}>
                <h3>Weak Topic</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={weakTopicEntry.subject}
                      onChange={(e) => handleWeakTopicChange('subject', e.target.value)}
                      placeholder="e.g., Physics, Mathematics"
                    />
                  </div>
                  <div className="form-group">
                    <label>Chapters (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={weakTopicEntry.topics}
                      onChange={(e) => handleWeakTopicChange('topics', e.target.value)}
                      placeholder="Optics, Magnetism, Calculus"
                    />
                  </div>
                  <div className="form-group">
                    <label>Average Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={weakTopicEntry.averageScore}
                      onChange={(e) => handleWeakTopicChange('averageScore', e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Weak Topic</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </form>
            </div> {/* End of forms-container */}

              <form className="data-form study-plan-form" onSubmit={handleStudyPlanSubmit}>
                <h3>Study Plan</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Hours this week</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={studyPlanForm.recommendedHours}
                      onChange={(e) => handleStudyPlanFormChange('recommendedHours', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Focus subjects</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studyPlanForm.focusSubjects}
                      onChange={(e) => handleStudyPlanFormChange('focusSubjects', e.target.value)}
                      placeholder="Math, Physics"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Save Study Plan</span>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handlePeerRankSubmit}>
                <h3>Peer Benchmark</h3>
                <div className="form-grid">
                  <label>
                    Rank Percentile
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={peerRankInput}
                      onChange={(e) => setPeerRankInput(e.target.value)}
                      placeholder="82"
                    />
                  </label>
                </div>
                <button type="submit" className="btn primary-btn">Update Rank</button>
              </form>

              <form className="data-form" onSubmit={handlePeerEntrySubmit}>
                <h3>Peer Subject Comparison</h3>
                <div className="form-grid">
                  <label>
                    Subject
                    <input
                      type="text"
                      value={peerEntry.subject}
                      onChange={(e) => handlePeerEntryChange('subject', e.target.value)}
                      placeholder="Math"
                    />
                  </label>
                  <label>
                    Relative Performance
                    <select value={peerEntry.stance} onChange={(e) => handlePeerEntryChange('stance', e.target.value)}>
                      <option value="higher">Higher than peers</option>
                      <option value="lower">Lower than peers</option>
                      <option value="same">Same as peers</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="btn primary-btn">Add Comparison</button>
              </form>
            </div>
          </div>

          <div className="dashboard-section forecast-row">
            <div className="ai-forecast-card">
              <div className="forecast-header">
                <div>
                  <p className="forecast-label">Personal Score Forecast (AI)</p>
                  <h2 className="forecast-value">Projected GPA Next Month: <span>{predictedGPA}</span></h2>
                </div>
                <span className={riskClass}>{riskLevel === 'Not set' ? 'Risk N/A' : `${riskLevel} Risk`}</span>
              </div>
              <div className="forecast-grid">
                <div>
                  <p className="forecast-label">Probability of passing all subjects</p>
                  <p className="forecast-metric">{passProbabilityLabel}</p>
                </div>
                <div>
                  <p className="forecast-label">Projected attendance drop</p>
                  <p className="forecast-metric">{attendanceDropLabel}</p>
                </div>
                <div>
                  <p className="forecast-label">Prediction confidence</p>
                  <p className="forecast-metric">{predictionConfidenceLabel}</p>
                </div>
              </div>
              <p className="forecast-footnote">AI forecast updates nightly based on your assessments, attendance, and engagement data.</p>
            </div>

            <div className="performance-metrics modern">
              <div className="metric-card">
                <div className="icon">🎓</div>
                <div className="metric-info">
                  <h3>Current GPA</h3>
                  <p className="metric-value">{summary.gpa || '—'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon">🕒</div>
                <div className="metric-info">
                  <h3>Attendance Rate</h3>
                  <p className="metric-value">
                    {summary.attendanceRate !== '' && summary.attendanceRate !== undefined
                      ? `${summary.attendanceRate}%`
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon">⭐</div>
                <div className="metric-info">
                  <h3>Current Grade</h3>
                  <p className="metric-value">{summary.currentGrade || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section chart-stack">
            <div className="chart-card">
              <div className="section-header-with-action">
                <div>
                  <h3>Weekly Performance Trend</h3>
                  <p className="chart-description">AI monitors exam + quiz scores to flag declines.</p>
                </div>
              </div>
              {hasPerformanceTrend ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ec" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#4c6ef5" strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add at least one weekly score to view this trend.</div>
              )}
            </div>
            <div className="chart-card">
              <h3>Subject-wise Average Scores</h3>
              {hasSubjectPerformance ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ec" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#a770ef" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add subject scores to compare performance.</div>
              )}
            </div>
            <div className="chart-card">
              <h3>Assessment Type Breakdown</h3>
              {hasAssessmentPerformance ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={assessmentPerformance}>
                    <PolarGrid stroke="#e0e6ec" />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="score" stroke="#2575fc" fill="#2575fc" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add assessment averages to see this radar view.</div>
              )}
            </div>
          </div>

          <div className="dashboard-section dual-grid">
            <div className="chart-card scatter-card">
              <div className="section-header-with-action">
                <div>
                  <h3>Study Time vs Score</h3>
                  <p className="chart-description">Log study hours or sync from mobile to validate “more study → higher grades”.</p>
                </div>
                <button className="ghost-btn small" onClick={resetStudyLogs}>Clear Logs</button>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="hours" name="Study Hours" unit="h" />
                  <YAxis type="number" dataKey="score" name="Score" unit="%" domain={[0, 100]} />
                  <ZAxis type="category" dataKey="source" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={scatterData} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="chart-footnote">
                Average logged study time: {averageStudyHours === '—' ? '—' : `${averageStudyHours}h`} • Keep tracking to strengthen the correlation insights.
              </p>
              <form className="study-log-form" onSubmit={handleStudyLogSubmit}>
                <label>
                  Study hours
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={newStudyEntry.hours}
                    onChange={(e) => handleStudyEntryChange('hours', e.target.value)}
                    placeholder="e.g. 3"
                  />
                </label>
                <label>
                  Score (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudyEntry.score}
                    onChange={(e) => handleStudyEntryChange('score', e.target.value)}
                    placeholder="e.g. 88"
                  />
                </label>
                <button type="submit" className="btn primary-btn">Log Study Session</button>
                <button type="button" className="btn secondary-btn" disabled>
                  Sync from mobile app (soon)
                </button>
              </form>
            </div>
            <div className="card assignment-card">
              <h3>Assignment Completion Tracker</h3>
              <p className="section-description">Stay on top of per-course deliverables.</p>
              {hasAssignments ? (
                <div className="assignment-progress-list">
                  {assignmentProgressWithPercent.map((item) => (
                    <div key={item.subject} className="progress-row">
                      <div className="progress-header">
                        <span>{item.subject}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.percent}%` }}></div>
                      </div>
                      <small>
                        {item.total ? `${item.completed}/${item.total}` : item.completed} assignments completed
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Add assignment progress entries to visualize completion.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section triple-grid">
            <div className="card weak-topics-card">
              <h3>Weak Topics Detected</h3>
              <p className="section-description">AI scans chapter-level mastery to highlight urgent focus areas.</p>
              {hasWeakTopics ? (
                <ul>
                  {weakTopics.map((topic) => (
                    <li key={topic.subject}>
                      <strong>{topic.subject}</strong>
                      <p>Chapters: {topic.topics.length ? topic.topics.join(', ') : 'Not provided'}</p>
                      {topic.averageScore !== null && topic.averageScore !== undefined ? (
                        <span className="score-pill">Avg {topic.averageScore}%</span>
                      ) : (
                        <span className="score-pill neutral">Avg N/A</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No weak topics logged yet. Add chapters from the data entry panel.</p>
              )}
            </div>

            <div className="card peer-card">
              <h3>Peer Comparison</h3>
              <p className="section-description">Anonymous benchmark against classmates.</p>
              <div className="peer-stat">
                <span>Your Rank</span>
                <strong>{peerComparison.rankPercentile ? `Top ${peerComparison.rankPercentile}%` : 'Not set'}</strong>
              </div>
              {hasPeerSubjects ? (
                <div className="peer-breakdown">
                  {peerSubjectEntries.map(([subject, stance]) => {
                    const label = stance === 'same' ? 'Same as peers' : `${stance} than peers`;
                    return (
                      <div key={subject} className="peer-row">
                        <span>{subject}</span>
                        <span className={`peer-pill ${stance}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">Add subject level comparisons to unlock this view.</p>
              )}
            </div>

            <div className="card study-plan-card">
              <h3>Personalized Study Plan</h3>
              {hasStudyPlanData ? (
                <div className="study-plan-grid">
                  <div>
                    <p className="label">Recommended hours this week</p>
                    <strong>{studyPlan.recommendedHours || '—'} {studyPlan.recommendedHours ? 'hrs' : ''}</strong>
                  </div>
                  <div>
                    <p className="label">Chapters to focus</p>
                    <strong>{studyPlan.chapters && studyPlan.chapters.length ? studyPlan.chapters.join(', ') : '—'}</strong>
                  </div>
                  <div>
                    <p className="label">Focus subjects</p>
                    <strong>{studyPlan.focusSubjects && studyPlan.focusSubjects.length ? studyPlan.focusSubjects.join(', ') : '—'}</strong>
                  </div>
                  <div>
                    <p className="label">Suggested videos</p>
                    <strong>
                      {Array.isArray(studyPlan.videos) && studyPlan.videos.length ? `${studyPlan.videos.length} tutorials` : '—'}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="empty-state">Add study-plan inputs above to unlock personalized guidance.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section alert-section">
            {performanceTrend.length < 3 ? (
              <div className="alert-card neutral">
                <h3>ℹ Need More Data</h3>
                <p>Add at least three weekly scores to detect downward trends.</p>
              </div>
            ) : isDeclining ? (
              <div className="alert-card danger">
                <h3>⚠ Performance Dropping</h3>
                <p>Your last 3 weekly test scores: {weeklyScoreString}</p>
                <p>
                  Action: Review the weak topics above and add
                  {studyPlan.recommendedHours
                    ? ` at least ${studyPlan.recommendedHours} focused study hours.`
                    : ' additional focused study hours.'}
                </p>
              </div>
            ) : (
              <div className="alert-card success">
                <h3>✅ Trend Stable</h3>
                <p>No decline detected in the last 3 weeks. Keep your study rhythm!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicPerformancePage
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

// Study Plan removed

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
  // Study Plan state removed
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
  // Error state for internal use only
  const [, setError] = useState(null);
  const [newStudyEntry, setNewStudyEntry] = useState({ hours: '', score: '' });

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  // Fetch academic data on component mount and when studentId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBase}/api/academic-performance/${studentId}`);
        const data = await response.json();
        
        if (response.ok) {
          // Update summary with fetched data
          setSummary(prev => ({
            ...prev,
            gpa: data.gpa || prev.gpa,
            attendanceRate: data.attendanceRate || prev.attendanceRate,
            currentGrade: data.currentGrade || prev.currentGrade,
            predictedGPA: data.predictedGPA || prev.predictedGPA,
            riskLevel: data.riskLevel || prev.riskLevel,
            projectedAttendanceDrop: data.projectedAttendanceDrop || prev.projectedAttendanceDrop,
            passProbability: data.passProbability || prev.passProbability,
            predictionConfidence: data.predictionConfidence || prev.predictionConfidence
          }));
          
          // Also update the form with the same data
          setSummaryForm(prev => ({
            ...prev,
            gpa: data.gpa || prev.gpa,
            attendanceRate: data.attendanceRate || prev.attendanceRate,
            currentGrade: data.currentGrade || prev.currentGrade,
            predictedGPA: data.predictedGPA || prev.predictedGPA,
            riskLevel: data.riskLevel || prev.riskLevel,
            projectedAttendanceDrop: data.projectedAttendanceDrop || prev.projectedAttendanceDrop,
            passProbability: data.passProbability || prev.passProbability,
            predictionConfidence: data.predictionConfidence || prev.predictionConfidence
          }));
        }
      } catch (error) {
        console.error('Error fetching academic data:', error);
        console.log('Data not available yet');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId, apiBase]);

  // Generic POST helper with authentication
  const postJson = async (url, payload) => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Important for cookies
      };
      
      console.log('Sending POST to:', url, 'with:', payload);
      
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.message || res.statusText || 'Request failed');
      }
      
      console.log('POST successful:', url, data);
      return data;
      
    } catch (error) {
      console.error('POST failed:', url, error.message);
      throw error; // Re-throw to allow handling in the calling function
    }
  };

  const parseList = (value = '') =>
    value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const handleSummaryFormChange = (field, value) => {
    setSummaryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSummarySubmit = async (event) => {
    event.preventDefault();
    try {
      // Prepare the payload with all form fields
      const payload = {
        currentGPA: parseFloat(summaryForm.gpa) || 0,
        predictedGPA: parseFloat(summaryForm.predictedGPA) || 0,
        attendancePercentage: parseFloat(summaryForm.attendanceRate) || 0,
        currentGrade: summaryForm.currentGrade || '',
        riskLevel: summaryForm.riskLevel || 'Low',
        attendanceDrop: parseFloat(summaryForm.projectedAttendanceDrop) || 0, // Fixed field name
        passProbability: parseFloat(summaryForm.passProbability) || 0,
        predictionConfidence: parseFloat(summaryForm.predictionConfidence) || 0,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Saving academic summary:', payload);
      
      // Use the postJson helper which includes authentication
      const result = await postJson(
        `${apiBase}/api/academic/summary/${studentId}`, 
        payload
      );
      
      if (result && result.success) {
        // Update local state with the saved data
        const updatedSummary = {
          gpa: result.summary.currentGPA?.toString() || '',
          predictedGPA: result.summary.predictedGPA?.toString() || '',
          attendanceRate: result.summary.attendancePercentage?.toString() || '',
          currentGrade: result.summary.currentGrade || '',
          riskLevel: result.summary.riskLevel || 'Low',
          projectedAttendanceDrop: result.summary.attendanceDrop?.toString() || '',
          passProbability: result.summary.passProbability?.toString() || '',
          predictionConfidence: result.summary.predictionConfidence?.toString() || ''
        };
        
        setSummary(updatedSummary);
        alert('Academic summary saved successfully!');
      } else {
        throw new Error(result?.message || 'Failed to save academic summary');
      }
    } catch (error) {
      console.error('Error saving academic summary:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleWeeklyEntryChange = (field, value) => {
    setWeeklyEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleWeeklyEntrySubmit = async (event) => {
    event.preventDefault();
    if (!weeklyEntry.week || weeklyEntry.score === '') return;
    const entry = { week: weeklyEntry.week, score: Number(weeklyEntry.score) };
    await postJson(`${apiBase}/api/academic/performance-trend/${studentId}`, entry);
    setPerformanceTrend(prev => [...prev, entry]);
    setWeeklyEntry({ week: '', score: '' });
  };

  const handleSubjectEntryChange = (field, value) => {
    setSubjectEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectEntrySubmit = async (event) => {
    event.preventDefault();
    if (!subjectEntry.subject || subjectEntry.score === '') return;
    const parsedScore = Number(subjectEntry.score);
    if (Number.isNaN(parsedScore)) {
      alert('Please enter a valid numeric score');
      return;
    }
    const entry = { subject: subjectEntry.subject, score: parsedScore };
    try {
      const result = await postJson(`${apiBase}/api/academic/subject-performance/${studentId}`, entry);
      if (!result || result.success !== true) {
        throw new Error(result?.message || 'Failed to add subject');
      }
      setSubjectPerformance(prev => [...prev, entry]);
      setSubjectEntry({ subject: '', score: '' });
    } catch (err) {
      console.error('Error adding subject average:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleAssessmentEntryChange = (field, value) => {
    setAssessmentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentEntrySubmit = async (event) => {
    event.preventDefault();
    if (!assessmentEntry.name || assessmentEntry.score === '') return;
    const parsedScore = Number(assessmentEntry.score);
    if (Number.isNaN(parsedScore)) {
      alert('Please enter a valid numeric score');
      return;
    }
    const entry = { name: assessmentEntry.name, score: parsedScore };
    try {
      const result = await postJson(`${apiBase}/api/academic/assessment-performance/${studentId}`, entry);
      if (!result || result.success !== true) {
        throw new Error(result?.message || 'Failed to add assessment');
      }
      setAssessmentPerformance(prev => [...prev, entry]);
      setAssessmentEntry({ name: '', score: '' });
    } catch (err) {
      console.error('Error adding assessment performance:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleWeakTopicChange = (field, value) => {
    setWeakTopicEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleWeakTopicSubmit = async (event) => {
    event.preventDefault();
    if (!weakTopicEntry.subject) return;
    const entry = {
      subject: weakTopicEntry.subject,
      topics: parseList(weakTopicEntry.topics),
      averageScore: weakTopicEntry.averageScore ? Number(weakTopicEntry.averageScore) : null,
    };
    try {
      const result = await postJson(`${apiBase}/api/academic/weak-topics/${studentId}`, entry);
      if (!result || result.success !== true) {
        throw new Error(result?.message || 'Failed to add weak topic');
      }
      // Prefer server merged record
      setWeakTopics(prev => [...prev.filter(w => w.subject !== entry.subject), { subject: entry.subject, topics: entry.topics, averageScore: entry.averageScore }]);
      setWeakTopicEntry({ subject: '', topics: '', averageScore: '' });
    } catch (err) {
      console.error('Error adding weak topic:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleAssignmentEntryChange = (field, value) => {
    setAssignmentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAssignmentEntrySubmit = async (event) => {
    event.preventDefault();
    if (!assignmentEntry.subject) return;
    const entry = {
      subject: assignmentEntry.subject,
      completed: assignmentEntry.completed ? Number(assignmentEntry.completed) : 0,
      total: assignmentEntry.total ? Number(assignmentEntry.total) : 0,
    };
    await postJson(`${apiBase}/api/academic/assignment-progress/${studentId}`, entry);
    setAssignmentProgress(prev => [...prev, entry]);
    setAssignmentEntry({ subject: '', completed: '', total: '' });
  };

  // Study Plan handlers removed

  const handlePeerRankSubmit = async (event) => {
    event.preventDefault();
    await postJson(`${apiBase}/api/academic/peer-comparison/${studentId}`, { rankPercentile: peerRankInput });
    setPeerComparison(prev => ({ ...prev, rankPercentile: peerRankInput }));
  };

  const handlePeerEntryChange = (field, value) => {
    setPeerEntry(prev => ({ ...prev, [field]: value }));
  };

  const handlePeerEntrySubmit = async (event) => {
    event.preventDefault();
    if (!peerEntry.subject) return;
    const update = { subject: peerEntry.subject, stance: peerEntry.stance };
    await postJson(`${apiBase}/api/academic/peer-comparison/${studentId}`, update);
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
        { key: 'peerComparison', url: `${apiBase}/api/academic/peer-comparison/${studentId}` },
        { key: 'assignmentProgress', url: `${apiBase}/api/academic/assignment-progress/${studentId}` },
        { key: 'studyLogs', url: `${apiBase}/api/academic/study-logs/${studentId}` },
      ];

      const responses = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const res = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${session?.token || ''}`
              },
              credentials: 'include'
            });
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
      // Study Plan fetch removed
      if (Array.isArray(data.studyLogs)) setStudyLogs(data.studyLogs);
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
      console.log('Using cached data');
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
  // Study Plan computed props removed

  const handleStudyEntryChange = (field, value) => {
    setNewStudyEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleStudyLogSubmit = async (event) => {
    event.preventDefault();
    if (!newStudyEntry.hours || !newStudyEntry.score) return;

    const hours = Number(newStudyEntry.hours);
    const score = Number(newStudyEntry.score);
    if (Number.isNaN(hours) || Number.isNaN(score)) return;

    try {
      const result = await postJson(`${apiBase}/api/academic/study-logs/${studentId}`, { hours, score, source: 'Manual Log' });
      if (!result || result.success !== true) {
        throw new Error(result?.message || 'Failed to add study log');
      }
      const entry = result.log || { hours, score, source: 'Manual Log', date: new Date().toISOString() };
      setStudyLogs(prev => [...prev, entry]);
      setNewStudyEntry({ hours: '', score: '' });
    } catch (err) {
      console.error('Error adding study log:', err);
      alert(`Error: ${err.message}`);
    }
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

        <div className="academic-performance-container" style={{ width: '100%', maxWidth: '100%', padding: 0, margin: 0 }}>
          {loading && <div className="inline-alert info">Loading data...</div>}
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

          <div className="data-entry-panel" style={{ width: '100%', padding: '20px' }}>
          
            <div className="data-entry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', alignItems: 'start' }}>
              {/* Academic Summary - Full Width */}
              <form className="data-form" onSubmit={handleSummarySubmit}>
                <h3>Academic Summary</h3>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                  <div className="form-column" style={{ display: 'grid', gap: '12px' }}>
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
                  </div>
                  <div className="form-column" style={{ display: 'grid', gap: '12px' }}>
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
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Update Summary
                  </button>
                </div>
              </form>
              
              {/* Other Forms - Two Column Layout */}
              <div className="forms-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>

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
                {performanceTrend.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ marginBottom: '6px', color: '#475569', fontWeight: 500 }}>Added Weeks</div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {performanceTrend.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <span style={{ color: '#334155' }}>{item.week}</span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {subjectPerformance.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ marginBottom: '6px', color: '#475569', fontWeight: 500 }}>Added Subjects</div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {subjectPerformance.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <span style={{ color: '#334155' }}>{item.subject}</span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {assessmentPerformance.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ marginBottom: '6px', color: '#475569', fontWeight: 500 }}>Assessments</div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {assessmentPerformance.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <span style={{ color: '#334155' }}>{item.name}</span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {weakTopics.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ marginBottom: '6px', color: '#475569', fontWeight: 500 }}>Weak Topics</div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {weakTopics.map((item, i) => (
                        <div key={i} style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#334155', fontWeight: 600 }}>{item.subject || item.topic}</span>
                            {item.averageScore !== undefined && item.averageScore !== null && (
                              <span style={{ color: '#334155' }}>{Number(item.averageScore)}%</span>
                            )}
                          </div>
                          {Array.isArray(item.topics) && item.topics.length > 0 && (
                            <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {item.topics.map((t, idx) => (
                                <span key={idx} style={{ padding: '2px 8px', background: '#e2e8f0', borderRadius: '999px', fontSize: '12px', color: '#334155' }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div> {/* End of forms-container */}

              {/* Peer Benchmark and Peer Subject Comparison removed per request */}
            </div>
          </div>

          
        </div> 
      </div>     
    </div>     
  )
}

export default AcademicPerformancePage
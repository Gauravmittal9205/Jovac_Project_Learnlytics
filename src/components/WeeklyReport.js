import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WeeklyReport.css';

// Bar Chart Component
const BarChart = ({ data, height = 200, barColor = '#4CAF50' }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bar-chart-container">
      <div className="bar-chart" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          return (
            <div key={index} className="bar-chart-group">
              <div 
                className="bar" 
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: barColor,
                  '--bar-color': barColor,
                }}
                title={`${item.label}: ${item.value}`}
              >
                <span className="bar-value">{item.value}</span>
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

const WeeklyReport = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
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
    color: item.color
  }));

  return (
    <div className="weekly-report">
      <div className="report-header">
        <h1>Weekly Analytics Dashboard</h1>
        <div className="date-range">Sep 1 - Sep 7, 2024</div>
      </div>

      <div className="dashboard-grid">
        {/* Weekly Hours */}
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
          <BarChart 
            data={timeDistributionData}
            height={200}
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
  );
};

export default WeeklyReport;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const RiskAnalysisForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    course: '',
    attendance: '',
    assignmentScores: '',
    quizScores: '',
    participation: '',
    studyHours: '',
    previousPerformance: ''
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateRiskScore = (data) => {
    // Convert string inputs to numbers
    const attendance = parseFloat(data.attendance) || 0;
    const assignments = parseFloat(data.assignmentScores) || 0;
    const quizzes = parseFloat(data.quizScores) || 0;
    const participation = parseFloat(data.participation) || 0;
    const studyHours = parseFloat(data.studyHours) || 0;
    const previousPerformance = parseFloat(data.previousPerformance) || 0;

    // Weights for each factor (sum to 1)
    const weights = {
      attendance: 0.15,
      assignments: 0.25,
      quizzes: 0.25,
      participation: 0.15,
      studyHours: 0.1,
      previousPerformance: 0.1
    };

    // Calculate weighted score (inverted for risk, so lower is better)
    const weightedScore = (
      (100 - attendance) * weights.attendance +
      (100 - assignments) * weights.assignments +
      (100 - quizzes) * weights.quizzes +
      (100 - participation) * weights.participation +
      (Math.max(0, 20 - studyHours) * 5) * weights.studyHours + // Assuming 20 hours is ideal
      (100 - previousPerformance) * weights.previousPerformance
    );

    // Convert to 0-100 scale
    const riskScore = Math.min(100, Math.max(0, weightedScore));
    
    return {
      riskScore: riskScore.toFixed(1),
      riskLevel: getRiskLevel(riskScore),
      engagementScore: calculateEngagementScore(attendance, participation, studyHours)
    };
  };

  const calculateEngagementScore = (attendance, participation, studyHours) => {
    // Normalize study hours (assuming 20+ hours is max for 100%)
    const normalizedStudyHours = Math.min(100, (studyHours / 20) * 100);
    
    // Calculate engagement score (weighted average)
    const engagementScore = (
      attendance * 0.4 + 
      participation * 0.4 + 
      normalizedStudyHours * 0.2
    );
    
    return {
      score: engagementScore.toFixed(1),
      level: getEngagementLevel(engagementScore)
    };
  };

  const getRiskLevel = (score) => {
    if (score < 25) return { text: 'Low', color: '#4CAF50' };
    if (score < 50) return { text: 'Moderate', color: '#FFC107' };
    if (score < 75) return { text: 'High', color: '#FF9800' };
    return { text: 'Critical', color: '#F44336' };
  };

  const getEngagementLevel = (score) => {
    if (score >= 85) return { text: 'Excellent', color: '#4CAF50' };
    if (score >= 70) return { text: 'Good', color: '#8BC34A' };
    if (score >= 50) return { text: 'Average', color: '#FFC107' };
    if (score >= 30) return { text: 'Below Average', color: '#FF9800' };
    return { text: 'Poor', color: '#F44336' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = calculateRiskScore(formData);
    setAnalysisResult(result);
    setShowForm(false);
  };

  const handleReset = () => {
    setShowForm(true);
    setAnalysisResult(null);
  };

  // Sample data for charts
  const riskFactorsData = [
    { name: 'Attendance', value: parseFloat(formData.attendance) || 0 },
    { name: 'Assignments', value: parseFloat(formData.assignmentScores) || 0 },
    { name: 'Quizzes', value: parseFloat(formData.quizScores) || 0 },
    { name: 'Participation', value: parseFloat(formData.participation) || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const radarData = [
    { subject: 'Attendance', A: parseFloat(formData.attendance) || 0, fullMark: 100 },
    { subject: 'Assignments', A: parseFloat(formData.assignmentScores) || 0, fullMark: 100 },
    { subject: 'Quizzes', A: parseFloat(formData.quizScores) || 0, fullMark: 100 },
    { subject: 'Participation', A: parseFloat(formData.participation) || 0, fullMark: 100 },
    { subject: 'Study Hours', A: (parseFloat(formData.studyHours) || 0) * 5, fullMark: 100 },
  ];

  return (
    <div className="risk-analysis-container">
      <h2>Student Risk Analysis Form</h2>
      
      {showForm ? (
        <form onSubmit={handleSubmit} className="risk-form">
          <div className="form-group">
            <label>Student Name</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">Select a course</option>
              <option value="mathematics">Mathematics</option>
              <option value="programming">Programming</option>
              <option value="database">Database</option>
              <option value="algorithms">Algorithms</option>
              <option value="networking">Networking</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Attendance (%)</label>
              <input
                type="number"
                name="attendance"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Average Assignment Score (%)</label>
              <input
                type="number"
                name="assignmentScores"
                min="0"
                max="100"
                value={formData.assignmentScores}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Average Quiz Score (%)</label>
              <input
                type="number"
                name="quizScores"
                min="0"
                max="100"
                value={formData.quizScores}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Class Participation (%)</label>
              <input
                type="number"
                name="participation"
                min="0"
                max="100"
                value={formData.participation}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Weekly Study Hours</label>
              <input
                type="number"
                name="studyHours"
                min="0"
                step="0.5"
                value={formData.studyHours}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Previous Term Performance (%)</label>
              <input
                type="number"
                name="previousPerformance"
                min="0"
                max="100"
                value={formData.previousPerformance}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">Analyze Risk</button>
          </div>
        </form>
      ) : (
        <div className="analysis-results">
          <div className="results-header">
            <h3>Risk Analysis Results for {formData.studentName}</h3>
            <p>Course: {formData.course.charAt(0).toUpperCase() + formData.course.slice(1)} | ID: {formData.studentId}</p>
          </div>
          
          <div className="score-cards">
            <div className="score-card" style={{ borderColor: analysisResult.riskLevel.color }}>
              <h4>Risk Score</h4>
              <div className="score-value" style={{ color: analysisResult.riskLevel.color }}>
                {analysisResult.riskScore}
              </div>
              <div className="score-level" style={{ backgroundColor: analysisResult.riskLevel.color + '20' }}>
                {analysisResult.riskLevel.text} Risk
              </div>
              <p>Lower is better (0-100 scale)</p>
            </div>
            
            <div className="score-card" style={{ borderColor: analysisResult.engagementScore.level.color }}>
              <h4>Engagement Score</h4>
              <div className="score-value" style={{ color: analysisResult.engagementScore.level.color }}>
                {analysisResult.engagementScore.score}
              </div>
              <div className="score-level" style={{ backgroundColor: analysisResult.engagementScore.level.color + '20' }}>
                {analysisResult.engagementScore.level.text}
              </div>
              <p>Higher is better (0-100 scale)</p>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart">
              <h4>Risk Factors Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskFactorsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {riskFactorsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart">
              <h4>Performance Radar Chart</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Scores"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart">
              <h4>Risk Level Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Risk Score', value: parseFloat(analysisResult.riskScore) },
                      { name: 'Remaining', value: 100 - parseFloat(analysisResult.riskScore) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill={analysisResult.riskLevel.color} />
                    <Cell fill="#e0e0e0" />
                    <Tooltip formatter={(value) => [`${value}%`, value === parseFloat(analysisResult.riskScore) ? 'Risk Score' : 'Remaining']} />
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: 'bold', fill: analysisResult.riskLevel.color }}>
                    {analysisResult.riskScore}%
                  </text>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '14px', fill: '#666' }}>
                    {analysisResult.riskLevel.text} Risk
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="recommendations">
            <h4>Recommendations</h4>
            {parseFloat(analysisResult.riskScore) < 25 ? (
              <div className="recommendation positive">
                <p>🎉 <strong>Excellent performance!</strong> Your risk level is low. Keep up the good work and consider helping peers who might be struggling.</p>
              </div>
            ) : parseFloat(analysisResult.riskScore) < 50 ? (
              <div className="recommendation moderate">
                <p>👍 <strong>Good performance</strong>, but there's room for improvement. Focus on areas with lower scores to reduce your risk further.</p>
                {parseFloat(formData.attendance) < 85 && <p>• Try to improve attendance to above 90%</p>}
                {parseFloat(formData.quizScores) < 70 && <p>• Spend more time reviewing quiz materials and practice questions</p>}
              </div>
            ) : parseFloat(analysisResult.riskScore) < 75 ? (
              <div className="recommendation high">
                <p>⚠️ <strong>Moderate to High Risk</strong> - Action is recommended to improve your academic standing.</p>
                <ul>
                  <li>Attend all classes and participate actively</li>
                  <li>Schedule regular study sessions (aim for at least 15-20 hours per week)</li>
                  <li>Meet with your instructor during office hours</li>
                  <li>Form or join a study group</li>
                  <li>Utilize tutoring services if available</li>
                </ul>
              </div>
            ) : (
              <div className="recommendation critical">
                <p>🚨 <strong>Critical Risk Level</strong> - Immediate action is required to avoid academic probation or failure.</p>
                <ul>
                  <li>Schedule an urgent meeting with your academic advisor</li>
                  <li>Develop a detailed study plan with your instructor</li>
                  <li>Consider reducing other commitments to focus on academics</li>
                  <li>Attend all classes and submit all assignments, even if late</li>
                  <li>Seek help from tutoring services and academic support centers</li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button onClick={handleReset} className="btn-reset">Analyze Another Student</button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .risk-analysis-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        h2, h3, h4 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .risk-form {
          background: #fff;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
          margin-bottom: 20px;
          flex: 1;
          min-width: 200px;
        }
        
        .form-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }
        
        input, select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
        
        .form-actions {
          margin-top: 30px;
          text-align: center;
        }
        
        .btn-submit, .btn-reset {
          background-color: #4a90e2;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .btn-submit:hover {
          background-color: #357abd;
        }
        
        .btn-reset {
          background-color: #6c757d;
        }
        
        .btn-reset:hover {
          background-color: #5a6268;
        }
        
        /* Results Styling */
        .analysis-results {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .results-header {
          background: #f8f9fa;
          padding: 20px 25px;
          border-bottom: 1px solid #eee;
        }
        
        .score-cards {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 25px;
          flex-wrap: wrap;
        }
        
        .score-card {
          flex: 1;
          min-width: 250px;
          max-width: 300px;
          background: white;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-top: 5px solid #4a90e2;
        }
        
        .score-card h4 {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 18px;
        }
        
        .score-value {
          font-size: 48px;
          font-weight: 700;
          margin: 10px 0;
        }
        
        .score-level {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 600;
          margin: 10px 0;
          font-size: 14px;
        }
        
        .score-card p {
          margin: 10px 0 0;
          color: #777;
          font-size: 14px;
        }
        
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          padding: 0 25px 25px;
        }
        
        .chart {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .chart h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #444;
          font-size: 16px;
          text-align: center;
        }
        
        .recommendations {
          padding: 20px 25px;
          background: #f9f9f9;
          border-top: 1px solid #eee;
        }
        
        .recommendations h4 {
          margin-top: 0;
          color: #444;
          font-size: 18px;
        }
        
        .recommendation {
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          line-height: 1.6;
        }
        
        .recommendation.positive {
          background-color: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
        
        .recommendation.moderate {
          background-color: #fff8e1;
          border-left: 4px solid #ffc107;
        }
        
        .recommendation.high {
          background-color: #fff3e0;
          border-left: 4px solid #ff9800;
        }
        
        .recommendation.critical {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
        }
        
        .recommendation ul {
          margin: 10px 0 0 20px;
          padding: 0;
        }
        
        .recommendation li {
          margin-bottom: 8px;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          .score-cards {
            flex-direction: column;
            align-items: center;
          }
          
          .score-card {
            width: 100%;
            max-width: 100%;
          }
          
          .charts-container {
            grid-template-columns: 1fr;
            padding: 0 15px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default RiskAnalysisForm;

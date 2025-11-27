import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { FaSearch, FaFilter, FaBook, FaLaptopCode, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';

const SESSION_KEY = 'learnlytics_session';
const API_URL = 'http://localhost:5000/api/auth';

// Sample course data - in a real app, this would come from your backend
const COURSES = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
];

// Helper function to get PDF path
const getPdfPath = (course, resourceId) => {
  // In a real app, this would be dynamically generated based on your PDF naming convention
  const pdfMap = {
    // Computer Science
    'Computer Science_1': 'computer_science_learning_path.pdf',
    'Computer Science_2': 'computer_science_flashcards.pdf',
    'Computer Science_3': 'computer_science_concepts.pdf',
    'Computer Science_13': 'computer_science_mock_exam.pdf',
    'Computer Science_16': 'computer_science_previous_questions.pdf',
    'Computer Science_25': 'computer_science_career_paths.pdf',
    
    // Information Technology
    'Information Technology_1': 'it_learning_path.pdf',
    'Information Technology_2': 'it_flashcards.pdf',
    'Information Technology_3': 'it_concepts.pdf',
    'Information Technology_13': 'it_mock_exam.pdf',
    'Information Technology_16': 'it_previous_questions.pdf',
    'Information Technology_25': 'it_career_paths.pdf',
    
    // Default fallbacks
    'default_1': 'default_learning_path.pdf',
    'default_2': 'default_flashcards.pdf',
    'default_3': 'default_concepts.pdf',
    'default_13': 'default_mock_exam.pdf',
    'default_14': 'default_chapter_tests.pdf',
    'default_16': 'default_previous_questions.pdf',
    'default_25': 'default_career_paths.pdf',
  };
  
  const key = `${course.replace(/\s+/g, '')}_${resourceId}`;
  return pdfMap[key] || pdfMap[`default_${resourceId}`] || 'sample_resource.pdf';
};

// Enhanced resources data with course-specific content
const getResourcesData = (course) => ({
  'Learning Tools': {
    'AI Study Assistant': [
      { 
        id: 1, 
        title: `Personalized ${course} Learning Path`, 
        description: `AI-powered study recommendations tailored for ${course} students`,
        courses: ['Computer Science', 'Information Technology', 'Electronics'],
        type: 'pdf',
        pdfName: getPdfPath(course, 1)
      },
      { 
        id: 2, 
        title: 'Smart Flashcards', 
        description: `Generate flashcards from your ${course} course materials`,
        courses: ['Computer Science', 'Information Technology', 'Electronics', 'Electrical Engineering'],
        type: 'pdf',
        pdfName: getPdfPath(course, 2)
      },
      { 
        id: 3, 
        title: 'Concept Mapper', 
        description: `Visual learning connections for ${course} concepts`,
        courses: ['Computer Science', 'Information Technology'],
        type: 'pdf',
        pdfName: getPdfPath(course, 3)
      },
    ],
    'Progress Trackers': [
      { 
        id: 4, 
        title: `${course} Study Analytics`, 
        url: '#', 
        description: 'Track your learning progress with detailed insights',
        courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering']
      },
      { 
        id: 5, 
        title: 'Goal Setting Tools', 
        url: '#', 
        description: 'Set and monitor academic goals',
        courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering']
      },
    ],
  },
  'Assessment Resources': {
    'Mock Tests': [
      { 
        id: 13, 
        title: `${course} Mock Exam`, 
        description: 'Full-length practice tests with timer',
        courses: ['Computer Science', 'Information Technology', 'Electronics'],
        type: 'pdf',
        pdfName: getPdfPath(course, 13)
      },
      { 
        id: 14, 
        title: 'Chapter-wise Tests', 
        description: 'Topic-specific practice tests',
        courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering'],
        type: 'pdf',
        pdfName: getPdfPath(course, 14)
      },
    ],
    'Question Banks': [
      { 
        id: 16, 
        title: `${course} Previous Year Questions`, 
        description: 'Collection of past exam questions',
        courses: ['Computer Science', 'Information Technology', 'Electronics', 'Civil Engineering', 'Electrical Engineering'],
        type: 'pdf',
        pdfName: getPdfPath(course, 16)
      },
    ],
  },
  'Support Materials': {
    'Career Guidance': [
      { 
        id: 25, 
        title: `${course} Career Paths`, 
        description: 'Explore career opportunities in your field',
        courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
        type: 'pdf',
        pdfName: getPdfPath(course, 25)
      },
    ],
  },
});

// Icons for different resource categories
const categoryIcons = {
  'Learning Tools': <FaLaptopCode className="category-icon" />,
  'Assessment Resources': <FaBook className="category-icon" />,
  'Support Materials': <FaChalkboardTeacher className="category-icon" />,
};

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

function ResourcesPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Learning Tools');
  const [activeSubject, setActiveSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Get resources data based on selected course
  const resourcesData = useMemo(() => 
    getResourcesData(selectedCourse || 'General'), 
    [selectedCourse]
  );

  // Set the first subject as active when a new tab is selected
  useEffect(() => {
    if (resourcesData[activeTab]) {
      const firstSubject = Object.keys(resourcesData[activeTab])[0];
      setActiveSubject(firstSubject);
    }
  }, [activeTab, resourcesData]);

  // Handle course selection
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setShowCourseDropdown(false);
  };

  // Handle resource click to open PDF
  const handleResourceClick = (resource) => {
    if (resource.type === 'pdf' && resource.pdfName) {
      const pdfUrl = `${process.env.PUBLIC_URL || ''}/resources/${resource.pdfName}`;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } else if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter resources based on search query and selected course
  const filteredResources = useMemo(() => {
    if (!activeSubject || !resourcesData[activeTab]?.[activeSubject]) return [];
    
    let resources = resourcesData[activeTab][activeSubject];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      resources = resources.filter(resource => 
        resource.title.toLowerCase().includes(query) || 
        resource.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by selected course if any
    if (selectedCourse) {
      resources = resources.filter(resource => 
        !resource.courses || resource.courses.includes(selectedCourse)
      );
    }
    
    return resources;
  }, [activeTab, activeSubject, resourcesData, searchQuery, selectedCourse]);

  // Check authentication
  useEffect(() => {
    if (!session) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate, session]);

  const currentSubjects = resourcesData[activeTab] || {};

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Retained from original code */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
            <Link to="/Studentresources" className="nav-item active">
              <span className="nav-text">Resources</span>
            </Link>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => { clearSession(); navigate('/'); }}>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Resources</h1>
          </div>
        </div>
        <div className="dashboard-container">
          <div className="dashboard-section">
            {/* Course Selection and Search */}
            <div className="resource-controls">
              <div className="course-selector">
                <button 
                  className="course-dropdown-toggle"
                  onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                >
                  <FaGraduationCap className="icon" />
                  {selectedCourse || 'Select Course'}
                  <span className={`dropdown-arrow ${showCourseDropdown ? 'up' : 'down'}`}>▼</span>
                </button>
                {showCourseDropdown && (
                  <div className="course-dropdown">
                    {COURSES.map(course => (
                      <div 
                        key={course} 
                        className={`course-option ${selectedCourse === course ? 'selected' : ''}`}
                        onClick={() => handleCourseSelect(course)}
                      >
                        {course}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="resource-search"
                />
              </div>
            </div>

            {/* Main Tabs */}
            <div className="tabs-header">
              {Object.keys(resourcesData).map(tabName => (
                <button
                  key={tabName}
                  className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
                  onClick={() => setActiveTab(tabName)}
                >
                  {categoryIcons[tabName] || <FaBook className="category-icon" />}
                  {tabName}
                </button>
              ))}
            </div>

            {/* Subject Sub-tabs */}
            <div className="subject-tabs">
              {Object.keys(currentSubjects).map(subjectName => (
                <button
                  key={subjectName}
                  className={`subject-tab ${activeSubject === subjectName ? 'active' : ''}`}
                  onClick={() => setActiveSubject(subjectName)}
                >
                  {subjectName}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="resources-content">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your personalized resources...</p>
                </div>
              ) : !selectedCourse ? (
                <div className="no-course-selected">
                  <FaGraduationCap size={48} className="empty-icon" />
                  <h3>Select a course to view resources</h3>
                  <p>Choose a course from the dropdown above to see relevant learning materials and resources.</p>
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="resources-grid">
                  {filteredResources.map(resource => (
                    <div key={resource.id} className="resource-card">
                      <div className="resource-header">
                        <h3>{resource.title}</h3>
                        <span className="resource-badge">{selectedCourse}</span>
                      </div>
                      {resource.description && (
                        <p className="resource-description">{resource.description}</p>
                      )}
                      <div className="resource-footer">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleResourceClick(resource);
                          }}
                          className="resource-button"
                        >
                          Open PDF
                        </button>
                        <div className="resource-meta">
                          {resource.courses?.length > 0 && (
                            <span className="meta-item">
                              <FaBook className="meta-icon" />
                              {resource.courses.length} courses
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <FaSearch size={48} className="empty-icon" />
                  <h3>No resources found</h3>
                  <p>Try adjusting your search or select a different course.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Add some custom styles for the resource page
const styles = `
  .resource-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .course-selector {
    position: relative;
    min-width: 200px;
  }

  .course-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.6rem 1rem;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    width: 100%;
    text-align: left;
    transition: all 0.2s;
  }

  .course-dropdown-toggle:hover {
    border-color: #cbd5e0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .course-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-top: 4px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
  }

  .course-option {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .course-option:hover {
    background: #f7fafc;
  }

  .course-option.selected {
    background: #ebf8ff;
    color: #3182ce;
    font-weight: 500;
  }

  .search-container {
    position: relative;
    flex: 1;
    max-width: 400px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
  }

  .resource-search {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  .resource-search:focus {
    outline: none;
    border-color: #63b3ed;
    box-shadow: 0 0 0 1px #63b3ed;
  }

  .resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .resource-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .resource-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
  }

  .resource-header {
    padding: 1.25rem 1.25rem 0.75rem;
    border-bottom: 1px solid #edf2f7;
  }

  .resource-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .resource-badge {
    display: inline-block;
    background: #ebf8ff;
    color: #3182ce;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    margin-top: 0.5rem;
  }

  .resource-description {
    padding: 1rem 1.25rem;
    color: #4a5568;
    font-size: 0.95rem;
    line-height: 1.5;
    flex-grow: 1;
    margin: 0;
  }

  .resource-footer {
    padding: 0.75rem 1.25rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #edf2f7;
    margin-top: auto;
  }

  .resource-button {
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s;
  }

  .resource-button:hover {
    background: #3182ce;
  }

  .resource-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #718096;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .meta-icon {
    font-size: 0.7rem;
  }

  .category-icon {
    margin-right: 8px;
    font-size: 1rem;
    color: #4a5568;
  }

  .no-course-selected,
  .no-results,
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .empty-icon {
    color: #cbd5e0;
    margin-bottom: 1rem;
  }

  .no-course-selected h3,
  .no-results h3 {
    color: #2d3748;
    margin: 0.5rem 0 0.25rem;
  }

  .no-course-selected p,
  .no-results p {
    color: #718096;
    margin: 0;
    max-width: 400px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0,0,0,0.1);
    border-left-color: #4299e1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default ResourcesPage;
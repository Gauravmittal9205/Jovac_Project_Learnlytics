import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileNew.css';

function ProfileNew() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get session data
  const getSession = () => {
    try {
      const session = localStorage.getItem('learnlytics_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  };

  const session = getSession();

  const [profileData, setProfileData] = useState({
    personal: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: '',
      bio: ''
    },
    academic: {
      program: 'Computer Science',
      year: '3rd Year',
      semester: 'Fall 2024',
      studentId: '',
      gpa: '',
      creditsCompleted: '',
      expectedGraduation: ''
    },
    contact: {
      email: session?.email || '',
      alternateEmail: '',
      phone: '',
      emergencyContact: '',
      emergencyName: '',
      emergencyRelation: ''
    },
    preferences: {
      emailNotifications: true,
      smsAlerts: false,
      pushNotifications: true,
      language: 'English',
      timezone: 'UTC+5:30'
    }
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [session, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${session.id}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileData(prev => ({
            ...prev,
            ...data.profile
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${session.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile: profileData })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="profile-section-content">
      <div className="profile-form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profileData.personal.fullName || session?.name || ''}
            onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            value={profileData.personal.dateOfBirth}
            onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select
            value={profileData.personal.gender}
            onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={profileData.personal.phone}
            onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
            disabled={!isEditing}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <textarea
            value={profileData.personal.address}
            onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your address"
            rows="3"
          />
        </div>
        <div className="form-group full-width">
          <label>Bio</label>
          <textarea
            value={profileData.personal.bio}
            onChange={(e) => handleInputChange('personal', 'bio', e.target.value)}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="profile-section-content">
      <div className="profile-form-grid">
        <div className="form-group">
          <label>Program</label>
          <input
            type="text"
            value={profileData.academic.program}
            onChange={(e) => handleInputChange('academic', 'program', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Student ID</label>
          <input
            type="text"
            value={profileData.academic.studentId}
            onChange={(e) => handleInputChange('academic', 'studentId', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter student ID"
          />
        </div>
        <div className="form-group">
          <label>Year</label>
          <select
            value={profileData.academic.year}
            onChange={(e) => handleInputChange('academic', 'year', e.target.value)}
            disabled={!isEditing}
          >
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        <div className="form-group">
          <label>Semester</label>
          <input
            type="text"
            value={profileData.academic.semester}
            onChange={(e) => handleInputChange('academic', 'semester', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>GPA</label>
          <input
            type="text"
            value={profileData.academic.gpa}
            onChange={(e) => handleInputChange('academic', 'gpa', e.target.value)}
            disabled={!isEditing}
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label>Credits Completed</label>
          <input
            type="number"
            value={profileData.academic.creditsCompleted}
            onChange={(e) => handleInputChange('academic', 'creditsCompleted', e.target.value)}
            disabled={!isEditing}
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label>Expected Graduation</label>
          <input
            type="month"
            value={profileData.academic.expectedGraduation}
            onChange={(e) => handleInputChange('academic', 'expectedGraduation', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="profile-section-content">
      <div className="profile-form-grid">
        <div className="form-group">
          <label>Primary Email</label>
          <input
            type="email"
            value={profileData.contact.email}
            disabled
            className="disabled-input"
          />
        </div>
        <div className="form-group">
          <label>Alternate Email</label>
          <input
            type="email"
            value={profileData.contact.alternateEmail}
            onChange={(e) => handleInputChange('contact', 'alternateEmail', e.target.value)}
            disabled={!isEditing}
            placeholder="alternate@email.com"
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={profileData.contact.phone}
            onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
            disabled={!isEditing}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input
            type="text"
            value={profileData.contact.emergencyName}
            onChange={(e) => handleInputChange('contact', 'emergencyName', e.target.value)}
            disabled={!isEditing}
            placeholder="Contact person name"
          />
        </div>
        <div className="form-group">
          <label>Emergency Contact Number</label>
          <input
            type="tel"
            value={profileData.contact.emergencyContact}
            onChange={(e) => handleInputChange('contact', 'emergencyContact', e.target.value)}
            disabled={!isEditing}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div className="form-group">
          <label>Relation</label>
          <input
            type="text"
            value={profileData.contact.emergencyRelation}
            onChange={(e) => handleInputChange('contact', 'emergencyRelation', e.target.value)}
            disabled={!isEditing}
            placeholder="e.g., Parent, Guardian"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="profile-section-content">
      <div className="preferences-grid">
        <div className="preference-card">
          <div className="preference-header">
            <h3>Notifications</h3>
            <p>Manage how you receive updates</p>
          </div>
          <div className="preference-options">
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Email Notifications</span>
                <span className="preference-desc">Receive updates via email</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={profileData.preferences.emailNotifications}
                  onChange={(e) => handleInputChange('preferences', 'emailNotifications', e.target.checked)}
                  disabled={!isEditing}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">SMS Alerts</span>
                <span className="preference-desc">Get important alerts via SMS</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={profileData.preferences.smsAlerts}
                  onChange={(e) => handleInputChange('preferences', 'smsAlerts', e.target.checked)}
                  disabled={!isEditing}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Push Notifications</span>
                <span className="preference-desc">Browser push notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={profileData.preferences.pushNotifications}
                  onChange={(e) => handleInputChange('preferences', 'pushNotifications', e.target.checked)}
                  disabled={!isEditing}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="preference-card">
          <div className="preference-header">
            <h3>Regional Settings</h3>
            <p>Language and timezone preferences</p>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select
              value={profileData.preferences.language}
              onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
              disabled={!isEditing}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select
              value={profileData.preferences.timezone}
              onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
              disabled={!isEditing}
            >
              <option value="UTC+5:30">IST (UTC+5:30)</option>
              <option value="UTC+0">GMT (UTC+0)</option>
              <option value="UTC-5">EST (UTC-5)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {(profileData.personal.fullName || session?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h1>{profileData.personal.fullName || session?.name || 'User'}</h1>
              <p className="profile-email">{session?.email}</p>
              <div className="profile-badges">
                <span className="badge badge-role">{session?.role || 'Student'}</span>
                <span className="badge badge-status">Active</span>
              </div>
            </div>
          </div>
          <div className="profile-header-actions">
            {!isEditing ? (
              <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                <span>✏️</span> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button className="btn-cancel-profile" onClick={() => setIsEditing(false)}>
                  ✖️ Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content-wrapper">
        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Personal Info</span>
          </button>
          <button
            className={`profile-tab ${activeTab === 'academic' ? 'active' : ''}`}
            onClick={() => setActiveTab('academic')}
          >
            <span className="tab-icon">🎓</span>
            <span className="tab-label">Academic</span>
          </button>
          <button
            className={`profile-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <span className="tab-icon">📞</span>
            <span className="tab-label">Contact</span>
          </button>
          <button
            className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span className="tab-icon">⚙️</span>
            <span className="tab-label">Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'academic' && renderAcademicInfo()}
          {activeTab === 'contact' && renderContactInfo()}
          {activeTab === 'preferences' && renderPreferences()}
        </div>
      </div>
    </div>
  );
}

export default ProfileNew;

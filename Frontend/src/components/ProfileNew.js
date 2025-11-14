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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

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
  
  // Get user ID from session (support both id and _id)
  const getUserId = () => {
    if (!session) return null;
    return session.id || session._id || null;
  };

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
    if (!session || !session.token) {
      console.error('No session or token found');
      setMessage({ type: 'error', text: 'Please login to view your profile' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    const userId = getUserId();
    if (!userId) {
      console.error('User ID not found in session');
      setMessage({ type: 'error', text: 'Invalid session. Please login again.' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    const userId = getUserId();
    if (!userId || !session?.token) {
      console.error('Cannot fetch profile - missing userId or token:', { userId, hasToken: !!session?.token });
      setLoading(false);
      return;
    }

    try {
      console.log('=== FETCHING PROFILE ===');
      console.log('User ID:', userId);
      console.log('Session data:', { id: session.id, _id: session._id, email: session.email, hasToken: !!session.token });
      console.log('Token (first 20 chars):', session.token ? session.token.substring(0, 20) + '...' : 'N/A');
      
      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        if (data.profile) {
          setProfileData(prev => ({
            ...prev,
            ...data.profile
          }));
          // Set profile picture if exists
          if (data.profile.picture) {
            setProfilePicture(data.profile.picture);
          }
        } else {
          console.warn('Profile data structure unexpected:', data);
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Profile fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        setMessage({ type: 'error', text: errorData.message || `Failed to load profile (${response.status})` });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to fetch profile: ${error.message}. Please check if backend server is running on port 5000.` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');
    // Only allow 10 digits
    if (digitsOnly.length > 10) return false;
    return digitsOnly;
  };

  const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateGPA = (gpa) => {
    if (!gpa) return true; // Optional field
    const num = parseFloat(gpa);
    return !isNaN(num) && num >= 0 && num <= 10;
  };

  const validateName = (name) => {
    if (!name) return true; // Optional field
    // Only letters, spaces, and common name characters
    return /^[a-zA-Z\s.'-]+$/.test(name);
  };

  const validateStudentId = (id) => {
    if (!id) return true; // Optional field
    // Alphanumeric, 5-20 characters
    return /^[A-Za-z0-9]{5,20}$/.test(id);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const userId = getUserId();
    if (!userId || !session?.token) {
      setMessage({ type: 'error', text: 'Invalid session. Please login again.' });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`http://localhost:5000/api/profile/${userId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Photo uploaded successfully:', data);
        setProfilePicture(data.picture);
        setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Photo upload failed:', errorData);
        setMessage({ type: 'error', text: errorData.message || 'Failed to upload photo' });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ type: 'error', text: `Failed to upload photo: ${error.message}` });
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleInputChange = (section, field, value) => {
    let validatedValue = value;
    let isValid = true;
    let errorMessage = '';

    // Apply validation based on field type
    if (field === 'phone' || field === 'emergencyContact') {
      // Phone number validation - only allow digits, max 10
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) {
        // Don't allow more than 10 digits, but don't show error while typing
        validatedValue = digitsOnly.substring(0, 10);
      } else {
        validatedValue = digitsOnly;
      }
      // Only show error if user has entered something and it's not 10 digits
      if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
        // Don't block input, just allow typing
        // Error will be shown in the UI below the field
      }
    } else if (field === 'alternateEmail') {
      // Email validation
      if (value && !validateEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    } else if (field === 'gpa') {
      // GPA validation (0-10)
      if (value && !validateGPA(value)) {
        isValid = false;
        errorMessage = 'GPA must be between 0 and 10';
      }
    } else if (field === 'fullName' || field === 'emergencyName') {
      // Name validation
      if (value && !validateName(value)) {
        isValid = false;
        errorMessage = 'Name can only contain letters, spaces, and common characters';
      }
    } else if (field === 'studentId') {
      // Student ID validation
      if (value && !validateStudentId(value)) {
        isValid = false;
        errorMessage = 'Student ID must be 5-20 alphanumeric characters';
      }
    } else if (field === 'creditsCompleted') {
      // Credits validation - only numbers
      if (value && !/^\d+$/.test(value)) {
        isValid = false;
        errorMessage = 'Credits must be a number';
      }
    }

    // If validation fails, show error message
    if (!isValid && errorMessage) {
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return; // Don't update the value
    }

    // Clear error message if validation passes
    if (isValid && message.type === 'error') {
      setMessage({ type: '', text: '' });
    }

    // Update the value
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: validatedValue
      }
    }));
  };

  const validateBeforeSave = () => {
    const errors = [];

    // Validate phone numbers (must be exactly 10 digits)
    if (profileData.personal.phone) {
      const phoneDigits = profileData.personal.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.push('Personal phone number must be exactly 10 digits');
      }
    }

    if (profileData.contact.phone) {
      const phoneDigits = profileData.contact.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.push('Contact phone number must be exactly 10 digits');
      }
    }

    if (profileData.contact.emergencyContact) {
      const phoneDigits = profileData.contact.emergencyContact.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.push('Emergency contact number must be exactly 10 digits');
      }
    }

    // Validate email
    if (profileData.contact.alternateEmail && !validateEmail(profileData.contact.alternateEmail)) {
      errors.push('Please enter a valid alternate email address');
    }

    // Validate GPA
    if (profileData.academic.gpa && !validateGPA(profileData.academic.gpa)) {
      errors.push('GPA must be between 0 and 10');
    }

    // Validate Student ID
    if (profileData.academic.studentId && !validateStudentId(profileData.academic.studentId)) {
      errors.push('Student ID must be 5-20 alphanumeric characters');
    }

    // Validate names
    if (profileData.personal.fullName && !validateName(profileData.personal.fullName)) {
      errors.push('Full name can only contain letters, spaces, and common characters');
    }

    if (profileData.contact.emergencyName && !validateName(profileData.contact.emergencyName)) {
      errors.push('Emergency contact name can only contain letters, spaces, and common characters');
    }

    // Validate credits
    if (profileData.academic.creditsCompleted && !/^\d+$/.test(profileData.academic.creditsCompleted)) {
      errors.push('Credits completed must be a number');
    }

    return errors;
  };

  const handleSave = async () => {
    const userId = getUserId();
    if (!userId || !session?.token) {
      setMessage({ type: 'error', text: 'Invalid session. Please login again.' });
      return;
    }

    // Validate before saving
    const validationErrors = validateBeforeSave();
    if (validationErrors.length > 0) {
      setMessage({ type: 'error', text: validationErrors[0] });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Saving profile for user:', userId);
      console.log('Profile data to save:', profileData);
      
      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile: profileData })
      });

      console.log('Save response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Profile saved successfully:', data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Profile save failed:', errorData);
        setMessage({ 
          type: 'error', 
          text: errorData.message || 'Failed to update profile. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to update profile: ${error.message}. Please check if backend server is running on port 5000.` 
      });
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
          <label>Phone Number <span style={{color: 'red'}}>*</span></label>
          <input
            type="tel"
            value={profileData.personal.phone}
            onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
            disabled={!isEditing}
            placeholder="10 digits (e.g., 9876543210)"
            maxLength="10"
          />
          {profileData.personal.phone && profileData.personal.phone.replace(/\D/g, '').length !== 10 && (
            <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
              Phone number must be exactly 10 digits
            </small>
          )}
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
            placeholder="5-20 alphanumeric characters"
            minLength="5"
            maxLength="20"
          />
          {profileData.academic.studentId && !validateStudentId(profileData.academic.studentId) && (
            <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
              Student ID must be 5-20 alphanumeric characters
            </small>
          )}
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
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={profileData.academic.gpa}
            onChange={(e) => handleInputChange('academic', 'gpa', e.target.value)}
            disabled={!isEditing}
            placeholder="0.00 - 10.00"
          />
          {profileData.academic.gpa && (!validateGPA(profileData.academic.gpa)) && (
            <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
              GPA must be between 0 and 10
            </small>
          )}
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
          {profileData.contact.alternateEmail && !validateEmail(profileData.contact.alternateEmail) && (
            <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
              Please enter a valid email address
            </small>
          )}
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={profileData.contact.phone}
            onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
            disabled={!isEditing}
            placeholder="10 digits (e.g., 9876543210)"
            maxLength="10"
          />
          {profileData.contact.phone && profileData.contact.phone.replace(/\D/g, '').length !== 10 && (
            <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
              Phone number must be exactly 10 digits
            </small>
          )}
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
            placeholder="10 digits (e.g., 9876543210)"
            maxLength="10"
          />
          {profileData.contact.emergencyContact && profileData.contact.emergencyContact.replace(/\D/g, '').length !== 10 && (
            <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
              Emergency contact number must be exactly 10 digits
            </small>
          )}
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
            <div className="profile-avatar-large" style={{ position: 'relative' }}>
              {profilePicture ? (
                <img 
                  src={`http://localhost:5000${profilePicture}`} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                display: profilePicture ? 'none' : 'flex',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                color: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 'bold'
              }}>
                {(profileData.personal.fullName || session?.name || 'U').charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <label 
                  htmlFor="photo-upload" 
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  title="Upload Photo"
                >
                  📷
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingPhoto}
                  />
                </label>
              )}
              {uploadingPhoto && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  fontSize: '0.9rem'
                }}>
                  Uploading...
                </div>
              )}
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

import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
function WebinarRegistrationModal({ webinar, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    role: 'instructor',
    questions: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fullName: '',
      email: '',
      institution: '',
      role: 'instructor',
      questions: ''
    });
  };

  if (!isOpen || !webinar) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content webinar-registration" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Register for Webinar</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="webinar-summary">
            <h4>{webinar.title}</h4>
            <p className="webinar-details">
              <span className="webinar-date">{webinar.date} • {webinar.time}</span>
              <span className="webinar-speaker">with {webinar.speaker}</span>
            </p>
          </div>
          
          <form className="webinar-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Full Name
                <input 
                  type="text" 
                  placeholder="Your full name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </label>
              <label>
                Email
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </label>
            </div>
            
            <div className="form-row">
              <label>
                Institution
                <input 
                  type="text" 
                  placeholder="Your school/university" 
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  required 
                />
              </label>
              <label>
                Role
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                  <option value="administrator">Administrator</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            
            <label>
              Questions for Speaker (Optional)
              <textarea 
                placeholder="Any specific questions you'd like addressed during the webinar..."
                value={formData.questions}
                onChange={(e) => setFormData({...formData, questions: e.target.value})}
                rows="3"
              />
            </label>
            
            <button className="btn primary" type="submit">
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default WebinarRegistrationModal;
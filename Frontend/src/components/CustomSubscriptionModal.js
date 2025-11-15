import React, { useState, useRef, useEffect, useContext } from 'react';
function CustomSubscriptionModal({ isOpen, plan, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    phone: '',
    role: 'decision-maker',
    institutionSize: '',
    currentLMS: '',
    studentCount: '',
    budget: '',
    timeline: '',
    requirements: '',
    additionalInfo: '',
    preferredContact: 'email',
    acceptTerms: false,
    acceptMarketing: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    if (!formData.institutionSize) newErrors.institutionSize = 'Institution size is required';
    if (!formData.studentCount.trim()) newErrors.studentCount = 'Student count is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements description is required';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      onSubmit(formData);
      
    } catch (err) {
      setErrors({ submit: 'Submission failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content custom-subscription" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Custom Enterprise Quote</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="custom-quote-summary">
            <h4>Enterprise Plan - Custom Pricing</h4>
            <div className="quote-details">
              <div className="quote-features">
                <p>✓ Unlimited students and full AI suite</p>
                <p>✓ Dedicated support and custom development</p>
                <p>✓ On-premise deployment options</p>
                <p>✓ Tailored to your institution's needs</p>
              </div>
            </div>
          </div>

          <form className="custom-subscription-form" onSubmit={handleSubmit}>
            {errors.submit && <div className="form-error">{errors.submit}</div>}
            
            <div className="form-section">
              <h5>Contact Information</h5>
              <div className="form-row">
                <label>
                  Full Name *
                  <input 
                    type="text" 
                    placeholder="Your full name" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </label>
                <label>
                  Email *
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </label>
              </div>
              
              <div className="form-row">
                <label>
                  Institution *
                  <input 
                    type="text" 
                    placeholder="Your school/university" 
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className={errors.institution ? 'error' : ''}
                  />
                  {errors.institution && <span className="field-error">{errors.institution}</span>}
                </label>
                <label>
                  Phone
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 123-4567" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Your Role *
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="decision-maker">Decision Maker</option>
                    <option value="it-director">IT Director</option>
                    <option value="academic-director">Academic Director</option>
                    <option value="administrator">Administrator</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Institution Size *
                  <select 
                    value={formData.institutionSize}
                    onChange={(e) => setFormData({...formData, institutionSize: e.target.value})}
                    className={errors.institutionSize ? 'error' : ''}
                  >
                    <option value="">Select size</option>
                    <option value="small">Small (1-5,000 students)</option>
                    <option value="medium">Medium (5,000-25,000 students)</option>
                    <option value="large">Large (25,000+ students)</option>
                    <option value="multi-campus">Multi-campus system</option>
                  </select>
                  {errors.institutionSize && <span className="field-error">{errors.institutionSize}</span>}
                </label>
              </div>
            </div>

            <div className="form-section">
              <h5>Current Setup & Requirements</h5>
              <div className="form-row">
                <label>
                  Current LMS
                  <select 
                    value={formData.currentLMS}
                    onChange={(e) => setFormData({...formData, currentLMS: e.target.value})}
                  >
                    <option value="">Select LMS</option>
                    <option value="canvas">Canvas</option>
                    <option value="moodle">Moodle</option>
                    <option value="blackboard">Blackboard</option>
                    <option value="google-classroom">Google Classroom</option>
                    <option value="other">Other</option>
                    <option value="none">No LMS currently</option>
                  </select>
                </label>
                <label>
                  Student Count *
                  <input 
                    type="text" 
                    placeholder="e.g., 15,000" 
                    value={formData.studentCount}
                    onChange={(e) => setFormData({...formData, studentCount: e.target.value})}
                    className={errors.studentCount ? 'error' : ''}
                  />
                  {errors.studentCount && <span className="field-error">{errors.studentCount}</span>}
                </label>
              </div>

              <div className="form-row">
                <label>
                  Budget Range
                  <select 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  >
                    <option value="">Select budget</option>
                    <option value="under-50k">Under $50K/year</option>
                    <option value="50k-100k">$50K - $100K/year</option>
                    <option value="100k-250k">$100K - $250K/year</option>
                    <option value="250k-500k">$250K - $500K/year</option>
                    <option value="500k-plus">$500K+/year</option>
                    <option value="custom">Custom budget</option>
                  </select>
                </label>
                <label>
                  Implementation Timeline
                  <select 
                    value={formData.timeline}
                    onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (1-3 months)</option>
                    <option value="short-term">Short-term (3-6 months)</option>
                    <option value="medium-term">Medium-term (6-12 months)</option>
                    <option value="long-term">Long-term (12+ months)</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h5>Specific Requirements</h5>
              <label>
                Describe Your Requirements *
                <textarea 
                  placeholder="Please describe your specific needs, integration requirements, custom features, or any other details that will help us provide an accurate quote..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className={errors.requirements ? 'error' : ''}
                  rows="4"
                />
                {errors.requirements && <span className="field-error">{errors.requirements}</span>}
              </label>

              <label>
                Additional Information
                <textarea 
                  placeholder="Any other information you'd like to share..."
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                  rows="3"
                />
              </label>
            </div>

            <div className="form-section">
              <h5>Contact Preferences</h5>
              <div className="form-row">
                <label>
                  Preferred Contact Method
                  <select 
                    value={formData.preferredContact}
                    onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="video-call">Video Call</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="checkbox-group">
                <label className="checkbox">
                  <input 
                    type="checkbox" 
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                  />
                  <span>I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a> *</span>
                </label>
                {errors.acceptTerms && <span className="field-error">{errors.acceptTerms}</span>}
                
                <label className="checkbox">
                  <input 
                    type="checkbox" 
                    checked={formData.acceptMarketing}
                    onChange={(e) => setFormData({...formData, acceptMarketing: e.target.checked})}
                  />
                  <span>Send me updates about enterprise features and educational insights</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Request Custom Quote'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default CustomSubscriptionModal
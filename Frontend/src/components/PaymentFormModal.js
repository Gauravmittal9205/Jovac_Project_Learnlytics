import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';

function PaymentFormModal({ isOpen, plan, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
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
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      onSubmit(formData);
      
    } catch (err) {
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Start Your Free Trial</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="trial-summary">
            <h4>{plan.name} Plan - 14-Day Free Trial</h4>
            <div className="trial-details">
              <div className="trial-price">
                <span className="price-amount">${plan.price}</span>
                <span className="price-period">/{plan.period}</span>
              </div>
              <div className="trial-info">
                <p>✓ 14-day free trial, no credit card charges</p>
                <p>✓ Cancel anytime during trial period</p>
                <p>✓ Full access to all features</p>
              </div>
            </div>
          </div>

          <form className="payment-form-content" onSubmit={handleSubmit}>
            {errors.submit && <div className="form-error">{errors.submit}</div>}
            
            <div className="form-section">
              <h5>Account Information</h5>
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
            </div>

            <div className="form-section">
              <h5>Payment Information</h5>
              <div className="form-row">
                <label>
                  Card Number *
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456" 
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    className={errors.cardNumber ? 'error' : ''}
                    maxLength="19"
                  />
                  {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
                </label>
              </div>
              
              <div className="form-row">
                <label>
                  Expiry Date *
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className={errors.expiryDate ? 'error' : ''}
                    maxLength="5"
                  />
                  {errors.expiryDate && <span className="field-error">{errors.expiryDate}</span>}
                </label>
                <label>
                  CVV *
                  <input 
                    type="text" 
                    placeholder="123" 
                    value={formData.cvv}
                    onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                    className={errors.cvv ? 'error' : ''}
                    maxLength="4"
                  />
                  {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                </label>
              </div>
            </div>

            <div className="form-section">
              <h5>Billing Address</h5>
              <div className="form-row">
                <label>
                  Address
                  <input 
                    type="text" 
                    placeholder="123 Main Street" 
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                  />
                </label>
              </div>
              
              <div className="form-row">
                <label>
                  City
                  <input 
                    type="text" 
                    placeholder="New York" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </label>
                <label>
                  State
                  <input 
                    type="text" 
                    placeholder="NY" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </label>
              </div>
              
              <div className="form-row">
                <label>
                  ZIP Code
                  <input 
                    type="text" 
                    placeholder="10001" 
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </label>
                <label>
                  Country
                  <select 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Other">Other</option>
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
                  <span>Send me updates about new features and educational insights</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Start Free Trial'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default PaymentFormModal;
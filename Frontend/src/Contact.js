import React, { useState, useRef } from 'react';

// Reusable component for displaying key-value pairs
const InfoRow = ({ label, value, href }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
      <div className="font-medium text-gray-600">{label}</div>
      {href ? (
        <a className="text-blue-600 hover:text-blue-800 transition-colors" href={href} target="_blank" rel="noopener noreferrer">{value}</a>
      ) : (
        <div className="text-gray-800">{value}</div>
      )}
    </div>
  );
};

// Contact Form Component
const ContactForm = ({ onSubmit, isSubmitting }) => {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (name, value) => {
    let error = '';
    if (name === 'name' && !value.trim()) {
      error = 'Name is required.';
    }
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required.';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Email address is invalid.';
      }
    }
    if (name === 'message' && !value.trim()) {
      error = 'Message cannot be empty.';
    }
    if (name === 'privacy' && !value) {
      error = 'You must agree to the privacy policy.';
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    validate(name, val);
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(formRef.current);
    const payload = Object.fromEntries(data.entries());

    // Final validation before submission
    let hasErrors = false;
    ['name', 'email', 'message', 'privacy'].forEach(field => {
      validate(field, payload[field]);
      if (errors[field]) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      onSubmit(payload);
    }
  };
  
  const hasErrors = Object.values(errors).some(error => error);
  const allTouched = Object.keys(touched).length >= 4; // Assuming 4 required fields
  const isFormValid = !hasErrors && allTouched && !isSubmitting;

  const getInputBorderClass = (name) => {
    if (touched[name] && errors[name]) {
      return 'border-red-500 focus:ring-red-500';
    }
    return 'border-gray-300 focus:ring-blue-500';
  };

  return (
    <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="Your full name" 
            required 
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${getInputBorderClass('name')}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="you@school.edu" 
            required 
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${getInputBorderClass('email')}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
          <input id="institution" name="institution" type="text" placeholder="e.g., Austin HS" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select id="role" name="role" defaultValue="Instructor" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Student</option>
            <option>Instructor</option>
            <option>Admin</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
        <select id="topic" name="topic" defaultValue="Support" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Sales</option>
          <option>Support</option>
          <option>Billing</option>
          <option>Privacy</option>
          <option>Other</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea 
          id="message" 
          name="message" 
          rows="5" 
          placeholder="How can we help?" 
          required 
          onChange={handleChange}
          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${getInputBorderClass('message')}`}
        />
        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
      </div>

      <label className="flex items-center text-sm font-medium text-gray-700">
        <input 
          id="privacy" 
          name="privacy" 
          type="checkbox" 
          required 
          onChange={handleChange} 
          className="mr-2 rounded text-blue-600 focus:ring-blue-500"
        /> I agree to the privacy policy
      </label>
      {errors.privacy && <p className="mt-1 text-sm text-red-500">{errors.privacy}</p>}

      <button 
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
};

// Success Message Component
const ContactSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg text-center" role="alert" aria-live="polite">
      <div className="text-5xl mb-4" aria-hidden="true">✅</div>
      <h3 className="text-2xl font-bold text-gray-800">Thanks for reaching out!</h3>
      <p className="mt-2 text-gray-600">We've received your message and will get back to you within 1 business day.</p>
      <p className="mt-4 text-sm text-gray-500">For urgent issues, please call us at <span className="font-semibold">+1 (800) LEARN-ED</span>.</p>
    </div>
  );
};

// Main Page Component
const App = () => {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (payload) => {
    setIsSubmitting(true);
    // Simulate async API call
    setTimeout(() => {
      console.log('Contact form payload', payload);
      setIsSubmitting(false);
      setSent(true);
    }, 1500); // Increased timeout to better see the "Sending..." state
  };

  return (
    <div className="bg-gray-100 min-h-screen py-16 font-sans antialiased">
      <header className="bg-white shadow-sm py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">We’re here to help</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Response within 1 business day for general queries; 4 hours for priority support.</p>
        </div>
      </header>

      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="contact-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact options</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
              <InfoRow label="Sales" value="sales@learnytics.app" href="mailto:sales@learnytics.app" />
              <InfoRow label="Support" value="support@learnytics.app" href="mailto:support@learnytics.app" />
              <InfoRow label="Partnerships" value="partners@learnytics.app" href="mailto:partners@learnytics.app" />
              <InfoRow label="Press" value="press@learnytics.app" href="mailto:press@learnytics.app" />
              <InfoRow label="Phone" value="+1 (800) LEARN-ED" href="tel:+18005327633" />
              <InfoRow label="Office hours" value="Mon–Fri, 9am–6pm local" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">Address</h3>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <InfoRow label="HQ" value="123 Educator Way, Suite 400, Austin, TX 78701" />
              <InfoRow label="Link" value="View on map" href="https://maps.google.com/?q=123+Educator+Way,+Austin,+TX+78701" />
            </div>
          </div>

          <div className="contact-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact form</h2>
            {sent ? (
              <ContactSuccess />
            ) : (
              <ContactForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;

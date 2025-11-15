import React, { useState } from 'react';

function StepCard({ icon, title, text }) {
  return (
    <div className="step">
      <div className="step-icon" aria-hidden="true">{icon}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-text">{text}</p>
    </div>
  );
}



function Stat({ value, label }) {
  const [display, setDisplay] = useState(label === '24/7' ? '24/7' : '0');
  React.useEffect(() => {
    if (label === '24/7') return; // Keep static
    const numeric = parseInt(String(value).replace(/\D/g, ''), 10);
    const duration = 1000;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const current = Math.floor(t * numeric);
      const suffix = /\+$/.test(String(value)) ? '+' : '';
      const percent = /%$/.test(String(value)) ? '%' : '';
      setDisplay(`${current}${percent}${suffix}`);
      if (t < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, label]);

  return (
    <div className="stat reveal">
      <div className="stat-value">{display}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      <ul>
        {links.map((l) => (
          <li key={l.label}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </div>
  );
}



function NewsletterSignup({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - call the onSuccess callback
      if (onSuccess) {
        onSuccess(email);
      }
      
      setEmail('');
      setError('');
      
    } catch (err) {
      setError('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      {error && <div className="newsletter-error">{error}</div>}
      <div className="newsletter-input">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setError('')}
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`btn primary ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
}

function WebinarCard({ title, date, time, speaker, spots, image, onRegister }) {
  return (
    <div className="webinar-card">
      <div className="webinar-image">{image}</div>
      <div className="webinar-content">
        <h3 className="webinar-title">{title}</h3>
        <div className="webinar-meta">
          <div className="webinar-date">{date} • {time}</div>
          <div className="webinar-speaker">with {speaker}</div>
        </div>
        <div className="webinar-spots">{spots}</div>
        <button className="btn primary small" onClick={() => onRegister({ title, date, time, speaker, image })}>Register Now</button>
      </div>
    </div>
  );
}
export  {StepCard,Stat,WebinarCard,FooterCol,NewsletterSignup}
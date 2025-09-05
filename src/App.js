import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import NavIcons from './NavIcons';
import Help from './Help';
import About from './About';
import Resources from './Resources';
import Contact from './Contact';

// LocalStorage-based auth helpers
const USERS_KEY = 'learnlytics_users';
const SESSION_KEY = 'learnlytics_session';

function readUsersFromStorage(){
  try { const raw = localStorage.getItem(USERS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeUsersToStorage(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function readSession(){
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeSession(session){ localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => readSession());

  useEffect(() => {
    const onStorage = (e) => { if (e.key === SESSION_KEY) setCurrentUser(readSession()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => { clearSession(); setCurrentUser(null); navigate('/'); };
  const goToDashboard = () => { if (!currentUser) return; currentUser.role === 'instructor' ? navigate('/dashboard-instructor') : navigate('/dashboard-student'); };
  return (
    <div className="site">
      <nav className="navbar">
        <div className="container nav-inner">
          <div className="brand">
            <span className="logo-shield" aria-hidden="true">🛡️</span>
            <span className="brand-text">Learnlytics</span>
          </div>
          <ul className="nav-links">
            <li><Link to="/about"><span className="nav-icon" aria-hidden="true"></span><span>About</span></Link></li>
            <li><Link to="/resources"><span className="nav-icon" aria-hidden="true"></span><span>Resources</span></Link></li>
            <li><Link to="/contact"><span className="nav-icon" aria-hidden="true"></span><span>Contact</span></Link></li>
            <li><Link to="/help"><span className="nav-icon" aria-hidden="true"></span><span>Help</span></Link></li>
          </ul>
          <div className="auth-actions">
            {!currentUser ? (
              <>
                <button className="btn ghost" onClick={() => navigate('/login')}>Login</button>
                <button className="btn primary" onClick={() => navigate('/register')}>Sign Up</button>
              </>
            ) : (
              <>
                <button className="btn primary" onClick={goToDashboard}>Dashboard</button>
                <button className="btn ghost" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/icons" element={<NavIcons />} />
        <Route path="/about" element={<About />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/dashboard-student" element={<StudentDashboard />} />
        <Route path="/dashboard-instructor" element={<InstructorDashboard />} />
      </Routes>
    </div>
  );
}

function Home(){
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [webinarRegistration, setWebinarRegistration] = useState({ isOpen: false, webinar: null });
  const [subscriptionSuccess, setSubscriptionSuccess] = useState({ isOpen: false, email: '' });
  const [paymentForm, setPaymentForm] = useState({ isOpen: false, plan: null });
  const [customSubscription, setCustomSubscription] = useState({ isOpen: false, plan: null });
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="hero">
        <div className="container hero-inner">
          <div className="hero-copy reveal">
            <h1>Protect Student Success with Smart Analytics</h1>
            <p>
              Simple tools for instructors to monitor engagement, predict dropout risk,
              and deliver personalized learning at scale.
            </p>
            <div className="hero-cta">
              <Link className="btn primary" to="/register">Get Started</Link>
            </div>
          </div>
          <div className="hero-art reveal" aria-hidden="true">
            <img src="/classroom.webp" alt="Students collaborating in class" />
          </div>
        </div>
      </header>

      {/* Stats (blue strip) */}
      <section className="stats" id="features">
        <div className="container stat-grid">
          <Stat label="Institutions" value="200+" />
          <Stat label="Engagement Lift" value="92%" />
          <Stat label="Realtime Alerts" value="247" />
          <Stat label="AI Recommendations" value="10+" />
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works container">
        <h2 className="section-title">How it works</h2>
        <p className="section-sub">From connection to continuous improvement in four simple steps.</p>
        <div className="steps reveal">
          <StepCard icon="🔗" title="Connect LMS" text="One‑click integration with Moodle, Canvas, or Google Classroom." />
          <StepCard icon="🧠" title="Analyze" text="AI models score engagement and dropout risk in real time." />
          <StepCard icon="📣" title="Act" text="Send nudges, assign resources, and notify instructors instantly." />
          <StepCard icon="📊" title="Improve" text="Review weekly reports and iterate to boost outcomes." />
        </div>
      </section>


      <section className="why container">
        <h2 className="section-title">Why choose us</h2>
        <p className="section-sub">Clear advantages over generic dashboards and alert systems.</p>

        {/* Comparison table */}
        <div className="compare reveal" role="table" aria-label="Learnlytics vs Others">
          <div className="cmp-row cmp-head" role="row">
            <div className="cmp-cell" role="columnheader">Capability</div>
            <div className="cmp-cell ours" role="columnheader">Learnlytics</div>
            <div className="cmp-cell" role="columnheader">Others</div>
          </div>
          {[
            {cap:'Explainable AI alerts', ours:'✅ Reasons + confidence', other:'⚠️ Opaque risk scores'},
            {cap:'1‑click LMS setup', ours:'✅ Canvas/Moodle/Google in <2 min', other:'⚠️ Complex, manual mapping'},
            {cap:'Real‑time engagement', ours:'✅ Minute‑level with early decline', other:'⚠️ Daily/weekly aggregates'},
            {cap:'Personalized resources', ours:'✅ Adaptive videos/quizzes/readings', other:'⚠️ Static content lists'},
            {cap:'Privacy & security', ours:'✅ FERPA/GDPR, RBAC, encryption', other:'⚠️ Basic controls'},
            {cap:'Instructor matching', ours:'✅ Smart routing by expertise', other:'⚠️ Manual selection'},
          ].map((r) => (
            <div className="cmp-row" role="row" key={r.cap}>
              <div className="cmp-cell" role="cell">{r.cap}</div>
              <div className="cmp-cell ours" role="cell">{r.ours}</div>
              <div className="cmp-cell" role="cell">{r.other}</div>
            </div>
          ))}
        </div>

        {/* Feature grid removed per request */}
      </section>

      {/* Engagement & Conversion Sections */}
      <section className="pricing container">
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Choose the plan that fits your institution's needs</p>
        <div className="pricing-grid reveal">
          <PricingCard 
            plan="Starter" 
            price="99" 
            period="month"
            features={[
              'Up to 500 students',
              'Basic analytics dashboard',
              'Email support',
              'Standard integrations'
            ]}
            popular={false}
            cta="Start Free Trial"
            onCtaClick={() => setPaymentForm({ isOpen: true, plan: { name: 'Starter', price: '99', period: 'month' } })}
          />
          <PricingCard 
            plan="Professional" 
            price="299" 
            period="month"
            features={[
              'Up to 2,000 students',
              'Advanced AI insights',
              'Priority support',
              'Custom integrations',
              'White-label options'
            ]}
            popular={true}
            cta="Start Free Trial"
            onCtaClick={() => setPaymentForm({ isOpen: true, plan: { name: 'Professional', price: '299', period: 'month' } })}
          />
          <PricingCard 
            plan="Enterprise" 
            price="Custom" 
            period=""
            features={[
              'Unlimited students',
              'Full AI suite',
              'Dedicated support',
              'Custom development',
              'On-premise options'
            ]}
            popular={false}
            cta="Custom Quote"
            onCtaClick={() => setCustomSubscription({ isOpen: true, plan: { name: 'Enterprise', type: 'custom' } })}
          />
        </div>
        <div className="pricing-note">
          <p>All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </section>

      <section className="trial-cta">
        <div className="container">
          <div className="trial-content reveal">
            <h2>Ready to transform student success?</h2>
            <p>Join 200+ institutions already using Learnlytics to boost engagement and reduce dropout rates.</p>
            <div className="trial-actions">
              <Link className="btn primary large" to="/register">Start Free Trial</Link>
              <button className="btn ghost large" onClick={() => setShowDemo(true)}>Watch Demo</button>
            </div>
            <div className="trial-stats">
              <div className="stat-item">
                <span className="stat-number">14</span>
                <span className="stat-text">Days Free</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-text">Setup Fee</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-text">Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter container">
        <div className="newsletter-content reveal">
          <h2>Stay ahead with the latest insights</h2>
          <p>Get weekly updates on new features, research findings, and best practices for student success.</p>
          <NewsletterSignup onSuccess={(email) => setSubscriptionSuccess({ isOpen: true, email })} />
        </div>
      </section>

      <section className="webinar container">
        <h2 className="section-title">Upcoming events & webinars</h2>
        <p className="section-sub">Learn from experts and connect with other educators</p>
        <div className="webinar-grid reveal">
          <WebinarCard 
            title="AI in Education: Best Practices"
            date="March 15, 2025"
            time="2:00 PM EST"
            speaker="Dr. Sarah Chen"
            spots="45 spots left"
            image="🎓"
            onRegister={(webinar) => setWebinarRegistration({ isOpen: true, webinar })}
          />
          <WebinarCard 
            title="Student Engagement Strategies"
            date="March 22, 2025"
            time="1:00 PM EST"
            speaker="Prof. Michael Rodriguez"
            spots="32 spots left"
            image="📚"
            onRegister={(webinar) => setWebinarRegistration({ isOpen: true, webinar })}
          />
          <WebinarCard 
            title="Data Privacy in EdTech"
            date="March 29, 2025"
            time="3:00 PM EST"
            speaker="Legal Team"
            spots="28 spots left"
            image="🔒"
            onRegister={(webinar) => setWebinarRegistration({ isOpen: true, webinar })}
          />
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand">
              <span className="logo-shield" aria-hidden="true">🛡️</span>
              <span className="brand-text">Learnlytics</span>
            </div>
            <p className="muted">Empowering instructors with real‑time analytics to drive student success.</p>
            <p className="muted">📞 1800-LEARN-ED</p>
            <p className="muted">✉️ support@learnlytics.app</p>
          </div>
          <FooterCol title="Product" links={[
            { label: 'Dashboard', href: '#dashboard' },
            { label: 'Alerts', href: '#features' },
            { label: 'Recommendations', href: '#features' },
            { label: 'Reports', href: '#features' }
          ]} />
          <FooterCol title="Support" links={[
            { label: 'Help Center', href: '#' },
            { label: 'Resources', href: '#resources' },
            { label: 'Contact Us', href: '#contact' },
            { label: 'Emergency', href: '#' }
          ]} />
          <FooterCol title="Legal" links={[
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Data Protection', href: '#' },
            { label: 'Disclaimer', href: '#' }
          ]} />
        </div>
        <div className="container footer-bottom">
          <span className="muted">© 2025 Learnlytics. All rights reserved.</span>
          <span className="muted">Made for educators</span>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="modal-overlay" onClick={() => setShowDemo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Platform Demo</h3>
              <button className="modal-close" onClick={() => setShowDemo(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="demo-placeholder">
                <span role="img" aria-label="video">🎥</span>
                <p>Interactive platform demo video</p>
                <p className="muted">See Learnlytics in action with real data and workflows</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webinar Registration Modal */}
      <WebinarRegistrationModal
        webinar={webinarRegistration.webinar}
        isOpen={webinarRegistration.isOpen}
        onClose={() => setWebinarRegistration({ isOpen: false, webinar: null })}
        onSubmit={(formData) => {
          // Handle form submission - you can add API call here
          console.log('Webinar registration:', { webinar: webinarRegistration.webinar, ...formData });
          alert(`Thank you for registering for "${webinarRegistration.webinar.title}"! You will receive a confirmation email shortly.`);
          setWebinarRegistration({ isOpen: false, webinar: null });
        }}
      />

      {/* Subscription Success Modal */}
      <SubscriptionSuccessModal
        isOpen={subscriptionSuccess.isOpen}
        email={subscriptionSuccess.email}
        onClose={() => setSubscriptionSuccess({ isOpen: false, email: '' })}
      />

      {/* Payment Form Modal */}
      <PaymentFormModal
        isOpen={paymentForm.isOpen}
        plan={paymentForm.plan}
        onClose={() => setPaymentForm({ isOpen: false, plan: null })}
        onSubmit={(formData) => {
          // Handle payment form submission - you can add payment processing here
          console.log('Payment form submitted:', { plan: paymentForm.plan, ...formData });
          alert(`Thank you for starting your free trial! You will receive a confirmation email shortly.`);
          setPaymentForm({ isOpen: false, plan: null });
        }}
      />

      {/* Custom Subscription Modal */}
      <CustomSubscriptionModal
        isOpen={customSubscription.isOpen}
        plan={customSubscription.plan}
        onClose={() => setCustomSubscription({ isOpen: false, plan: null })}
        onSubmit={(formData) => {
          // Handle custom subscription submission - you can add API call here
          console.log('Custom subscription submitted:', { plan: customSubscription.plan, ...formData });
          alert(`Thank you for your custom quote request! Our sales team will contact you within 24 hours.`);
          setCustomSubscription({ isOpen: false, plan: null });
        }}
      />

      {/* AI Chatbot Button */}
      <div className="chatbot-button" onClick={() => setChatbotOpen(true)}>
        <div className="chatbot-icon">
          <span className="chatbot-ai">AI</span>
          <span className="chatbot-dot">●</span>
        </div>
        <span className="chatbot-text">Need help?</span>
      </div>

      {/* AI Chatbot Modal */}
      <AIChatbotModal
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />
    </>
  );
}



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

function PricingCard({ plan, price, period, features, popular, cta, onCtaClick }) {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick({ plan, price, period });
    }
  };

  return (
    <div className={`pricing-card ${popular ? 'popular' : ''}`}>
      {popular && <div className="popular-badge">Most Popular</div>}
      <div className="pricing-header">
        <h3 className="plan-name">{plan}</h3>
        <div className="price">
          <span className="price-amount">{price}</span>
          {period && <span className="price-period">/{period}</span>}
        </div>
      </div>
      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index}>✓ {feature}</li>
        ))}
      </ul>
      <button 
        className={`btn ${popular ? 'primary' : 'ghost'}`}
        onClick={handleCtaClick}
      >
        {cta}
      </button>
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

function SubscriptionSuccessModal({ isOpen, email, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content subscription-success" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Subscription Successful! 🎉</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="subscription-success-content">
            <div className="success-icon">📧</div>
            <h4>Welcome to Learnlytics!</h4>
            <p>Thank you for subscribing to our newsletter. We've sent a confirmation email to:</p>
            <div className="email-display">{email}</div>
            <p className="next-steps">You'll receive our weekly insights, feature updates, and best practices for student success.</p>
            <div className="subscription-benefits">
              <div className="benefit">
                <span className="benefit-icon">📊</span>
                <span>Weekly analytics insights</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🚀</span>
                <span>New feature announcements</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💡</span>
                <span>Best practices & tips</span>
              </div>
            </div>
            <button className="btn primary" onClick={onClose}>
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function AIChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref for the chat messages container
  const messagesEndRef = useRef(null);

  const quickReplies = [
    'How does the free trial work?',
    'What features are included?',
    'How do I get started?',
    'Contact support'
  ];

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateAIResponse(message);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay for realism
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('trial') || lowerMessage.includes('free')) {
      return 'Our free trial gives you 14 days of full access to all features with no credit card charges. You can cancel anytime during the trial period. Would you like me to help you get started?';
    }
    
    if (lowerMessage.includes('feature') || lowerMessage.includes('include')) {
      return 'Learnlytics includes real-time analytics, AI-powered insights, student engagement monitoring, dropout risk prediction, personalized recommendations, and comprehensive reporting. Which aspect interests you most?';
    }
    
    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return 'Getting started is easy! Click any "Start Free Trial" button on our pricing plans, fill out the form, and you\'ll have instant access. I can walk you through the setup process if you\'d like.';
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('help')) {
      return 'I\'m here to help! For technical support, you can email us at support@learnlytics.app or call 1800-LEARN-ED. Is there something specific I can assist you with?';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'We offer three plans: Starter ($99/month), Professional ($299/month), and Enterprise (custom pricing). All plans include a 14-day free trial. What size institution are you working with?';
    }
    
    return 'That\'s a great question! Let me connect you with our team for more detailed information. In the meantime, you can explore our features or start a free trial to see Learnlytics in action.';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change or typing starts
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chatbot-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header chatbot-header">
          <div className="chatbot-title">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h3>AI Assistant</h3>
              <span className="chatbot-status">Online</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="chatbot-body">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {/* Invisible element for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button 
                key={index} 
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
          
          <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="chat-input"
              />
              <button type="submit" className="chat-send-btn" disabled={!inputMessage.trim()}>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginPage(){
  const [role,setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const session = readSession();
    if (session) {
      if (session.role === 'instructor') navigate('/dashboard-instructor');
      else navigate('/dashboard-student');
    }
  }, [navigate]);
  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    const users = readUsersFromStorage();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) { setError('Email does not exist'); return; }
    if (user.password !== password) { setError('Incorrect password'); return; }
    if (role && user.role !== role) { setError(`This account is registered as ${user.role}.`); return; }
    writeSession({ email: user.email, role: user.role, name: user.name || '' });
    if (user.role === 'instructor') navigate('/dashboard-instructor');
    else navigate('/dashboard-student');
  };
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <span className="back-arrow">←</span>
            <span>Back</span>
          </button>
          <h2>Login</h2>
        </div>
        <p className="muted">Don\'t have an account? <Link to="/register">Sign Up</Link></p>
        <div className="role-tabs">
          <button className={`tab ${role==='student'?'active':''}`} onClick={()=>setRole('student')}>Student</button>
          <button className={`tab ${role==='instructor'?'active':''}`} onClick={()=>setRole('instructor')}>Instructor</button>
        </div>
        <form className="form" onSubmit={onSubmit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
          <label>Password<input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••••" required /></label>
          <div className="form-row">
            <label className="checkbox"><input type="checkbox"/> Remember me</label>
            <Link to="/forgot">Forgot password?</Link>
          </div>
          <button className="btn primary" type="submit">Login as {role}</button>
        </form>
      </div>
    </div>
  );
}

function RegisterPage(){
  const [role,setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const session = readSession();
    if (session) {
      if (session.role === 'instructor') navigate('/dashboard-instructor');
      else navigate('/dashboard-student');
    }
  }, [navigate]);
  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) { setError('Please enter your full name'); return; }
    const emailTrimmed = email.trim().toLowerCase();
    const emailValid = /.+@.+\..+/.test(emailTrimmed);
    if (!emailValid) { setError('Please enter a valid email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    const users = readUsersFromStorage();
    const exists = users.some(u => u.email.toLowerCase() === emailTrimmed);
    if (exists) { setError('An account with this email already exists'); return; }
    const newUser = { name: name.trim(), email: emailTrimmed, password, role };
    writeUsersToStorage([...users, newUser]);
    writeSession({ email: newUser.email, role: newUser.role, name: newUser.name });
    setSuccess('Account created successfully');
    if (role === 'instructor') navigate('/dashboard-instructor');
    else navigate('/dashboard-student');
  };
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <span className="back-arrow">←</span>
            <span>Back</span>
          </button>
          <h2>Join Learnlytics</h2>
        </div>
        <p className="muted">Choose your role to get started</p>
        <div className="role-tabs">
          <button className={`tab ${role==='student'?'active':''}`} onClick={()=>setRole('student')}>Student</button>
          <button className={`tab ${role==='instructor'?'active':''}`} onClick={()=>setRole('instructor')}>Instructor</button>
        </div>
        <form className="form" onSubmit={onSubmit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          {success && <div className="success" role="status">{success}</div>}
          <div className="grid-2">
            <label>Full name<input value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Your name" required /></label>
            <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
          </div>
          <div className="grid-2">
            <label>Password<input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Create password" required /></label>
            <label>Confirm<input value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} type="password" placeholder="Confirm password" required /></label>
          </div>
          {role==='instructor' && (
            <div className="grid-2">
              <label>Expertise<input type="text" placeholder="e.g., Data Science" /></label>
              <label>Experience<input type="number" placeholder="Years" /></label>
            </div>
          )}
          <button className="btn primary" type="submit">Register as {role}</button>
        </form>
      </div>
    </div>
  );
}

function ForgotPasswordPage(){
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="muted">Enter your email and we\'ll send reset instructions.</p>
        <form className="form">
          <label>Email<input type="email" placeholder="you@example.com" required /></label>
          <button className="btn primary" type="submit">Send reset link</button>
          <p className="muted">Remembered it? <Link to="/login">Back to login</Link></p>
        </form>
      </div>
    </div>
  );
}

export default App;

function StudentDashboard(){
  const session = readSession();
  const navigate = useNavigate();
  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);
  return (
    <div className="container" style={{padding:'40px 20px'}}>
      <h2>Student Dashboard</h2>
      <p>Welcome {session?.name || 'Student'} — you are logged in.</p>
    </div>
  );
}

function InstructorDashboard(){
  const session = readSession();
  const navigate = useNavigate();
  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);
  return (
    <div className="container" style={{padding:'40px 20px'}}>
      <h2>Instructor Dashboard</h2>
      <p>Welcome {session?.name || 'Instructor'} — you are logged in.</p>
    </div>
  );
}

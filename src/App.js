import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import NavIcons from './NavIcons';
import Help from './Help';
import About from './About';
import Resources from './Resources';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
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
  // Check if we're on a dashboard page
  const isDashboardPage = window.location.pathname.includes('/dashboard-');

  return (
    <div className="site">
      {!isDashboardPage && (
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
      )}

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
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/weekly-report" element={<WeeklyReport />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/risk-status" element={<RiskStatusPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-instructors" element={<MyInstructorsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/course-analysis" element={<CourseAnalysisPage />} />
        <Route path="/academic-performance" element={<AcademicPerformancePage />} />
        <Route path="/my-students" element={<MyStudentsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
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
              Simple tool for instructors to monitor engagement, predict dropout risk,
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


function OverviewPage() {
  
 const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);


  const studentData = {
    name: "John Doe",
    course: "Computer Science",
    year: "3rd Year",
    semester: "Fall 2024",
    photo: "👨‍🎓",
    attendance: 95,
    avgQuizScore: 87,
    totalStudyHours: 42,
    engagementScore: 92,
    riskLevel: "Low",
    data: [
      { week: "Week 1", score: 85 },
      { week: "Week 2", score: 88 },
      { week: "Week 3", score: 92 },
      { week: "Week 4", score: 33 },
      { week: "Week 5", score: 94 },
      { week: "Week 6", score: 96 },
    ],
    timeData: [
      { activity: "Lectures", hours: 15, percentage: 35 },
      { activity: "Assignments", hours: 12, percentage: 28 },
      { activity: "Study", hours: 10, percentage: 23 },
      { activity: "Projects", hours: 6, percentage: 14 },
    ],
    performanceData: [
      { subject: "Mathematics", score: 92, status: "excellent" },
      { subject: "Programming", score: 88, status: "good" },
      { subject: "Data Structures", score: 85, status: "good" },
      { subject: "Algorithms", score: 90, status: "excellent" },
      { subject: "Database", score: 78, status: "needs-improvement" },
    ],
    recommendations: [
      {
        type: "study",
        title: "Advanced Algorithms",
        reason: "Based on your strong performance in basic algorithms",
      },
      {
        type: "practice",
        title: "Database Design",
        reason: "Improve your database management skills",
      },
      {
        type: "resource",
        title: "Math Problem Sets",
        reason: "Maintain your excellent math performance",
      },
    ],
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  const Colors = ["#8b5cf6"];

  // Risk level dummy data
  const riskData = [{ name: "Risk", value: studentData.engagementScore }];
  const needleAngle = (studentData.engagementScore / 100) * 180;
  const riskLevel = studentData.riskLevel;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {studentData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{studentData.name}</h4>
            <p>{studentData.course}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item active">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate("/");
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Overview</h1>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{studentData.engagementScore}%</span>
                <span className="stat-label">Engagement</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{studentData.riskLevel}</span>
                <span className="stat-label">Risk Level</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Profile + Quick Stats */}
          <div className="dashboard-section">
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-photo">{studentData.photo}</div>
                <div className="profile-details">
                  <h3>{studentData.name}</h3>
                  <p>
                    {studentData.course} • {studentData.year} {studentData.semester}
                  </p>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              {[
                { label: "Attendance", value: `${studentData.attendance}%`, icon: "attendance" },
                { label: "Avg Quiz Score", value: `${studentData.avgQuizScore}%`, icon: "quiz" },
                { label: "Study Hours", value: `${studentData.totalStudyHours}h`, icon: "study" },
                { label: "Engagement", value: `${studentData.engagementScore}%`, icon: "engagement" },
              ].map((stat, index) => (
                <div className="stat-card" key={index}>
                  <div className={`stat-icon ${stat.icon}`}></div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Analytics & Performance</h2>
            <div className="charts-grid">
              {/* Engagement Trend BarChart */}
              <div className="chart-card p-4 shadow-lg rounded-2xl bg-white">
                <h3 className="text-lg font-semibold mb-4">Engagement Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={studentData.data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <Tooltip formatter={(value) => `${value}%`} labelStyle={{ fontWeight: "bold" }} />
                    <Bar dataKey="score" fill="#2563eb" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="score" position="top" formatter={(val) => `${val}%`} fill="#2563eb" fontSize={12} fontWeight="bold" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Time Distribution PieChart */}
              <div className="chart-card p-6 shadow-lg rounded-2xl bg-white">
                <h3 className="text-lg font-semibold mb-4">Time Spent Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={studentData.timeData}
                      dataKey="percentage"
                      nameKey="activity"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={3}
                    >
                      {studentData.timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value}%`, `${props.payload.activity} (${props.payload.hours}h)`]} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" formatter={(value, entry) => `${value}: ${entry.payload.hours}h`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Comparison BarChart */}
              <div className="chart-card p-6 shadow-lg rounded-2xl bg-white w-full h-[400px]">
                <h3 className="text-xl font-semibold mb-6">Performance Comparison</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    layout="vertical"
                    data={studentData.performanceData}
                    margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="subject" tick={{ fontSize: 14, fill: "#374151" }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="score" barSize={20} radius={[0, 10, 10, 0]} animationDuration={1200}>
                      {studentData.performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Suggested for You</h2>
            <div className="recommendations-grid">
              {studentData.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className={`rec-icon ${rec.type}`}></div>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.reason}</p>
                    <button className="btn primary small">Start Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




function RiskStatusPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item active">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Risk Status</h1>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Risk Overview Section */}
          <div className="dashboard-section">
            <h2>Academic Risk Assessment</h2>
            <div className="risk-overview">
              <div className="risk-summary-card">
                <div className="risk-level-indicator">
                  <div className="risk-gauge">
                    <div className="gauge-circle low-risk">
                      <div className="gauge-center">
                        <div className="risk-score">15%</div>
                      </div>
                    </div>
                  </div>
                  <div className="risk-status">
                    <h3>Low Risk</h3>
                    <p>Your academic performance is on track</p>
                  </div>
                </div>
                <div className="risk-factors">
                  <div className="factor-item positive">
                    <span className="factor-icon">✓</span>
                    <span>High attendance (95%)</span>
                  </div>
                  <div className="factor-item positive">
                    <span className="factor-icon">✓</span>
                    <span>Consistent quiz scores (87%)</span>
                  </div>
                  <div className="factor-item positive">
                    <span className="factor-icon">✓</span>
                    <span>Active participation (92%)</span>
                  </div>
                  <div className="factor-item warning">
                    <span className="factor-icon">⚠</span>
                    <span>Database course needs attention (78%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis Charts */}
          <div className="dashboard-section">
            <h2>Risk Analysis Breakdown</h2>
            <div className="risk-charts-grid">
              <div className="chart-card">
                <h3>Risk Trend Over Time</h3>
                <div className="risk-trend-chart">
                  <div className="chart-container">
                    <div className="trend-line">
                      <div className="trend-point" style={{left: '10%', bottom: '20%'}}>
                        <div className="point-value">25%</div>
                        <div className="point-dot"></div>
                      </div>
                      <div className="trend-point" style={{left: '30%', bottom: '15%'}}>
                        <div className="point-value">20%</div>
                        <div className="point-dot"></div>
                      </div>
                      <div className="trend-point" style={{left: '50%', bottom: '10%'}}>
                        <div className="point-value">15%</div>
                        <div className="point-dot"></div>
                      </div>
                      <div className="trend-point" style={{left: '70%', bottom: '12%'}}>
                        <div className="point-value">18%</div>
                        <div className="point-dot"></div>
                      </div>
                      <div className="trend-point" style={{left: '90%', bottom: '15%'}}>
                        <div className="point-value">15%</div>
                        <div className="point-dot"></div>
                      </div>
                    </div>
                  </div>
                  <div className="chart-labels">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                    <span>Week 5</span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3>Risk Factors Distribution</h3>
                <div className="risk-factors-chart">
                  <div className="factor-bar">
                    <div className="factor-label">Attendance</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '15%'}}></div>
                    </div>
                    <span className="factor-percentage">15%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Quiz Performance</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '20%'}}></div>
                    </div>
                    <span className="factor-percentage">20%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Assignment Submission</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill medium-risk" style={{width: '35%'}}></div>
                    </div>
                    <span className="factor-percentage">35%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Course Engagement</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '10%'}}></div>
                    </div>
                    <span className="factor-percentage">10%</span>
                  </div>
                  <div className="factor-bar">
                    <div className="factor-label">Study Time</div>
                    <div className="factor-bar-container">
                      <div className="factor-bar-fill low-risk" style={{width: '20%'}}></div>
                    </div>
                    <span className="factor-percentage">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course-Specific Risk Analysis */}
          <div className="dashboard-section">
            <h2>Course-Specific Risk Analysis</h2>
            <div className="course-risk-grid">
              <div className="course-risk-card excellent">
                <div className="course-header">
                  <h4>Mathematics</h4>
                  <span className="risk-badge low">Low Risk</span>
                </div>
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">92%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">98%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Engagement</span>
                    <span className="metric-value">95%</span>
                  </div>
                </div>
                <div className="risk-insights">
                  <p>Excellent performance across all metrics. No intervention needed.</p>
                </div>
              </div>

              <div className="course-risk-card good">
                <div className="course-header">
                  <h4>Programming</h4>
                  <span className="risk-badge low">Low Risk</span>
                </div>
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">88%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">92%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Engagement</span>
                    <span className="metric-value">89%</span>
                  </div>
                </div>
                <div className="risk-insights">
                  <p>Good performance with room for improvement in engagement.</p>
                </div>
              </div>

              <div className="course-risk-card needs-improvement">
                <div className="course-header">
                  <h4>Database</h4>
                  <span className="risk-badge medium">Medium Risk</span>
                </div>
                <div className="risk-metrics">
                  <div className="metric">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">78%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">85%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Engagement</span>
                    <span className="metric-value">72%</span>
                  </div>
                </div>
                <div className="risk-insights">
                  <p>Requires attention. Consider additional study time and resources.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Mitigation Recommendations */}
          <div className="dashboard-section">
            <h2>Risk Mitigation Recommendations</h2>
            <div className="recommendations-grid">
              <div className="recommendation-card">
                <div className="rec-icon study"></div>
                <div className="rec-content">
                  <h4>Database Course Support</h4>
                  <p>Schedule additional tutoring sessions for database concepts and practice more SQL queries.</p>
                  <div className="rec-priority high">High Priority</div>
                </div>
              </div>
              <div className="recommendation-card">
                <div className="rec-icon practice"></div>
                <div className="rec-content">
                  <h4>Assignment Submission</h4>
                  <p>Set up reminders for assignment deadlines and break large projects into smaller tasks.</p>
                  <div className="rec-priority medium">Medium Priority</div>
                </div>
              </div>
              <div className="recommendation-card">
                <div className="rec-icon resource"></div>
                <div className="rec-content">
                  <h4>Study Group Formation</h4>
                  <p>Join or form study groups for collaborative learning and peer support.</p>
                  <div className="rec-priority low">Low Priority</div>
                </div>
              </div>
            </div>
          </div>

          {/* Early Warning System */}
          <div className="dashboard-section">
            <h2>Early Warning System</h2>
            <div className="warning-system">
              <div className="warning-status">
                <div className="warning-icon">🟢</div>
                <div className="warning-content">
                  <h3>No Active Warnings</h3>
                  <p>All systems are functioning normally. Continue current study patterns.</p>
                </div>
              </div>
              <div className="warning-thresholds">
                <h4>Warning Thresholds</h4>
                <div className="threshold-item">
                  <span className="threshold-label">Attendance below 80%</span>
                  <span className="threshold-status safe">Safe (95%)</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">Quiz average below 70%</span>
                  <span className="threshold-status safe">Safe (87%)</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">Assignment submission below 90%</span>
                  <span className="threshold-status warning">Monitor (85%)</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">Engagement below 75%</span>
                  <span className="threshold-status safe">Safe (92%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Risk Data */}
          <div className="dashboard-section">
            <h2>Historical Risk Analysis</h2>
            <div className="historical-data">
              <div className="data-summary">
                <div className="summary-item">
                  <h4>Average Risk Level</h4>
                  <span className="summary-value low-risk">18%</span>
                </div>
                <div className="summary-item">
                  <h4>Highest Risk Period</h4>
                  <span className="summary-value">Week 2 (25%)</span>
                </div>
                <div className="summary-item">
                  <h4>Risk Improvement</h4>
                  <span className="summary-value positive">-10%</span>
                </div>
                <div className="summary-item">
                  <h4>Interventions Used</h4>
                  <span className="summary-value">2</span>
                </div>
              </div>
              <div className="risk-timeline">
                <h4>Risk Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">Week 1</div>
                    <div className="timeline-content">
                      <div className="timeline-risk low">25% Risk</div>
                      <div className="timeline-note">Initial assessment</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">Week 2</div>
                    <div className="timeline-content">
                      <div className="timeline-risk low">20% Risk</div>
                      <div className="timeline-note">Improved attendance</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">Week 3</div>
                    <div className="timeline-content">
                      <div className="timeline-risk low">15% Risk</div>
                      <div className="timeline-note">Better quiz scores</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">Week 4</div>
                    <div className="timeline-content">
                      <div className="timeline-risk low">18% Risk</div>
                      <div className="timeline-note">Assignment delay</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">Week 5</div>
                    <div className="timeline-content">
                      <div className="timeline-risk low">15% Risk</div>
                      <div className="timeline-note">Current status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [profileData, setProfileData] = useState({
    personal: {
      fullName: 'John Doe',
      dateOfBirth: 'March 15, 2002',
      gender: 'Male',
      nationality: 'American',
      bloodType: 'O+'
    },
    contact: {
      email: 'john.doe@university.edu',
      phone: '+1 (555) 123-4567',
      address: '123 University Ave, Campus City, ST 12345',
      emergencyContact: 'Jane Doe (Mother) - +1 (555) 987-6543'
    },
    academic: {
      program: 'Bachelor of Computer Science',
      major: 'Computer Science',
      minor: 'Mathematics',
      year: '3rd Year (Junior)',
      semester: 'Fall 2024',
      expectedGraduation: 'May 2025',
      gpa: '3.85',
      creditsCompleted: '87',
      creditsThisSemester: '15',
      academicStanding: 'Good Standing',
      deansList: '4 Semesters',
      honorSociety: 'Phi Beta Kappa'
    },
    communication: {
      emailNotifications: true,
      smsAlerts: false,
      pushNotifications: true,
      primaryMethod: 'email',
      secondaryMethod: 'phone',
      tertiaryMethod: 'portal'
    },
    emergency: {
      primaryContact: {
        name: 'Jane Doe',
        relation: 'Mother',
        phone: '+1 (555) 987-6543'
      },
      secondaryContact: {
        name: 'Robert Doe',
        relation: 'Father',
        phone: '+1 (555) 987-6544'
      },
      medical: {
        bloodType: 'O+',
        allergies: 'None Known',
        conditions: 'None',
        insurance: 'University Health Plan'
      }
    }
  });

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    setEditingSection(null);
    // Here you would typically save to backend
    console.log('Profile saved:', profileData);
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSection(null);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
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

  const handleNestedInputChange = (section, subsection, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleDownloadCV = () => {
    // Create a simple CV download
    const cvContent = `
Name: ${profileData.personal.fullName}
Email: ${profileData.contact.email}
Phone: ${profileData.contact.phone}
Program: ${profileData.academic.program}
GPA: ${profileData.academic.gpa}/4.0
Expected Graduation: ${profileData.academic.expectedGraduation}
    `;
    
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileData.personal.fullName.replace(' ', '_')}_CV.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profileData.personal.fullName} - Student Profile`,
        text: `Check out ${profileData.personal.fullName}'s academic profile`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Here you would typically upload to server
        console.log('Photo uploaded:', file.name);
        alert('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleNotification = (type) => {
    setProfileData(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        [type]: !prev.communication[type]
      }
    }));
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item active">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Profile</h1>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Profile Header */}
          <div className="dashboard-section">
            <div className="profile-header">
              <div className="profile-photo-section">
                <div className="profile-photo-large">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                    alt="Student Photo" 
                    className="profile-image"
                  />
                  <div className="photo-upload-overlay">
                    <label className="upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H16L23 10V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 10H16V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Change Photo
                    </label>
                  </div>
                </div>
                <div className="profile-status">
                  <div className="status-indicator active"></div>
                  <span>Active Student</span>
                </div>
              </div>
              <div className="profile-basic-info">
                {editingSection === 'header' ? (
                  <div className="editable-field">
                    <input
                      type="text"
                      value={profileData.personal.fullName}
                      onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                      className="edit-input"
                    />
                  </div>
                ) : (
                  <h1>{profileData.personal.fullName}</h1>
                )}
                <p className="student-id">Student ID: CS2024001</p>
                <p className="academic-level">{profileData.academic.year} • {profileData.academic.major} • {profileData.academic.semester}</p>
                <div className="profile-badges">
                  <span className="badge academic">Dean's List</span>
                  <span className="badge achievement">Honor Student</span>
                  <span className="badge activity">Active Member</span>
                </div>
              </div>
              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button className="btn primary" onClick={handleSaveProfile}>Save Changes</button>
                    <button className="btn ghost" onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn primary" onClick={handleEditProfile}>Edit Profile</button>
                    <button className="btn ghost" onClick={handleDownloadCV}>Download CV</button>
                    <button className="btn ghost" onClick={handleShareProfile}>Share Profile</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="dashboard-section">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-header">
                  <h3>Basic Details</h3>
                  <button 
                    className="edit-icon"
                    onClick={() => handleEditSection(editingSection === 'personal' ? null : 'personal')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    {editingSection === 'personal' ? (
                      <input
                        type="text"
                        value={profileData.personal.fullName}
                        onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.personal.fullName}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date of Birth</span>
                    {editingSection === 'personal' ? (
                      <input
                        type="text"
                        value={profileData.personal.dateOfBirth}
                        onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.personal.dateOfBirth}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    {editingSection === 'personal' ? (
                      <select
                        value={profileData.personal.gender}
                        onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                        className="edit-select"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <span className="info-value">{profileData.personal.gender}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nationality</span>
                    {editingSection === 'personal' ? (
                      <input
                        type="text"
                        value={profileData.personal.nationality}
                        onChange={(e) => handleInputChange('personal', 'nationality', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.personal.nationality}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Blood Type</span>
                    {editingSection === 'personal' ? (
                      <select
                        value={profileData.personal.bloodType}
                        onChange={(e) => handleInputChange('personal', 'bloodType', e.target.value)}
                        className="edit-select"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <span className="info-value">{profileData.personal.bloodType}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <h3>Contact Information</h3>
                  <button 
                    className="edit-icon"
                    onClick={() => handleEditSection(editingSection === 'contact' ? null : 'contact')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    {editingSection === 'contact' ? (
                      <input
                        type="email"
                        value={profileData.contact.email}
                        onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.contact.email}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    {editingSection === 'contact' ? (
                      <input
                        type="tel"
                        value={profileData.contact.phone}
                        onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.contact.phone}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Address</span>
                    {editingSection === 'contact' ? (
                      <textarea
                        value={profileData.contact.address}
                        onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
                        className="edit-textarea"
                        rows="2"
                      />
                    ) : (
                      <span className="info-value">{profileData.contact.address}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Emergency Contact</span>
                    {editingSection === 'contact' ? (
                      <input
                        type="text"
                        value={profileData.contact.emergencyContact}
                        onChange={(e) => handleInputChange('contact', 'emergencyContact', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{profileData.contact.emergencyContact}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="dashboard-section">
            <h2>Academic Information</h2>
            <div className="academic-grid">
              <div className="academic-card">
                <div className="academic-header">
                  <h3>Current Academic Status</h3>
                  <span className="status-badge enrolled">Enrolled</span>
                </div>
                <div className="academic-content">
                  <div className="academic-item">
                    <span className="academic-label">Program</span>
                    <span className="academic-value">Bachelor of Computer Science</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Major</span>
                    <span className="academic-value">Computer Science</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Minor</span>
                    <span className="academic-value">Mathematics</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Year</span>
                    <span className="academic-value">3rd Year (Junior)</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Semester</span>
                    <span className="academic-value">Fall 2024</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Expected Graduation</span>
                    <span className="academic-value">May 2025</span>
                  </div>
                </div>
              </div>

              <div className="academic-card">
                <div className="academic-header">
                  <h3>Academic Performance</h3>
                  <span className="status-badge excellent">Excellent</span>
                </div>
                <div className="academic-content">
                  <div className="academic-item">
                    <span className="academic-label">Current GPA</span>
                    <span className="academic-value gpa">3.85/4.0</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Credits Completed</span>
                    <span className="academic-value">87/120</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Credits This Semester</span>
                    <span className="academic-value">15</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Academic Standing</span>
                    <span className="academic-value">Good Standing</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Dean's List</span>
                    <span className="academic-value">4 Semesters</span>
                  </div>
                  <div className="academic-item">
                    <span className="academic-label">Honor Society</span>
                    <span className="academic-value">Phi Beta Kappa</span>
                  </div>
                </div>
              </div>

              <div className="academic-card">
                <div className="academic-header">
                  <h3>Current Courses</h3>
                  <span className="status-badge active">5 Active</span>
                </div>
                <div className="courses-list">
                  <div className="course-item">
                    <div className="course-info">
                      <span className="course-code">CS-301</span>
                      <span className="course-name">Data Structures & Algorithms</span>
                    </div>
                    <span className="course-credits">3 Credits</span>
                  </div>
                  <div className="course-item">
                    <div className="course-info">
                      <span className="course-code">CS-302</span>
                      <span className="course-name">Database Systems</span>
                    </div>
                    <span className="course-credits">3 Credits</span>
                  </div>
                  <div className="course-item">
                    <div className="course-info">
                      <span className="course-code">MATH-301</span>
                      <span className="course-name">Linear Algebra</span>
                    </div>
                    <span className="course-credits">3 Credits</span>
                  </div>
                  <div className="course-item">
                    <div className="course-info">
                      <span className="course-code">CS-303</span>
                      <span className="course-name">Software Engineering</span>
                    </div>
                    <span className="course-credits">3 Credits</span>
                  </div>
                  <div className="course-item">
                    <div className="course-info">
                      <span className="course-code">PHIL-201</span>
                      <span className="course-name">Ethics in Technology</span>
                    </div>
                    <span className="course-credits">3 Credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="dashboard-section">
            <h2>Communication Preferences</h2>
            <div className="communication-grid">
              <div className="communication-card">
                <h3>Notification Settings</h3>
                <div className="notification-settings">
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Email Notifications</span>
                      <span className="setting-desc">Receive updates via email</span>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={profileData.communication.emailNotifications}
                        onChange={() => handleToggleNotification('emailNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">SMS Alerts</span>
                      <span className="setting-desc">Get urgent updates via SMS</span>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={profileData.communication.smsAlerts}
                        onChange={() => handleToggleNotification('smsAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Push Notifications</span>
                      <span className="setting-desc">Mobile app notifications</span>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={profileData.communication.pushNotifications}
                        onChange={() => handleToggleNotification('pushNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="communication-card">
                <h3>Preferred Contact Methods</h3>
                <div className="contact-methods">
                  <div className="method-item">
                    <div className="method-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C20.5304 4 21.0391 4.21071 21.4142 4.58579C21.7893 4.96086 22 5.46957 22 6V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="method-info">
                      <span className="method-name">Email</span>
                      <span className="method-value">Primary</span>
                    </div>
                  </div>
                  <div className="method-item">
                    <div className="method-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.59531 1.99522 8.06691 2.16708 8.43388 2.48353C8.80085 2.79999 9.04207 3.23945 9.11 3.72C9.23662 4.68007 9.47144 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="method-info">
                      <span className="method-name">Phone</span>
                      <span className="method-value">Secondary</span>
                    </div>
                  </div>
                  <div className="method-item">
                    <div className="method-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="method-info">
                      <span className="method-name">Portal Message</span>
                      <span className="method-value">Tertiary</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Information */}
          <div className="dashboard-section">
            <h2>Emergency Information</h2>
            <div className="emergency-info">
              <div className="emergency-card">
                <h3>Emergency Contacts</h3>
                <div className="emergency-contacts">
                  <div className="contact-item">
                    <div className="contact-avatar">JD</div>
                    <div className="contact-details">
                      <span className="contact-name">Jane Doe</span>
                      <span className="contact-relation">Mother</span>
                      <span className="contact-phone">+1 (555) 987-6543</span>
                    </div>
                    <span className="contact-priority primary">Primary</span>
                  </div>
                  <div className="contact-item">
                    <div className="contact-avatar">RD</div>
                    <div className="contact-details">
                      <span className="contact-name">Robert Doe</span>
                      <span className="contact-relation">Father</span>
                      <span className="contact-phone">+1 (555) 987-6544</span>
                    </div>
                    <span className="contact-priority secondary">Secondary</span>
                  </div>
                </div>
              </div>
              <div className="emergency-card">
                <h3>Medical Information</h3>
                <div className="medical-info">
                  <div className="medical-item">
                    <span className="medical-label">Blood Type</span>
                    <span className="medical-value">O+</span>
                  </div>
                  <div className="medical-item">
                    <span className="medical-label">Allergies</span>
                    <span className="medical-value">None Known</span>
                  </div>
                  <div className="medical-item">
                    <span className="medical-label">Medical Conditions</span>
                    <span className="medical-value">None</span>
                  </div>
                  <div className="medical-item">
                    <span className="medical-label">Insurance Provider</span>
                    <span className="medical-value">University Health Plan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyInstructorsPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item active">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>My Instructors</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Your Instructors</h2>
            <div className="instructors-list">
              <div className="instructor-card">
                <h3>Dr. Smith</h3>
                <p>Mathematics</p>
              </div>
              <div className="instructor-card">
                <h3>Prof. Johnson</h3>
                <p>Programming</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item active">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Schedule</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Class Schedule</h2>
            <div className="schedule-grid">
              <div className="schedule-item">
                <h3>Monday</h3>
                <p>Mathematics - 9:00 AM</p>
                <p>Programming - 2:00 PM</p>
              </div>
              <div className="schedule-item">
                <h3>Tuesday</h3>
                <p>Data Structures - 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseAnalysisPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item active">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Course Analysis</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Course Performance Analysis</h2>
            <div className="analysis-grid">
              <div className="analysis-card">
                <h3>Mathematics</h3>
                <p>Score: 92%</p>
                <p>Status: Excellent</p>
              </div>
              <div className="analysis-card">
                <h3>Programming</h3>
                <p>Score: 88%</p>
                <p>Status: Good</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AcademicPerformancePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item active">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Academic Performance</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Academic Performance Overview</h2>
            <div className="performance-metrics">
              <div className="metric-card">
                <h3>Overall GPA</h3>
                <p>3.8/4.0</p>
              </div>
              <div className="metric-card">
                <h3>Attendance Rate</h3>
                <p>95%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourcesPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item active">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
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
            <h2>Learning Resources</h2>
            <div className="resources-grid">
              <div className="resource-card">
                <h3>Study Materials</h3>
                <p>Access your course materials and study guides</p>
              </div>
              <div className="resource-card">
                <h3>Video Tutorials</h3>
                <p>Watch recorded lectures and tutorials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyStudentsPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {(session?.name || 'Instructor').split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{session?.name || 'Instructor'}</h4>
            <p>Instructor</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Teaching</h5>
            <Link to="/my-students" className="nav-item active">
              <span className="nav-text">My Students</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>My Students</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Student Management</h2>
            <div className="students-grid">
              <div className="student-card">
                <h3>John Doe</h3>
                <p>Computer Science</p>
                <p>Grade: A</p>
              </div>
              <div className="student-card">
                <h3>Jane Smith</h3>
                <p>Computer Science</p>
                <p>Grade: B+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

function StudentDashboard(){
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  // Mock data for demonstration
  const studentData = {
    name: session?.name || 'John Doe',
    course: 'Computer Science',
    year: '2024',
    semester: 'Spring',
    photo: '👨‍🎓',
    attendance: 87,
    avgQuizScore: 78,
    totalStudyHours: 142,
    engagementScore: 82,
    riskLevel: 'Low',
    engagementTrend: [
      { week: 'Week 1', score: 75 },
      { week: 'Week 2', score: 78 },
      { week: 'Week 3', score: 82 },
      { week: 'Week 4', score: 85 },
      { week: 'Week 5', score: 80 },
      { week: 'Week 6', score: 88 },
      { week: 'Week 7', score: 82 }
    ],
    timeDistribution: [
      { activity: 'Videos', hours: 45, percentage: 32 },
      { activity: 'Quizzes', hours: 28, percentage: 20 },
      { activity: 'Reading', hours: 35, percentage: 25 },
      { activity: 'Assignments', hours: 34, percentage: 23 }
    ],
    performanceData: [
      { subject: 'Mathematics', score: 85, status: 'good' },
      { subject: 'Programming', score: 92, status: 'excellent' },
      { subject: 'Data Structures', score: 78, status: 'good' },
      { subject: 'Algorithms', score: 65, status: 'needs-improvement' },
      { subject: 'Database', score: 88, status: 'good' }
    ],
    recommendations: [
      { type: 'video', title: 'Advanced Algorithm Techniques', reason: 'Based on your Algorithms performance' },
      { type: 'reading', title: 'Data Structures Fundamentals', reason: 'To strengthen your foundation' },
      { type: 'quiz', title: 'Practice Quiz: Sorting Algorithms', reason: 'Targeted practice for weak areas' }
    ]
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {studentData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{studentData.name}</h4>
            <p>{studentData.course}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item active">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Student Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{studentData.engagementScore}%</span>
                <span className="stat-label">Engagement</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{studentData.riskLevel}</span>
                <span className="stat-label">Risk Level</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">

      {/* Overview Section */}
      <div className="dashboard-section">
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-photo">{studentData.photo}</div>
            <div className="profile-details">
              <h3>{studentData.name}</h3>
              <p>{studentData.course} • {studentData.year} {studentData.semester}</p>
            </div>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon attendance"></div>
            <div className="stat-content">
              <div className="stat-value">{studentData.attendance}%</div>
              <div className="stat-label">Attendance</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon quiz"></div>
            <div className="stat-content">
              <div className="stat-value">{studentData.avgQuizScore}%</div>
              <div className="stat-label">Avg Quiz Score</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon study"></div>
            <div className="stat-content">
              <div className="stat-value">{studentData.totalStudyHours}h</div>
              <div className="stat-label">Study Hours</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon engagement"></div>
            <div className="stat-content">
              <div className="stat-value">{studentData.engagementScore}%</div>
              <div className="stat-label">Engagement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs & Charts Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Analytics & Performance</h2>
        
        <div className="charts-grid">
          {/* Engagement Trend Chart */}
          <div className="chart-card">
            <h3>Engagement Trend</h3>
            <div className="line-chart">
              <div className="chart-container">
                {studentData.engagementTrend.map((point, index) => (
                  <div key={index} className="chart-point" style={{
                    left: `${(index / (studentData.engagementTrend.length - 1)) * 100}%`,
                    bottom: `${point.score}%`
                  }}>
                    <div className="point-value">{point.score}%</div>
                    <div className="point-dot"></div>
                  </div>
                ))}
                <div className="chart-line"></div>
              </div>
              <div className="chart-labels">
                {studentData.engagementTrend.map((point, index) => (
                  <div key={index} className="chart-label">{point.week}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Time Distribution Chart */}
          <div className="chart-card">
            <h3>Time Spent Distribution</h3>
            <div className="pie-chart">
              <div className="pie-container">
                {studentData.timeDistribution.map((item, index) => (
                  <div key={index} className="pie-segment" style={{
                    '--percentage': item.percentage,
                    '--color': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]
                  }}>
                    <div className="segment-label">{item.activity}</div>
                    <div className="segment-percentage">{item.percentage}%</div>
                  </div>
                ))}
              </div>
              <div className="pie-legend">
                {studentData.timeDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-color" style={{
                      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]
                    }}></div>
                    <span>{item.activity}: {item.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Comparison Chart */}
          <div className="chart-card">
            <h3>Performance Comparison</h3>
            <div className="bar-chart">
              {studentData.performanceData.map((subject, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-label">{subject.subject}</div>
                  <div className="bar-container">
                    <div className={`bar ${subject.status}`} style={{ width: `${subject.score}%` }}>
                      <span className="bar-value">{subject.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Level Indicator */}
          <div className="chart-card">
            <h3>Risk Level Indicator</h3>
            <div className="gauge-chart">
              <div className={`gauge ${studentData.riskLevel.toLowerCase()}`}>
                <div className="gauge-needle"></div>
                <div className="gauge-center"></div>
              </div>
              <div className="gauge-labels">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <div className="risk-status">
                <span className={`risk-badge ${studentData.riskLevel.toLowerCase()}`}>
                  {studentData.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="dashboard-section">
        <h2 className="section-title">Suggested for You</h2>
        <div className="recommendations-grid">
          {studentData.recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <div className={`rec-icon ${rec.type}`}></div>
              <div className="rec-content">
                <h4>{rec.title}</h4>
                <p>{rec.reason}</p>
                <button className="btn primary small">Start Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>



        </div>
      </div>
    </div>
  );
}

function FeedbackPage(){
  const session = readSession();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    lessonClarity: 4,
    quizDifficulty: 3,
    satisfaction: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const handleFeedbackChange = (field, value) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const submitFeedback = () => {
    alert('Thank you for your feedback! It helps us improve your learning experience.');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item active">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Feedback</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2 className="section-title">Provide Your Feedback</h2>
            <p className="section-description">
              Your feedback helps us improve the learning experience. Please take a moment to share your thoughts.
            </p>
            
            <div className="feedback-card">
              <div className="feedback-item">
                <label>Lesson Clarity</label>
                <p className="feedback-description">How clear and understandable were the lessons?</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star ${star <= feedback.lessonClarity ? 'active' : ''}`}
                      onClick={() => handleFeedbackChange('lessonClarity', star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="rating-label">
                  {feedback.lessonClarity === 1 && 'Very Unclear'}
                  {feedback.lessonClarity === 2 && 'Unclear'}
                  {feedback.lessonClarity === 3 && 'Neutral'}
                  {feedback.lessonClarity === 4 && 'Clear'}
                  {feedback.lessonClarity === 5 && 'Very Clear'}
                </div>
              </div>
              
              <div className="feedback-item">
                <label>Quiz Difficulty</label>
                <p className="feedback-description">How would you rate the difficulty level of the quizzes?</p>
                <div className="difficulty-slider">
                  <span>Too Easy</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={feedback.quizDifficulty}
                    onChange={(e) => handleFeedbackChange('quizDifficulty', parseInt(e.target.value))}
                    className="slider"
                  />
                  <span>Too Hard</span>
                  <div className="slider-value">{feedback.quizDifficulty}/5</div>
                </div>
                <div className="rating-label">
                  {feedback.quizDifficulty === 1 && 'Too Easy'}
                  {feedback.quizDifficulty === 2 && 'Easy'}
                  {feedback.quizDifficulty === 3 && 'Just Right'}
                  {feedback.quizDifficulty === 4 && 'Hard'}
                  {feedback.quizDifficulty === 5 && 'Too Hard'}
                </div>
              </div>
              
              <div className="feedback-item">
                <label>Overall Satisfaction</label>
                <p className="feedback-description">How satisfied are you with your learning experience?</p>
                <div className="satisfaction-buttons">
                  <button
                    className={`satisfaction-btn ${feedback.satisfaction ? 'active' : ''}`}
                    onClick={() => handleFeedbackChange('satisfaction', true)}
                  >
                    Satisfied
                  </button>
                  <button
                    className={`satisfaction-btn ${!feedback.satisfaction ? 'active' : ''}`}
                    onClick={() => handleFeedbackChange('satisfaction', false)}
                  >
                    Not Satisfied
                  </button>
                </div>
              </div>

              <div className="feedback-item">
                <label>Additional Comments</label>
                <p className="feedback-description">Any additional feedback or suggestions?</p>
                <textarea 
                  className="feedback-textarea"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  rows="4"
                />
              </div>
              
              <div className="feedback-actions">
                <button className="btn primary" onClick={submitFeedback}>
                  Submit Feedback
                </button>
                <button className="btn ghost" onClick={() => {
                  setFeedback({
                    lessonClarity: 4,
                    quizDifficulty: 3,
                    satisfaction: true
                  });
                }}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyReport(){
  const session = readSession();
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  // Mock data for demonstration
  const studentData = {
    name: session?.name || 'John Doe',
    course: 'Computer Science',
    year: '2024',
    semester: 'Spring',
    photo: '👨‍🎓',
    attendance: 87,
    avgQuizScore: 78,
    totalStudyHours: 142,
    engagementScore: 82,
    riskLevel: 'Low',
    engagementTrend: [
      { week: 'Week 1', score: 75 },
      { week: 'Week 2', score: 78 },
      { week: 'Week 3', score: 82 },
      { week: 'Week 4', score: 85 },
      { week: 'Week 5', score: 80 },
      { week: 'Week 6', score: 88 },
      { week: 'Week 7', score: 82 }
    ],
    timeDistribution: [
      { activity: 'Videos', hours: 45, percentage: 32 },
      { activity: 'Quizzes', hours: 28, percentage: 20 },
      { activity: 'Reading', hours: 35, percentage: 25 },
      { activity: 'Assignments', hours: 34, percentage: 23 }
    ],
    performanceData: [
      { subject: 'Mathematics', score: 85, status: 'good' },
      { subject: 'Programming', score: 92, status: 'excellent' },
      { subject: 'Data Structures', score: 78, status: 'good' },
      { subject: 'Algorithms', score: 65, status: 'needs-improvement' },
      { subject: 'Database', score: 88, status: 'good' }
    ],
    recommendations: [
      { type: 'video', title: 'Advanced Algorithm Techniques', reason: 'Based on your Algorithms performance' },
      { type: 'reading', title: 'Data Structures Fundamentals', reason: 'To strengthen your foundation' },
      { type: 'quiz', title: 'Practice Quiz: Sorting Algorithms', reason: 'Targeted practice for weak areas' }
    ]
  };

  const downloadReport = () => {
    setShowReportModal(true);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleCourseAction = (course, action) => {
    if (action === 'view') {
      handleCourseClick(course);
    } else if (action === 'download') {
      alert(`Downloading detailed report for ${course.subject}...`);
    }
  };

  const handleCardHover = (index) => {
    setHoveredCard(index);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {studentData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{studentData.name}</h4>
            <p>{studentData.course}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Academic</h5>
            <Link to="/my-instructors" className="nav-item">
              <span className="nav-text">My Instructors</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item active">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Weekly Report</h1>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{studentData.engagementScore}%</span>
                <span className="stat-label">Engagement</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{studentData.riskLevel}</span>
                <span className="stat-label">Risk Level</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Overall Report Graph Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Overall Performance Trend</h2>
            <div className="chart-card">
              <h3>Weekly Performance Overview</h3>
              <div className="line-chart">
                <div className="chart-container">
                  {studentData.engagementTrend.map((point, index) => (
                    <div key={index} className="chart-point" style={{
                      left: `${(index / (studentData.engagementTrend.length - 1)) * 100}%`,
                      bottom: `${point.score}%`
                    }}>
                      <div className="point-value">{point.score}%</div>
                      <div className="point-dot"></div>
                    </div>
                  ))}
                  <div className="chart-line"></div>
                </div>
                <div className="chart-labels">
                  {studentData.engagementTrend.map((point, index) => (
                    <div key={index} className="chart-label">{point.week}</div>
                  ))}
                </div>
              </div>
              <div className="chart-summary">
                <div className="summary-stat">
                  <span className="stat-label">Current Score:</span>
                  <span className="stat-value">{studentData.engagementScore}%</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Trend:</span>
                  <span className="stat-value positive">↗ Improving</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Peak Score:</span>
                  <span className="stat-value">88%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Report Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Course Performance Report</h2>
              <div className="section-actions">
                <button className="btn-icon" title="Filter courses">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="btn-icon" title="Sort by performance">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="btn-icon" title="View all courses">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 19H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="course-stats-overview">
              <div className="stat-box">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">{studentData.performanceData.length}</span>
                  <span className="stat-label">Total Courses</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {Math.round(studentData.performanceData.reduce((acc, course) => acc + course.score, 0) / studentData.performanceData.length)}%
                  </span>
                  <span className="stat-label">Average Score</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {studentData.performanceData.filter(course => course.status === 'excellent').length}
                  </span>
                  <span className="stat-label">Excellent</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {studentData.performanceData.filter(course => course.status === 'needs-improvement').length}
                  </span>
                  <span className="stat-label">Needs Attention</span>
                </div>
              </div>
            </div>

            <div className="course-report-grid">
              {studentData.performanceData.map((course, index) => (
                <div 
                  key={index} 
                  className={`course-report-card ${course.status} hover-lift ${hoveredCard === index ? 'hovered' : ''}`}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="card-header">
                    <div className="course-icon">
                      {course.subject === 'Mathematics' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Programming' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Data Structures' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Algorithms' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : course.subject === 'Database' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12C3 14.2 6.6 16 12 16C17.4 16 21 14.2 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 5V19C3 21.2 6.6 23 12 23C17.4 23 21 21.2 21 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="course-info">
                      <h4>{course.subject}</h4>
                      <p className="course-code">CS-{100 + index}</p>
                    </div>
                    <div className="course-actions">
                      <button 
                        className="action-btn" 
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseAction(course, 'view');
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn" 
                        title="Download report"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseAction(course, 'download');
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="performance-section">
                      <div className="score-display">
                        <div className="score-circle">
                          <div className="score-value">{course.score}%</div>
                          <div className="score-label">Score</div>
                        </div>
                        <div className="score-details">
                          <div className={`performance-badge ${course.status}`}>
                            {course.status === 'excellent' ? '🌟 Excellent' : 
                             course.status === 'good' ? '✅ Good' : '⚠️ Needs Improvement'}
                          </div>
                          <div className="score-trend">
                            {course.score > 80 ? '↗️' : course.score > 60 ? '→' : '↘️'} 
                            {course.score > 80 ? ' Improving' : course.score > 60 ? ' Stable' : ' Declining'}
                          </div>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Overall Progress</span>
                          <span>{course.score}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${course.status}`} 
                              style={{ width: `${course.score}%` }}
                            ></div>
                            <div className="progress-glow"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="course-metrics">
                      <div className="metric-row">
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">8/10</span>
                            <span className="metric-label">Assignments</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">6/8</span>
                            <span className="metric-label">Quizzes</span>
                          </div>
                        </div>
                      </div>
                      <div className="metric-row">
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5904 20.2 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">85%</span>
                            <span className="metric-label">Participation</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="metric-content">
                            <span className="metric-value">24h</span>
                            <span className="metric-label">Study Time</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="course-insights">
                      <div className="insight-item">
                        <span className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="insight-text">
                          {course.status === 'excellent' ? 'Outstanding performance! Keep up the great work.' :
                           course.status === 'good' ? 'Good progress. Consider focusing on weak areas.' :
                           'Focus needed. Consider additional study time and resources.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="btn-outline">
                      View Detailed Report
                    </button>
                    <button className={`btn-action ${course.status}`}>
                      {course.status === 'needs-improvement' ? 'Get Help' : 'Continue'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="course-actions-footer">
              <button className="btn-primary">
                📊 Generate All Course Reports
              </button>
              <button className="btn-secondary">
                📈 Compare Performance
              </button>
              <button className="btn-outline">
                📤 Export All Data
              </button>
            </div>
          </div>

          {/* Reports Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Generate Reports</h2>
            <div className="reports-card">
              <div className="report-info">
                <h3>Comprehensive Progress Report</h3>
                <p>Download your detailed progress report including performance trends, course analysis, and personalized recommendations.</p>
                <div className="report-features">
                  <span>Performance Analytics</span>
                  <span>Engagement Trends</span>
                  <span>Course Breakdown</span>
                  <span>Risk Assessment</span>
                  <span>Recommendations</span>
                  <span>Study Insights</span>
                </div>
              </div>
              <div className="report-actions">
                <button className="btn primary" onClick={downloadReport}>
                  Download PDF Report
                </button>
                <button className="btn ghost">
                  Export Excel Data
                </button>
                <button className="btn ghost">
                  Share Report
                </button>
              </div>
            </div>
          </div>

          {/* Course Details Modal */}
          {showCourseDetails && selectedCourse && (
            <div className="modal-overlay" onClick={() => setShowCourseDetails(false)}>
              <div className="modal-content course-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{selectedCourse.subject} - Detailed Report</h3>
                  <button className="modal-close" onClick={() => setShowCourseDetails(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="course-detail-content">
                    <div className="course-detail-header">
                      <div className="course-detail-icon">
                        {selectedCourse.subject === 'Mathematics' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Programming' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Data Structures' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Algorithms' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : selectedCourse.subject === 'Database' ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 12C3 14.2 6.6 16 12 16C17.4 16 21 14.2 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 5V19C3 21.2 6.6 23 12 23C17.4 23 21 21.2 21 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="course-detail-info">
                        <h4>{selectedCourse.subject}</h4>
                        <p>Computer Science Course</p>
                        <div className={`performance-badge ${selectedCourse.status}`}>
                          {selectedCourse.status === 'excellent' ? '🌟 Excellent' : 
                           selectedCourse.status === 'good' ? '✅ Good' : '⚠️ Needs Improvement'}
                        </div>
                      </div>
                    </div>

                    <div className="course-detail-metrics">
                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Overall Score</span>
                        </div>
                        <div className="metric-value">{selectedCourse.score}%</div>
                        <div className="metric-progress">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${selectedCourse.status}`} 
                              style={{ width: `${selectedCourse.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Assignments</span>
                        </div>
                        <div className="metric-value">8/10</div>
                        <div className="metric-subtitle">80% Completion</div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Quizzes</span>
                        </div>
                        <div className="metric-value">6/8</div>
                        <div className="metric-subtitle">75% Completion</div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5904 20.2 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="metric-title">Participation</span>
                        </div>
                        <div className="metric-value">85%</div>
                        <div className="metric-subtitle">Active Engagement</div>
                      </div>
                    </div>

                    <div className="course-detail-insights">
                      <h5>Performance Insights</h5>
                      <div className="insights-list">
                        <div className="insight-item">
                          <span className="insight-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="insight-content">
                            <strong>Strengths:</strong>
                            <p>
                              {selectedCourse.status === 'excellent' ? 'Consistent high performance across all areas' :
                               selectedCourse.status === 'good' ? 'Good understanding of core concepts' :
                               'Some areas showing improvement potential'}
                            </p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="insight-content">
                            <strong>Focus Areas:</strong>
                            <p>
                              {selectedCourse.status === 'needs-improvement' ? 'Consider additional study time and practice' :
                               'Continue current study approach for optimal results'}
                            </p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="insight-content">
                            <strong>Recommendations:</strong>
                            <p>
                              {selectedCourse.status === 'excellent' ? 'Maintain current study habits and consider advanced topics' :
                               selectedCourse.status === 'good' ? 'Focus on weak areas while maintaining strengths' :
                               'Increase study time and seek additional resources'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-detail-actions">
                    <button className="btn-primary" onClick={() => {
                      alert(`Generating detailed report for ${selectedCourse.subject}...`);
                    }}>
                      📄 Generate Report
                    </button>
                    <button className="btn-secondary" onClick={() => {
                      alert(`Downloading data for ${selectedCourse.subject}...`);
                    }}>
                      📥 Download Data
                    </button>
                    <button className="btn-outline" onClick={() => setShowCourseDetails(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Modal */}
          {showReportModal && (
            <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
              <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Comprehensive Progress Report</h3>
                  <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="report-preview">
                    <div className="report-header">
                      <h4>Student Progress Report</h4>
                      <p>Generated on {new Date().toLocaleDateString()}</p>
                      <p>Student: {studentData.name} | Course: {studentData.course}</p>
                    </div>
                    
                    <div className="report-summary">
                      <h5>Overall Performance Summary</h5>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Overall Performance:</span>
                          <span className="summary-value good">Good (82%)</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Engagement Trend:</span>
                          <span className="summary-value positive">↗ Improving</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Risk Level:</span>
                          <span className="summary-value low">Low Risk</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Study Hours:</span>
                          <span className="summary-value">{studentData.totalStudyHours}h</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Attendance:</span>
                          <span className="summary-value">{studentData.attendance}%</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Quiz Average:</span>
                          <span className="summary-value">{studentData.avgQuizScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="report-courses">
                      <h5>Course Performance Breakdown</h5>
                      <div className="course-performance-list">
                        {studentData.performanceData.map((course, index) => (
                          <div key={index} className="course-performance-item">
                            <div className="course-name">{course.subject}</div>
                            <div className="course-score">
                              <div className="score-bar">
                                <div 
                                  className={`score-fill ${course.status}`} 
                                  style={{ width: `${course.score}%` }}
                                ></div>
                              </div>
                              <span className="score-text">{course.score}%</span>
                            </div>
                            <div className={`course-status ${course.status}`}>
                              {course.status === 'excellent' ? 'Excellent' : 
                               course.status === 'good' ? 'Good' : 'Needs Improvement'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="report-trends">
                      <h5>Weekly Performance Trend</h5>
                      <div className="trend-chart-mini">
                        {studentData.engagementTrend.map((point, index) => (
                          <div key={index} className="trend-point" style={{
                            left: `${(index / (studentData.engagementTrend.length - 1)) * 100}%`,
                            bottom: `${point.score}%`
                          }}>
                            <div className="trend-dot"></div>
                            <div className="trend-value">{point.score}%</div>
                          </div>
                        ))}
                        <div className="trend-line"></div>
                      </div>
                    </div>

                    <div className="report-recommendations">
                      <h5>Key Recommendations & Next Steps</h5>
                      <ul>
                        <li>Focus on Algorithm concepts - current score: 65% (Priority: High)</li>
                        <li>Continue strong performance in Programming (92%) - maintain current study habits</li>
                        <li>Increase study time for Data Structures to reach 85%+ target</li>
                        <li>Maintain consistent study schedule - current 142 hours is good</li>
                        <li>Consider joining study groups for challenging subjects</li>
                      </ul>
                    </div>

                    <div className="report-insights">
                      <h5>Study Insights</h5>
                      <div className="insights-grid">
                        <div className="insight-item">
                          <span className="insight-icon">📚</span>
                          <div>
                            <strong>Time Distribution</strong>
                            <p>Most time spent on Videos (32%), followed by Reading (25%)</p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">🎯</span>
                          <div>
                            <strong>Focus Areas</strong>
                            <p>Algorithms needs attention, Programming is your strength</p>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">📈</span>
                          <div>
                            <strong>Progress Trend</strong>
                            <p>Overall improvement trend with peak at Week 6 (88%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="report-actions">
                    <button className="btn primary" onClick={() => {
                      // Simulate PDF generation and download
                      const reportData = {
                        student: studentData.name,
                        course: studentData.course,
                        date: new Date().toLocaleDateString(),
                        performance: studentData.performanceData,
                        trends: studentData.engagementTrend,
                        summary: {
                          overall: studentData.engagementScore,
                          attendance: studentData.attendance,
                          studyHours: studentData.totalStudyHours,
                          riskLevel: studentData.riskLevel
                        }
                      };
                      console.log('Generating PDF with data:', reportData);
                      alert('Comprehensive PDF report downloaded successfully!');
                      setShowReportModal(false);
                    }}>
                      📄 Download PDF Report
                    </button>
                    <button className="btn ghost" onClick={() => {
                      alert('Excel data exported successfully!');
                    }}>
                      📊 Export Excel Data
                    </button>
                    <button className="btn ghost" onClick={() => setShowReportModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InstructorDashboard(){
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-shield">L</div>
            <span className="brand-text">Learnlytics</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {(session?.name || 'Instructor').split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{session?.name || 'Instructor'}</h4>
            <p>Instructor</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5>Main</h5>
            <Link to="/overview" className="nav-item active">
              <span className="nav-text">Overview</span>
            </Link>
            <Link to="/risk-status" className="nav-item">
              <span className="nav-text">Risk Status</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-text">Profile</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Teaching</h5>
            <Link to="/my-students" className="nav-item">
              <span className="nav-text">My Students</span>
            </Link>
            <Link to="/schedule" className="nav-item">
              <span className="nav-text">Schedule</span>
            </Link>
            <Link to="/course-analysis" className="nav-item">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <Link to="/academic-performance" className="nav-item">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <Link to="/feedback" className="nav-item">
              <span className="nav-text">Feedback</span>
            </Link>
            <Link to="/resources" className="nav-item">
              <span className="nav-text">Resources</span>
            </Link>
            <Link to="/weekly-report" className="nav-item">
              <span className="nav-text">Weekly Report</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <h1>Instructor Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">24</span>
                <span className="stat-label">Students</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">Courses</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2>Welcome, {session?.name || 'Instructor'}!</h2>
            <p>You are logged in as an instructor. This is your dashboard where you can manage your courses, students, and view analytics.</p>
            
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon students"></div>
                <div className="stat-content">
                  <div className="stat-value">24</div>
                  <div className="stat-label">Total Students</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon courses"></div>
                <div className="stat-content">
                  <div className="stat-value">3</div>
                  <div className="stat-label">Active Courses</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon engagement"></div>
                <div className="stat-content">
                  <div className="stat-value">87%</div>
                  <div className="stat-label">Avg Engagement</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon risk"></div>
                <div className="stat-content">
                  <div className="stat-value">2</div>
                  <div className="stat-label">At Risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

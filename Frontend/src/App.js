import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavIcons from './NavIcons';
import Help from './Help';
import About from './About';
import Resources from './Resources';
import ProfileNew from './components/ProfileNew';
import Contact from './Contact';
import AIChatbotModal from './components/AI_Chat_Bot';
import OverviewPage from './components/Overview_Page';
import InstructorDashboard from './components/Instructor_Dashboard';
import WeeklyReport from './components/Weekly_report';
import RiskStatusPage from './components/RiskStatusPage';
import WebinarRegistrationModal from './components/WebinarRegistrationModal';
import PaymentFormModal from './components/PaymentFormModal';

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar
} from "recharts";


// Auth helpers
export const SESSION_KEY = 'learnlytics_session';
export const API_URL = 'http://localhost:5000/api/auth';


export function readSession(){
  try { 
    const raw = localStorage.getItem(SESSION_KEY); 
    return raw ? JSON.parse(raw) : null; 
  } catch { 
    return null; 
  }
}

export function writeSession(session){ 
  localStorage.setItem(SESSION_KEY, JSON.stringify(session)); 
}

export function clearSession(){ 
  localStorage.removeItem(SESSION_KEY); 
}

// Create Auth Context
export const AuthContext = React.createContext();

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = readSession();
      if (session?.token) {
        try {
          const response = await fetch(`${API_URL}/me`, {
            headers: {
              'x-auth-token': session.token,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.user) {
              const updatedUser = {
                ...session,
                ...userData.user,
                token: session.token
              };
              setCurrentUser(updatedUser);
              writeSession(updatedUser);
            } else {
              // Don't clear session if server response is invalid, might be a temporary issue
              console.error('Invalid user data received from server');
            }
          } else {
            // Token is invalid, clear session
            clearSession();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearSession();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
    const authCheckInterval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(authCheckInterval);
  }, []);

  // Handle login
  const login = async (token, userData) => {
    try {
      console.log('1. Starting login process with data:', { token, userData });
      
      if (!token || !userData) {
        console.error('Login failed: Token or user data is missing');
        throw new Error('Token or user data is missing');
      }
      
      console.log('1.1 Verifying token format:', token.substring(0, 10) + '...');
      console.log('1.2 User data received:', JSON.stringify(userData, null, 2));
      
      // Create user session object
      const userSession = {
        token,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        id: userData.id || userData._id,
        _id: userData._id // Ensure _id is included for MongoDB compatibility
      };
      
      
      // Save session to localStorage
      writeSession(userSession);
      
      console.log('3. Updating current user state');
      // Update current user state
      setCurrentUser(userSession);
      
      console.log('4. Starting auth verification');
      // Force a re-render and auth check
      const checkAuth = async () => {
        try {
          console.log('5. Making request to /me endpoint');
          const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
              'x-auth-token': token,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
          });
          
          console.log('6. Received response from /me:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('7. Auth verification successful:', data);
            
            if (!data.user) {
              throw new Error('User data not found in response');
            }
            
            // Update with complete user data
            const updatedUser = {
              ...userSession,
              ...data.user
            };
            
            console.log('8. Updating session with user data');
            writeSession(updatedUser);
            setCurrentUser(updatedUser);
            
            console.log('9. Current user after update:', updatedUser);
            // The user will be navigated to the appropriate page by other components or user actions.
            // Removing forced navigation to allow access to pages like /profile immediately after login.
          } else {
            throw new Error('Failed to verify authentication');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          clearSession();
          setCurrentUser(null);
          navigate('/login');
        }
      };
      
      // Perform auth check
      await checkAuth();
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error
    }
  };

  // Handle logout
  const logout = () => {
    clearSession();
    setCurrentUser(null);
    navigate('/login');
  };

  // Protected Route component
  const ProtectedRoute = ({ children, roles = [] }) => {
    const location = useLocation();

    if (isLoading) {
      return <div>Loading...</div>; // Simple loading indicator
    }

    if (!currentUser) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.includes(currentUser.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  // Public Route component
  const PublicRoute = ({ children }) => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (currentUser) {
      return <Navigate to={currentUser.role === 'instructor' ? '/dashboard-instructor' : '/overview'} replace />;
    }

    return children;
  };

  const handleLogout = () => { clearSession(); setCurrentUser(null); navigate('/'); };
  // Check if we're on a dashboard page
  const isDashboardPage = window.location.pathname.includes('/dashboard-');

  // Provide auth context to all components
  const authContextValue = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
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
                    <button className="btn primary" onClick={() => navigate(currentUser.role === 'instructor' ? '/dashboard-instructor' : '/overview')}>Dashboard</button>
                    <button className="btn ghost" onClick={handleLogout}>Logout</button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/overview" element={
            <ProtectedRoute>
              <OverviewPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProfileNew />} />
          <Route path="/dashboard-instructor" element={
            <ProtectedRoute roles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          } />
          <Route path="/weekly-report" element={
            <ProtectedRoute>
              <WeeklyReport />
            </ProtectedRoute>
          } />
          <Route path="/risk-status" element={
            <ProtectedRoute>
              <RiskStatusPage />
            </ProtectedRoute>
          } />
          <Route path="/my-instructors" element={
            <ProtectedRoute>
              <MyInstructorsPage />
            </ProtectedRoute>
          } />
          <Route path="/recommendation/:topic" element={
            <ProtectedRoute>
              <RecommendationPage />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          } />
          <Route path="/course-analysis" element={
            <ProtectedRoute>
              <CourseAnalysisPage />
            </ProtectedRoute>
          } />
          <Route path="/academic-performance" element={
            <ProtectedRoute>
              <AcademicPerformancePage />
            </ProtectedRoute>
          } />
          <Route path="/my-students" element={
            <ProtectedRoute roles={['instructor']}>
              <MyStudentsPage />
            </ProtectedRoute>
          } />
          <Route path="/Studentresources" element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          } />
          <Route path="/insoverview" element={
            <ProtectedRoute roles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthContext.Provider>
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
            {cap:'1-click LMS setup', ours:'✅ Canvas/Moodle/Google in <2 min', other:'⚠️ Complex, manual mapping'},
            {cap:'Real-time engagement', ours:'✅ Minute-level with early decline', other:'⚠️ Daily/weekly aggregates'},
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


function LoginPage(){
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);


  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Login form submitted with:', { email, role });

    try {
      console.log('1. Sending login request to server...');
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role })
      });

      console.log('2. Received response status:', response.status);
      const data = await response.json().catch(err => {
        console.error('Failed to parse JSON response:', err);
        throw new Error('Invalid server response');
      });
      
      console.log('3. Response data:', data);

      if (!response.ok) {
        const errorMsg = data.message || 'Login failed';
        console.error('4. Login failed:', errorMsg);
        
        // Handle role mismatch specifically
        if (response.status === 403) {
          throw new Error(`Please log in as a ${data.message?.split(' ').pop() || 'different role'}`);
        }
        
        throw new Error(errorMsg);
      }

      if (!data.token || !data.user) {
        console.error('5. Invalid response data:', data);
        throw new Error('Invalid response from server: Missing token or user data');
      }

      console.log('6. Calling login function with token and user data');
      // Use the login function from AuthContext to update the auth state
      try {
        await login(data.token, data.user);
        console.log('7. Login function completed successfully');
      } catch (loginError) {
        console.error('7. Error in login function:', loginError);
        throw new Error('Failed to complete login process');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
      setIsLoading(false);
    }
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
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = readSession();
    if (session) {
      if (session.role === 'instructor') navigate('/dashboard-instructor');
      else navigate('/overview');
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!name.trim()) { 
      setError('Please enter your full name'); 
      return; 
    }
    
    const emailTrimmed = email.trim().toLowerCase();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    
    if (!emailValid) { 
      setError('Please enter a valid email'); 
      return; 
    }
    
    if (password.length < 6) { 
      setError('Password must be at least 6 characters'); 
      return; 
    }
    
    if (password !== confirmPassword) { 
      setError('Passwords do not match'); 
      return; 
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: emailTrimmed,
          password,
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save the token and user data in session
      writeSession({
        token: data.token,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        id: data.user.id
      });

      setSuccess('Account created successfully! Redirecting...');
      
      // Redirect based on role
      setTimeout(() => {
        if (role === 'instructor') {
          navigate('/dashboard-instructor');
        } else {
          navigate('/overview');
        }
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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







function RecommendationPage() {
  const { topic } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [answers, setAnswers] = useState([]);

  // Quiz questions based on topic
  const quizData = {
    "advanced-algorithms": {
      title: "Advanced Algorithms Quiz",
      description: "Test your knowledge of algorithm design patterns and problem-solving strategies.",
      questions: [
        {
          question: "Which algorithm is best suited for finding the shortest path in a graph with non-negative edge weights?",
          options: [
            "Dijkstra's Algorithm",
            "Bellman-Ford Algorithm", 
            "Floyd-Warshall Algorithm",
            "Kruskal's Algorithm"
          ],
          correct: 0
        },
        {
          question: "What is the time complexity of the QuickSort algorithm in the worst case?",
          options: [
            "O(n log n)",
            "O(n²)",
            "O(log n)",
            "O(n)"
          ],
          correct: 1
        },
        {
          question: "Which data structure is most efficient for implementing a priority queue?",
          options: [
            "Array",
            "Linked List",
            "Binary Heap",
            "Stack"
          ],
          correct: 2
        },
        {
          question: "What technique is used in Dynamic Programming to avoid redundant calculations?",
          options: [
            "Greedy Approach",
            "Memoization",
            "Backtracking",
            "Divide and Conquer"
          ],
          correct: 1
        },
        {
          question: "Which sorting algorithm is stable and has O(n log n) worst-case time complexity?",
          options: [
            "QuickSort",
            "MergeSort",
            "HeapSort",
            "BubbleSort"
          ],
          correct: 1
        }
      ]
    },
    "database-design": {
      title: "Database Design Quiz",
      description: "Test your understanding of database concepts, normalization, and design principles.",
      questions: [
        {
          question: "What is the first normal form (1NF) in database design?",
          options: [
            "Eliminating duplicate columns",
            "Eliminating duplicate rows",
            "Each cell contains only atomic values",
            "Creating separate tables for related data"
          ],
          correct: 2
        },
        {
          question: "Which type of join returns all records from the left table and matching records from the right table?",
          options: [
            "INNER JOIN",
            "LEFT JOIN",
            "RIGHT JOIN",
            "FULL OUTER JOIN"
          ],
          correct: 1
        },
        {
          question: "What is the purpose of an index in a database?",
          options: [
            "To store data",
            "To improve query performance",
            "To enforce constraints",
            "To define relationships"
          ],
          correct: 1
        },
        {
          question: "Which normal form deals with transitive dependencies?",
          options: [
            "First Normal Form (1NF)",
            "Second Normal Form (2NF)",
            "Third Normal Form (3NF)",
            "Boyce-Codd Normal Form (BCNF)"
          ],
          correct: 2
        },
        {
          question: "What does ACID stand for in database transactions?",
          options: [
            "Atomicity, Consistency, Isolation, Durability",
            "Access, Control, Identity, Data",
            "Automatic, Consistent, Independent, Direct",
            "Analysis, Consistency, Integrity, Durability"
          ],
          correct: 0
        }
      ]
    },
    "math-problem-sets": {
      title: "Mathematics Quiz",
      description: "Test your mathematical reasoning and problem-solving skills.",
      questions: [
        {
          question: "What is the derivative of sin(x) with respect to x?",
          options: [
            "cos(x)",
            "-cos(x)",
            "sin(x)",
            "-sin(x)"
          ],
          correct: 0
        },
        {
          question: "What is the sum of the first n natural numbers?",
          options: [
            "n(n+1)/2",
            "n(n-1)/2",
            "n²/2",
            "n(n+1)"
          ],
          correct: 0
        },
        {
          question: "In a right triangle with legs a and b, and hypotenuse c, what is the relationship?",
          options: [
            "a + b = c",
            "a² + b² = c²",
            "a × b = c",
            "a/b = c"
          ],
          correct: 1
        },
        {
          question: "What is the value of log₂(8)?",
          options: [
            "2",
            "3",
            "4",
            "8"
          ],
          correct: 1
        },
        {
          question: "What is the probability of rolling a 6 on a fair six-sided die?",
          options: [
            "1/2",
            "1/3",
            "1/6",
            "1/4"
          ],
          correct: 2
        }
      ]
    }
  };

  const currentQuiz = quizData[topic] || {
    title: "Quiz Not Found",
    description: "The selected quiz is not available.",
    questions: []
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showResult]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);
      
      if (selectedAnswer === currentQuiz.questions[currentQuestion].correct) {
        setScore(score + 1);
      }
    }

    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] !== undefined ? answers[currentQuestion + 1] : null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] !== undefined ? answers[currentQuestion - 1] : null);
    }
  };

  const handleSubmitQuiz = () => {
    let finalScore = score;
    if (selectedAnswer !== null && selectedAnswer === currentQuiz.questions[currentQuestion].correct) {
      finalScore += 1;
    }
    
    // Calculate final score
    const finalAnswers = [...answers];
    if (selectedAnswer !== null) {
      finalAnswers[currentQuestion] = selectedAnswer;
    }
    
    finalScore = finalAnswers.reduce((acc, answer, index) => {
      if (answer === currentQuiz.questions[index].correct) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    setScore(finalScore);
    setShowResult(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (currentQuiz.questions.length === 0) {
    return (
      <div className="quiz-container not-found">
        <div className="quiz-header">
          <h1>Quiz Not Available</h1>
          <p>The selected quiz topic is not available. Please choose a different topic.</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    return (
      <div className="quiz-container result-page">
        <div className="result-content">
          <div className="result-icon">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="result-title">Quiz Completed!</h1>
          <div className="result-score">
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
            </div>
            <p className="score-text">
              You scored {score} out of {currentQuiz.questions.length} questions
            </p>
          </div>
          <div className="result-feedback">
            {percentage >= 90 && <p className="excellent">Excellent! You have mastered this topic!</p>}
            {percentage >= 80 && percentage < 90 && <p className="good">Great job! You have a solid understanding.</p>}
            {percentage >= 60 && percentage < 80 && <p className="average">Good effort! Review the topics to improve further.</p>}
            {percentage < 60 && <p className="needs-improvement">Keep practicing! Consider reviewing the material again.</p>}
          </div>
          <div className="result-actions">
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Retake Quiz
            </button>
            <button className="btn-home" onClick={() => window.history.back()}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{currentQuiz.title}</h1>
          <p>{currentQuiz.description}</p>
        </div>
        <div className="quiz-progress">
          <div className="timer">⏱️ {formatTime(timeLeft)}</div>
          <div className="question-counter">
            Question {currentQuestion + 1} of {currentQuiz.questions.length}
          </div>
          <div className="progress-bar-quiz">
            <div 
              className="progress-fill-quiz" 
              style={{width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%`}}
            ></div>
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-section">
          <h2 className="question-text">
            {currentQuiz.questions[currentQuestion].question}
          </h2>
          
          <div className="options-container">
            {currentQuiz.questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className={`option ${selectedAnswer === index ? 'selected' : ''} ${answers[currentQuestion] === index ? 'answered' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="option-indicator">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="option-text">
                  {option}
                </div>
                {answers[currentQuestion] === index && (
                  <div className="check-icon">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button 
            className="nav-btn prev"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          
          <div className="question-status">
            {currentQuestion + 1} / {currentQuiz.questions.length}
          </div>
          
          {currentQuestion === currentQuiz.questions.length - 1 ? (
            <button 
              className="nav-btn submit"
              onClick={handleSubmitQuiz}
              disabled={selectedAnswer === null}
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              className="nav-btn next"
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
const mockInstructors = [
  {
    id: 1,
    name: 'Dr. Smith',
    subject: 'Mathematics',
    avatar: 'SM',
    imageUrl: 'https://images.unsplash.com/photo-1542838183-500f135b3e21?q=80&w=1740&auto=format&fit=crop',
    bio: 'Dr. Smith specializes in advanced calculus and has over 15 years of teaching experience. He is known for his clear explanations and practical problem-solving approach.',
    rating: 4.8,
    courses: ['Advanced Calculus', 'Linear Algebra', 'Differential Equations'],
    mentorship: {
      sessions: 12,
      lastSession: 'September 10, 2025'
    }
  },
  {
    id: 2,
    name: 'Prof. Johnson',
    subject: 'Programming',
    avatar: 'JO',
    imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1812&auto=format&fit=crop',
    bio: 'Prof. Johnson is an expert in data structures and algorithms. He has a passion for helping students master complex coding concepts through hands-on projects.',
    rating: 4.5,
    courses: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Web Development Basics'],
    mentorship: {
      sessions: 8,
      lastSession: 'September 12, 2025'
    }
  },
  {
    id: 3,
    name: 'Ms. Williams',
    subject: 'Physics',
    avatar: 'WI',
    imageUrl: 'https://images.unsplash.com/photo-1542749363-2339d67ef733?q=80&w=1740&auto=format&fit=crop',
    bio: 'Ms. Williams is a research scientist and a visiting faculty member. Her classes are highly engaging, focusing on real-world applications of physics principles.',
    rating: 4.9,
    courses: ['Quantum Mechanics', 'Thermodynamics', 'Classical Physics'],
    mentorship: {
      sessions: 5,
      lastSession: 'August 28, 2025'
    }
  },
];

function MyInstructorsPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const handleViewDetailsClick = (instructor) => {
    setSelectedInstructor(instructor);
  };

  const closeModal = () => {
    setSelectedInstructor(null);
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
            <Link to="/my-instructors" className="nav-item active">
              <span className="nav-text">My Instructors</span>
            </Link>
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
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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
            <h2>Your Mentors & Instructors</h2>
            <div className="instructors-grid">
              {mockInstructors.map(instructor => (
                <div 
                  key={instructor.id} 
                  className="instructor-card"
                >
                  <div className="instructor-card-top">
                    {instructor.imageUrl ? (
                      <img src={instructor.imageUrl} alt={instructor.name} className="instructor-photo" />
                    ) : (
                      <div className="instructor-card-avatar">{instructor.avatar}</div>
                    )}
                    <div className="instructor-info">
                      <h3 className="instructor-name">{instructor.name}</h3>
                      <p className="instructor-subject">{instructor.subject}</p>
                      <div className="instructor-rating">
                        <span className="rating-score">{instructor.rating}</span>
                        <span className="rating-stars">⭐</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetailsClick(instructor)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-section ask-doubt-section">
                <h4>Ask a Doubt</h4>
                <p>Have a question for this instructor? Write it here.</p>
                <textarea 
                  className="doubt-textarea" 
                  placeholder="Enter your question here..." 
                ></textarea>
                <button className="doubt-submit-btn">Submit Doubt</button>
              </div>
        </div>
        
      </div>
      

      {/* Instructor Details Modal */}
      {selectedInstructor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="instructor-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            <div className="modal-header">
              {selectedInstructor.imageUrl ? (
                <img src={selectedInstructor.imageUrl} alt={selectedInstructor.name} className="modal-photo" />
              ) : (
                <div className="modal-avatar">{selectedInstructor.avatar}</div>
              )}
              <div className="modal-title">
                <h3>{selectedInstructor.name}</h3>
                <p>{selectedInstructor.subject}</p>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>About</h4>
                <p>{selectedInstructor.bio}</p>
              </div>
              <div className="modal-section">
                <h4>Mentorship Details</h4>
                <div className="mentorship-details">
                  <span>Total Sessions: <strong>{selectedInstructor.mentorship.sessions}</strong></span>
                  <span>Last Session: <strong>{selectedInstructor.mentorship.lastSession}</strong></span>
                </div>
              </div>
              <div className="modal-section">
                <h4>Courses Taught</h4>
                <ul className="courses-list">
                  {selectedInstructor.courses.map((course, index) => (
                    <li key={index}>{course}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-section feedback-section">
                <h4>Rating & Feedback</h4>
                <div className="current-rating">
                  <span className="rating-label">Average Rating:</span>
                  <span className="rating-score">{selectedInstructor.rating} ⭐</span>
                </div>
                <button className="feedback-btn">Give Feedback</button>
              </div>
            </div>
          </div>
          
        </div>
        
      )}
    </div>
  );
}
const mockSchedule = [
  {
    day: 'Monday',
    classes: [
      { id: 1, time: '9:00 AM - 10:30 AM', subject: 'Advanced Calculus', instructor: 'Dr. Smith' },
      { id: 2, time: '11:00 AM - 12:30 PM', subject: 'Linear Algebra', instructor: 'Dr. Singh' },
      { id: 3, time: '2:00 PM - 3:30 PM', subject: 'Data Structures & Algorithms', instructor: 'Prof. Johnson' },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      { id: 4, time: '10:00 AM - 11:30 AM', subject: 'Thermodynamics', instructor: 'Ms. Williams' },
      { id: 5, time: '1:00 PM - 2:30 PM', subject: 'Web Development Basics', instructor: 'Prof. Johnson' },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { id: 6, time: '9:00 AM - 10:30 AM', subject: 'Differential Equations', instructor: 'Dr. Smith' },
      { id: 7, time: '1:00 PM - 2:30 PM', subject: 'Quantum Mechanics', instructor: 'Ms. Williams' },
    ],
  },
  {
    day: 'Thursday',
    classes: [
      { id: 8, time: '11:00 AM - 12:30 PM', subject: 'Object-Oriented Programming', instructor: 'Prof. Johnson' },
      { id: 9, time: '3:00 PM - 4:30 PM', subject: 'Classical Physics', instructor: 'Ms. Williams' },
    ],
  },
  {
    day: 'Friday',
    classes: [
      { id: 10, time: '9:00 AM - 10:30 AM', subject: 'Advanced Calculus', instructor: 'Dr. Smith' },
      { id: 11, time: '1:00 PM - 2:30 PM', subject: 'Data Structures & Algorithms', instructor: 'Prof. Johnson' },
    ],
  },
];
function SchedulePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Set the initial selected day to the current day of the week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(today);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const todaySchedule = mockSchedule.find(schedule => schedule.day === selectedDay);

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Your existing sidebar code */}
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
            <Link to="/schedule" className="nav-item active">
              <span className="nav-text">Schedule</span>
            </Link>
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
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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
            <h2>Weekly Schedule</h2>
            <div className="day-selector">
              {mockSchedule.map((schedule) => (
                <button
                  key={schedule.day}
                  className={`day-button ${selectedDay === schedule.day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(schedule.day)}
                >
                  {schedule.day}
                </button>
              ))}
            </div>

            <div className="daily-schedule-card">
              <h3>{todaySchedule?.day}Today's Classes</h3>
              {todaySchedule && todaySchedule.classes.length > 0 ? (
                <div className="classes-list">
                  {todaySchedule.classes.map((classItem) => (
                    <div key={classItem.id} className="class-item">
                      <div className="class-time">{classItem.time}</div>
                      <div className="class-details">
                        <div className="subject-name">{classItem.subject}</div>
                        <div className="instructor-name">with {classItem.instructor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-classes">
                  <p>No classes scheduled for today! Enjoy your day off.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const mockCourseData = [
  {
    id: 1,
    subject: 'Mathematics',
    score: '92%',
    status: 'Excellent',
    averageScore: '85%',
    classRank: 'Top 5%',
    instructorNotes: "Gaurav, your performance in Mathematics is outstanding. Keep up the excellent work, and consider exploring more advanced topics in Number Theory to challenge yourself.",
    topics: [
      { name: 'Algebra', score: '95%', status: 'Excellent' },
      { name: 'Calculus', score: '90%', status: 'Excellent' },
      { name: 'Geometry', score: '89%', status: 'Good' },
    ],
  },
  {
    id: 2,
    subject: 'Programming',
    score: '88%',
    status: 'Good',
    averageScore: '80%',
    classRank: 'Top 10%',
    instructorNotes: "Your progress in Programming is solid. To improve your problem-solving speed, I recommend dedicating more time to mastering data structures like Trees and Graphs.",
    topics: [
      { name: 'Data Structures', score: '82%', status: 'Good' },
      { name: 'Algorithms', score: '88%', status: 'Good' },
      { name: 'Web Development', score: '95%', status: 'Excellent' },
    ],
  },
  {
    id: 3,
    subject: 'Physics',
    score: '75%',
    status: 'Average',
    averageScore: '80%',
    classRank: 'Top 50%',
    instructorNotes: "You are doing well in foundational concepts, but you need to work on practical applications. Attend the problem-solving sessions and ask more doubts on the portal.",
    topics: [
      { name: 'Kinematics', score: '80%', status: 'Good' },
      { name: 'Mechanics', score: '70%', status: 'Average' },
      { name: 'Thermodynamics', score: '75%', status: 'Average' },
    ],
  },
];

function CourseAnalysisPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const handleExpand = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
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
            <Link to="/course-analysis" className="nav-item active">
              <span className="nav-text">Course Analysis</span>
            </Link>
            <NavLink to="/academic-performance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Academic Performance</span>
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <NavLink to="/feedback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Feedback</span>
            </NavLink>
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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
            
            {mockCourseData.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header" onClick={() => handleExpand(course.subject)}>
                  <h3>{course.subject}</h3>
                  <div className="course-stats">
                    <span className="score">Score: {course.score}</span>
                    <span className="status status-tag">{course.status}</span>
                    <span className="toggle-icon">{expandedSubject === course.subject ? '−' : '+'}</span>
                  </div>
                </div>

                {expandedSubject === course.subject && (
                  <div className="course-details">
                    <div className="performance-summary">
                      <div className="summary-card">
                        <p>Average Class Score</p>
                        <h4>{course.averageScore}</h4>
                      </div>
                      <div className="summary-card">
                        <p>Your Class Rank</p>
                        <h4>{course.classRank}</h4>
                      </div>
                    </div>
                    
                    <div className="topic-breakdown">
                      <h4>Topic-wise Breakdown</h4>
                      <ul className="topic-list">
                        {course.topics.map((topic, index) => (
                          <li key={index} className="topic-item">
                            <span className="topic-name">{topic.name}</span>
                            <span className="topic-score">{topic.score}</span>
                            <span className={`status-tag status-${topic.status.toLowerCase()}`}>{topic.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="instructor-notes">
                      <h4>Instructor Notes</h4>
                      <p>{course.instructorNotes}</p>
                    </div>

                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
const emptySummary = {
  gpa: '',
  attendanceRate: '',
  currentGrade: '',
  predictedGPA: '',
  riskLevel: '',
  projectedAttendanceDrop: '',
  passProbability: '',
  predictionConfidence: '',
};

const emptyStudyPlan = {
  recommendedHours: '',
  focusSubjects: [],
  chapters: [],
  videos: [],
};

const emptyPeerComparison = {
  rankPercentile: '',
  comparedToPeers: {},
};
function AcademicPerformancePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const studentId = session?._id || session?.id || session?.userId || session?.user?._id || 'demo-student';
  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  
  // Light theme styles
  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '2rem',
      color: '#1e293b',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-2px)',
      },
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#475569',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#93c5fd',
        boxShadow: '0 0 0 3px rgba(147, 197, 253, 0.5)',
      },
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s',
      '&:hover': {
        backgroundColor: '#2563eb',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1.25rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e2e8f0',
    },
    grid: {
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      marginBottom: '2rem',
    },
  };

  const [summary, setSummary] = useState(emptySummary);
  const [summaryForm, setSummaryForm] = useState(emptySummary);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [assessmentPerformance, setAssessmentPerformance] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [studyPlan, setStudyPlan] = useState(emptyStudyPlan);
  const [studyPlanForm, setStudyPlanForm] = useState({
    recommendedHours: '',
    focusSubjects: '',
    chapters: '',
    videos: '',
  });
  const [peerComparison, setPeerComparison] = useState(emptyPeerComparison);
  const [peerRankInput, setPeerRankInput] = useState('');
  const [peerEntry, setPeerEntry] = useState({ subject: '', stance: 'higher' });
  const [assignmentProgress, setAssignmentProgress] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [weeklyEntry, setWeeklyEntry] = useState({ week: '', score: '' });
  const [subjectEntry, setSubjectEntry] = useState({ subject: '', score: '' });
  const [assessmentEntry, setAssessmentEntry] = useState({ name: '', score: '' });
  const [weakTopicEntry, setWeakTopicEntry] = useState({ subject: '', topics: '', averageScore: '' });
  const [assignmentEntry, setAssignmentEntry] = useState({ subject: '', completed: '', total: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newStudyEntry, setNewStudyEntry] = useState({ hours: '', score: '' });

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const parseList = (value = '') =>
    value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const handleSummaryFormChange = (field, value) => {
    setSummaryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSummarySubmit = (event) => {
    event.preventDefault();
    setSummary({ ...summaryForm });
  };

  const handleWeeklyEntryChange = (field, value) => {
    setWeeklyEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleWeeklyEntrySubmit = (event) => {
    event.preventDefault();
    if (!weeklyEntry.week || weeklyEntry.score === '') return;
    setPerformanceTrend(prev => [...prev, { week: weeklyEntry.week, score: Number(weeklyEntry.score) }]);
    setWeeklyEntry({ week: '', score: '' });
  };

  const handleSubjectEntryChange = (field, value) => {
    setSubjectEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectEntrySubmit = (event) => {
    event.preventDefault();
    if (!subjectEntry.subject || subjectEntry.score === '') return;
    setSubjectPerformance(prev => [...prev, { subject: subjectEntry.subject, score: Number(subjectEntry.score) }]);
    setSubjectEntry({ subject: '', score: '' });
  };

  const handleAssessmentEntryChange = (field, value) => {
    setAssessmentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentEntrySubmit = (event) => {
    event.preventDefault();
    if (!assessmentEntry.name || assessmentEntry.score === '') return;
    setAssessmentPerformance(prev => [...prev, { name: assessmentEntry.name, score: Number(assessmentEntry.score) }]);
    setAssessmentEntry({ name: '', score: '' });
  };

  const handleWeakTopicChange = (field, value) => {
    setWeakTopicEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleWeakTopicSubmit = (event) => {
    event.preventDefault();
    if (!weakTopicEntry.subject) return;
    setWeakTopics(prev => [
      ...prev,
      {
        subject: weakTopicEntry.subject,
        topics: parseList(weakTopicEntry.topics),
        averageScore: weakTopicEntry.averageScore ? Number(weakTopicEntry.averageScore) : null,
      },
    ]);
    setWeakTopicEntry({ subject: '', topics: '', averageScore: '' });
  };

  const handleAssignmentEntryChange = (field, value) => {
    setAssignmentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAssignmentEntrySubmit = (event) => {
    event.preventDefault();
    if (!assignmentEntry.subject) return;
    setAssignmentProgress(prev => [
      ...prev,
      {
        subject: assignmentEntry.subject,
        completed: assignmentEntry.completed ? Number(assignmentEntry.completed) : 0,
        total: assignmentEntry.total ? Number(assignmentEntry.total) : 0,
      },
    ]);
    setAssignmentEntry({ subject: '', completed: '', total: '' });
  };

  const handleStudyPlanFormChange = (field, value) => {
    setStudyPlanForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStudyPlanSubmit = (event) => {
    event.preventDefault();
    setStudyPlan({
      recommendedHours: studyPlanForm.recommendedHours,
      focusSubjects: parseList(studyPlanForm.focusSubjects),
      chapters: parseList(studyPlanForm.chapters),
      videos: parseList(studyPlanForm.videos),
    });
  };

  const handlePeerRankSubmit = (event) => {
    event.preventDefault();
    setPeerComparison(prev => ({ ...prev, rankPercentile: peerRankInput }));
  };

  const handlePeerEntryChange = (field, value) => {
    setPeerEntry(prev => ({ ...prev, [field]: value }));
  };

  const handlePeerEntrySubmit = (event) => {
    event.preventDefault();
    if (!peerEntry.subject) return;
    setPeerComparison(prev => ({
      ...prev,
      comparedToPeers: {
        ...prev.comparedToPeers,
        [peerEntry.subject]: peerEntry.stance,
      },
    }));
    setPeerEntry({ subject: '', stance: 'higher' });
  };

  const fetchAcademicData = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);

    try {
      const endpoints = [
        { key: 'summary', url: `${apiBase}/api/academic/summary/${studentId}` },
        { key: 'performanceTrend', url: `${apiBase}/api/academic/performance-trend/${studentId}` },
        { key: 'subjectPerformance', url: `${apiBase}/api/academic/subject-performance/${studentId}` },
        { key: 'assessmentPerformance', url: `${apiBase}/api/academic/assessment-performance/${studentId}` },
        { key: 'weakTopics', url: `${apiBase}/api/academic/weak-topics/${studentId}` },
        { key: 'studyPlan', url: `${apiBase}/api/academic/study-plan/${studentId}` },
        { key: 'peerComparison', url: `${apiBase}/api/academic/peer-comparison/${studentId}` },
        { key: 'assignmentProgress', url: `${apiBase}/api/academic/assignment-progress/${studentId}` },
      ];

      const responses = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText || 'Request failed');
            const payload = await res.json();
            return [key, payload];
          } catch (err) {
            console.warn(`Academic API ${key} failed`, err.message);
            return [key, null];
          }
        })
      );

      const data = Object.fromEntries(responses);

      if (data.summary) {
        setSummary(prev => ({ ...prev, ...data.summary }));
        setSummaryForm(prev => ({
          ...prev,
          gpa: data.summary.gpa ?? prev.gpa,
          attendanceRate: data.summary.attendanceRate ?? prev.attendanceRate,
          currentGrade: data.summary.currentGrade ?? prev.currentGrade,
          predictedGPA: data.summary.predictedGPA ?? data.summary.predictedGpa ?? prev.predictedGPA,
          riskLevel: data.summary.riskLevel ?? prev.riskLevel,
          projectedAttendanceDrop: data.summary.projectedAttendanceDrop ?? prev.projectedAttendanceDrop,
          passProbability: data.summary.passProbability ?? data.summary.probabilityPassing ?? prev.passProbability,
          predictionConfidence: data.summary.predictionConfidence ?? data.summary.predictionConfidencePct ?? prev.predictionConfidence,
        }));
      }
      if (Array.isArray(data.performanceTrend) && data.performanceTrend.length) setPerformanceTrend(data.performanceTrend);
      if (Array.isArray(data.subjectPerformance) && data.subjectPerformance.length) setSubjectPerformance(data.subjectPerformance);
      if (Array.isArray(data.assessmentPerformance) && data.assessmentPerformance.length) setAssessmentPerformance(data.assessmentPerformance);
      if (Array.isArray(data.weakTopics) && data.weakTopics.length) setWeakTopics(data.weakTopics);
      if (data.studyPlan) {
        setStudyPlan({
          recommendedHours: data.studyPlan.recommendedHours ?? '',
          focusSubjects: data.studyPlan.focusSubjects || [],
          chapters: data.studyPlan.chapters || [],
          videos: data.studyPlan.videos || [],
        });
        setStudyPlanForm({
          recommendedHours: data.studyPlan.recommendedHours?.toString() || '',
          focusSubjects: (data.studyPlan.focusSubjects || []).join(', '),
          chapters: (data.studyPlan.chapters || []).join(', '),
          videos: (data.studyPlan.videos || []).join(', '),
        });
      }
      if (data.peerComparison) {
        setPeerComparison({
          rankPercentile: data.peerComparison.rankPercentile ?? '',
          comparedToPeers: data.peerComparison.comparedToPeers || {},
        });
        setPeerRankInput(data.peerComparison.rankPercentile?.toString() || '');
      }
      if (Array.isArray(data.assignmentProgress) && data.assignmentProgress.length) setAssignmentProgress(data.assignmentProgress);
    } catch (err) {
      console.error('Academic data fetch failed', err);
      setError('Unable to sync with academic analytics right now. Showing cached insights.');
    } finally {
      setLoading(false);
    }
  }, [apiBase, studentId]);

  useEffect(() => {
    fetchAcademicData();
  }, [fetchAcademicData]);

  const formatProbability = (value) => {
    if (value === undefined || value === null) return 0;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 0;
    return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  };

  const summaryNumericValue = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const predictedGPAValue =
    summaryNumericValue(summary.predictedGPA) ??
    summaryNumericValue(summary.predictedGpa) ??
    summaryNumericValue(summary.gpa);
  const predictedGPA = predictedGPAValue !== null ? predictedGPAValue.toFixed(2) : '—';

  const passProbabilitySource =
    summary.passProbability !== '' && summary.passProbability !== undefined
      ? summary.passProbability
      : summary.probabilityPassing ?? summary.passRate ?? '';
  const passProbability =
    passProbabilitySource !== '' && passProbabilitySource !== undefined
      ? formatProbability(passProbabilitySource)
      : null;

  const attendanceDropValue =
    summary.projectedAttendanceDrop !== '' && summary.projectedAttendanceDrop !== undefined
      ? Number(summary.projectedAttendanceDrop)
      : null;
  const predictionConfidence =
    summary.predictionConfidence !== '' && summary.predictionConfidence !== undefined
      ? formatProbability(summary.predictionConfidence)
      : null;

  const riskLevel = summary.riskLevel || 'Not set';
  const riskClass = `risk-chip ${summary.riskLevel ? summary.riskLevel.toLowerCase() : 'neutral'}`;

  const assignmentProgressWithPercent = assignmentProgress.map(item => {
    const percent = item.total ? Math.round((item.completed / item.total) * 100) : 0;
    return { ...item, percent };
  });

  const scatterData = studyLogs;

  const lastThreeScores = performanceTrend.slice(-3);
  const isDeclining =
    lastThreeScores.length === 3 &&
    lastThreeScores[0].score > lastThreeScores[1].score &&
    lastThreeScores[1].score > lastThreeScores[2].score;
  const weeklyScoreString = lastThreeScores.length ? lastThreeScores.map(item => item.score).join(' → ') : 'insufficient data';

  const averageStudyHours = scatterData.length
    ? (scatterData.reduce((sum, entry) => sum + entry.hours, 0) / scatterData.length).toFixed(1)
    : '—';

  const passProbabilityLabel = passProbability !== null ? `${passProbability}%` : '—';
  const attendanceDropLabel = attendanceDropValue === null ? '—' : attendanceDropValue === 0 ? 'Stable' : `${attendanceDropValue}%`;
  const predictionConfidenceLabel = predictionConfidence !== null ? `${predictionConfidence}%` : '—';

  const peerSubjects = peerComparison?.comparedToPeers || {};

  const hasPerformanceTrend = performanceTrend.length > 0;
  const hasSubjectPerformance = subjectPerformance.length > 0;
  const hasAssessmentPerformance = assessmentPerformance.length > 0;
  const hasAssignments = assignmentProgressWithPercent.length > 0;
  const hasWeakTopics = weakTopics.length > 0;
  const peerSubjectEntries = Object.entries(peerSubjects);
  const hasPeerSubjects = peerSubjectEntries.length > 0;
  const hasStudyPlanData =
    Boolean(studyPlan.recommendedHours) ||
    (Array.isArray(studyPlan.focusSubjects) && studyPlan.focusSubjects.length > 0) ||
    (Array.isArray(studyPlan.chapters) && studyPlan.chapters.length > 0) ||
    (Array.isArray(studyPlan.videos) && studyPlan.videos.length > 0);

  const handleStudyEntryChange = (field, value) => {
    setNewStudyEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleStudyLogSubmit = (event) => {
    event.preventDefault();
    if (!newStudyEntry.hours || !newStudyEntry.score) return;

    const entry = {
      id: Date.now(),
      hours: Number(newStudyEntry.hours),
      score: Number(newStudyEntry.score),
      source: 'Manual Log'
    };

    if (Number.isNaN(entry.hours) || Number.isNaN(entry.score)) return;

    setStudyLogs(prev => [...prev, entry]);
    setNewStudyEntry({ hours: '', score: '' });
  };

  const resetStudyLogs = () => setStudyLogs([]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Retained from original code */}
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
            <Link to="/academic-performance" className="nav-item active">
              <span className="nav-text">Academic Performance</span>
            </Link>
          </div>
          
          <div className="nav-section">
            <h5>Tools</h5>
            <NavLink to="/feedback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Feedback</span>
            </NavLink>
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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
          <div className="header-right">
            <button className="ghost-btn" onClick={fetchAcademicData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh AI Insights'}
            </button>
          </div>
        </div>

        <div className="academic-performance-container">
          {error && <div className="inline-alert warning">{error}</div>}
          {loading && !error && <div className="inline-alert info">Crunching latest predictions...</div>}

          <div className="data-entry-panel">
            <div className="section-header">
              <h2 className="section-title">Academic Performance Dashboard</h2>
              <p className="section-description">Track and manage your academic progress with real-time insights and analytics</p>
            </div>
            <div className="data-entry-grid">
              {/* Academic Summary - Full Width */}
              <form className="data-form" onSubmit={handleSummarySubmit}>
                <h3>Academic Summary</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Current GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={summaryForm.gpa}
                      onChange={(e) => handleSummaryFormChange('gpa', e.target.value)}
                      placeholder="e.g. 3.6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Predicted GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={summaryForm.predictedGPA}
                      onChange={(e) => handleSummaryFormChange('predictedGPA', e.target.value)}
                      placeholder="e.g. 3.8"
                    />
                  </div>
                  <div className="form-group">
                    <label>Attendance %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={summaryForm.attendanceRate}
                      onChange={(e) => handleSummaryFormChange('attendanceRate', e.target.value)}
                      placeholder="95"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Grade</label>
                    <input
                      type="text"
                      className="form-control"
                      value={summaryForm.currentGrade}
                      onChange={(e) => handleSummaryFormChange('currentGrade', e.target.value)}
                      placeholder="B+"
                    />
                  </div>
                  <div className="form-group">
                    <label>Risk Level</label>
                    <select 
                      className="form-control"
                      value={summaryForm.riskLevel} 
                      onChange={(e) => handleSummaryFormChange('riskLevel', e.target.value)}
                    >
                      <option value="">Select risk level</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Attendance Drop %</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={summaryForm.projectedAttendanceDrop}
                      onChange={(e) => handleSummaryFormChange('projectedAttendanceDrop', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pass Probability %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={summaryForm.passProbability}
                      onChange={(e) => handleSummaryFormChange('passProbability', e.target.value)}
                      placeholder="90"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confidence %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={summaryForm.predictionConfidence}
                      onChange={(e) => handleSummaryFormChange('predictionConfidence', e.target.value)}
                      placeholder="85"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Update Summary
                  </button>
                </div>
              </form>
              
              {/* Other Forms - Two Column Layout */}
              <div className="forms-container">

              <form className="data-form" onSubmit={handleWeeklyEntrySubmit}>
                <h3>Add Weekly Score</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Week Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={weeklyEntry.week}
                      onChange={(e) => handleWeeklyEntryChange('week', e.target.value)}
                      placeholder="Week 1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={weeklyEntry.score}
                      onChange={(e) => handleWeeklyEntryChange('score', e.target.value)}
                      placeholder="88"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Week</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handleSubjectEntrySubmit}>
                <h3>Subject Average</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subjectEntry.subject}
                      onChange={(e) => handleSubjectEntryChange('subject', e.target.value)}
                      placeholder="Mathematics"
                    />
                  </div>
                  <div className="form-group">
                    <label>Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={subjectEntry.score}
                      onChange={(e) => handleSubjectEntryChange('score', e.target.value)}
                      placeholder="92"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Subject</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handleAssessmentEntrySubmit}>
                <h3>Assessment Type</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Assessment Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={assessmentEntry.name}
                      onChange={(e) => handleAssessmentEntryChange('name', e.target.value)}
                      placeholder="Quizzes, Midterm, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={assessmentEntry.score}
                      onChange={(e) => handleAssessmentEntryChange('score', e.target.value)}
                      placeholder="85"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Assessment</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handleWeakTopicSubmit}>
                <h3>Weak Topic</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={weakTopicEntry.subject}
                      onChange={(e) => handleWeakTopicChange('subject', e.target.value)}
                      placeholder="e.g., Physics, Mathematics"
                    />
                  </div>
                  <div className="form-group">
                    <label>Chapters (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={weakTopicEntry.topics}
                      onChange={(e) => handleWeakTopicChange('topics', e.target.value)}
                      placeholder="Optics, Magnetism, Calculus"
                    />
                  </div>
                  <div className="form-group">
                    <label>Average Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={weakTopicEntry.averageScore}
                      onChange={(e) => handleWeakTopicChange('averageScore', e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Add Weak Topic</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </form>
            </div> {/* End of forms-container */}

              <form className="data-form study-plan-form" onSubmit={handleStudyPlanSubmit}>
                <h3>Study Plan</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Hours this week</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={studyPlanForm.recommendedHours}
                      onChange={(e) => handleStudyPlanFormChange('recommendedHours', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Focus subjects</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studyPlanForm.focusSubjects}
                      onChange={(e) => handleStudyPlanFormChange('focusSubjects', e.target.value)}
                      placeholder="Math, Physics"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <span>Save Study Plan</span>
                  </button>
                </div>
              </form>

              <form className="data-form" onSubmit={handlePeerRankSubmit}>
                <h3>Peer Benchmark</h3>
                <div className="form-grid">
                  <label>
                    Rank Percentile
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={peerRankInput}
                      onChange={(e) => setPeerRankInput(e.target.value)}
                      placeholder="82"
                    />
                  </label>
                </div>
                <button type="submit" className="btn primary-btn">Update Rank</button>
              </form>

              <form className="data-form" onSubmit={handlePeerEntrySubmit}>
                <h3>Peer Subject Comparison</h3>
                <div className="form-grid">
                  <label>
                    Subject
                    <input
                      type="text"
                      value={peerEntry.subject}
                      onChange={(e) => handlePeerEntryChange('subject', e.target.value)}
                      placeholder="Math"
                    />
                  </label>
                  <label>
                    Relative Performance
                    <select value={peerEntry.stance} onChange={(e) => handlePeerEntryChange('stance', e.target.value)}>
                      <option value="higher">Higher than peers</option>
                      <option value="lower">Lower than peers</option>
                      <option value="same">Same as peers</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="btn primary-btn">Add Comparison</button>
              </form>
            </div>
          </div>

          <div className="dashboard-section forecast-row">
            <div className="ai-forecast-card">
              <div className="forecast-header">
                <div>
                  <p className="forecast-label">Personal Score Forecast (AI)</p>
                  <h2 className="forecast-value">Projected GPA Next Month: <span>{predictedGPA}</span></h2>
                </div>
                <span className={riskClass}>{riskLevel === 'Not set' ? 'Risk N/A' : `${riskLevel} Risk`}</span>
              </div>
              <div className="forecast-grid">
                <div>
                  <p className="forecast-label">Probability of passing all subjects</p>
                  <p className="forecast-metric">{passProbabilityLabel}</p>
                </div>
                <div>
                  <p className="forecast-label">Projected attendance drop</p>
                  <p className="forecast-metric">{attendanceDropLabel}</p>
                </div>
                <div>
                  <p className="forecast-label">Prediction confidence</p>
                  <p className="forecast-metric">{predictionConfidenceLabel}</p>
                </div>
              </div>
              <p className="forecast-footnote">AI forecast updates nightly based on your assessments, attendance, and engagement data.</p>
            </div>

            <div className="performance-metrics modern">
              <div className="metric-card">
                <div className="icon">🎓</div>
                <div className="metric-info">
                  <h3>Current GPA</h3>
                  <p className="metric-value">{summary.gpa || '—'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon">🕒</div>
                <div className="metric-info">
                  <h3>Attendance Rate</h3>
                  <p className="metric-value">
                    {summary.attendanceRate !== '' && summary.attendanceRate !== undefined
                      ? `${summary.attendanceRate}%`
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon">⭐</div>
                <div className="metric-info">
                  <h3>Current Grade</h3>
                  <p className="metric-value">{summary.currentGrade || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section chart-stack">
            <div className="chart-card">
              <div className="section-header-with-action">
                <div>
                  <h3>Weekly Performance Trend</h3>
                  <p className="chart-description">AI monitors exam + quiz scores to flag declines.</p>
                </div>
              </div>
              {hasPerformanceTrend ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ec" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#4c6ef5" strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add at least one weekly score to view this trend.</div>
              )}
            </div>
            <div className="chart-card">
              <h3>Subject-wise Average Scores</h3>
              {hasSubjectPerformance ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ec" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#a770ef" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add subject scores to compare performance.</div>
              )}
            </div>
            <div className="chart-card">
              <h3>Assessment Type Breakdown</h3>
              {hasAssessmentPerformance ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={assessmentPerformance}>
                    <PolarGrid stroke="#e0e6ec" />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="score" stroke="#2575fc" fill="#2575fc" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add assessment averages to see this radar view.</div>
              )}
            </div>
          </div>

          <div className="dashboard-section dual-grid">
            <div className="chart-card scatter-card">
              <div className="section-header-with-action">
                <div>
                  <h3>Study Time vs Score</h3>
                  <p className="chart-description">Log study hours or sync from mobile to validate “more study → higher grades”.</p>
                </div>
                <button className="ghost-btn small" onClick={resetStudyLogs}>Clear Logs</button>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="hours" name="Study Hours" unit="h" />
                  <YAxis type="number" dataKey="score" name="Score" unit="%" domain={[0, 100]} />
                  <ZAxis type="category" dataKey="source" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={scatterData} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="chart-footnote">
                Average logged study time: {averageStudyHours === '—' ? '—' : `${averageStudyHours}h`} • Keep tracking to strengthen the correlation insights.
              </p>
              <form className="study-log-form" onSubmit={handleStudyLogSubmit}>
                <label>
                  Study hours
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={newStudyEntry.hours}
                    onChange={(e) => handleStudyEntryChange('hours', e.target.value)}
                    placeholder="e.g. 3"
                  />
                </label>
                <label>
                  Score (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudyEntry.score}
                    onChange={(e) => handleStudyEntryChange('score', e.target.value)}
                    placeholder="e.g. 88"
                  />
                </label>
                <button type="submit" className="btn primary-btn">Log Study Session</button>
                <button type="button" className="btn secondary-btn" disabled>
                  Sync from mobile app (soon)
                </button>
              </form>
            </div>
            <div className="card assignment-card">
              <h3>Assignment Completion Tracker</h3>
              <p className="section-description">Stay on top of per-course deliverables.</p>
              {hasAssignments ? (
                <div className="assignment-progress-list">
                  {assignmentProgressWithPercent.map((item) => (
                    <div key={item.subject} className="progress-row">
                      <div className="progress-header">
                        <span>{item.subject}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.percent}%` }}></div>
                      </div>
                      <small>
                        {item.total ? `${item.completed}/${item.total}` : item.completed} assignments completed
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Add assignment progress entries to visualize completion.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section triple-grid">
            <div className="card weak-topics-card">
              <h3>Weak Topics Detected</h3>
              <p className="section-description">AI scans chapter-level mastery to highlight urgent focus areas.</p>
              {hasWeakTopics ? (
                <ul>
                  {weakTopics.map((topic) => (
                    <li key={topic.subject}>
                      <strong>{topic.subject}</strong>
                      <p>Chapters: {topic.topics.length ? topic.topics.join(', ') : 'Not provided'}</p>
                      {topic.averageScore !== null && topic.averageScore !== undefined ? (
                        <span className="score-pill">Avg {topic.averageScore}%</span>
                      ) : (
                        <span className="score-pill neutral">Avg N/A</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No weak topics logged yet. Add chapters from the data entry panel.</p>
              )}
            </div>

            <div className="card peer-card">
              <h3>Peer Comparison</h3>
              <p className="section-description">Anonymous benchmark against classmates.</p>
              <div className="peer-stat">
                <span>Your Rank</span>
                <strong>{peerComparison.rankPercentile ? `Top ${peerComparison.rankPercentile}%` : 'Not set'}</strong>
              </div>
              {hasPeerSubjects ? (
                <div className="peer-breakdown">
                  {peerSubjectEntries.map(([subject, stance]) => {
                    const label = stance === 'same' ? 'Same as peers' : `${stance} than peers`;
                    return (
                      <div key={subject} className="peer-row">
                        <span>{subject}</span>
                        <span className={`peer-pill ${stance}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">Add subject level comparisons to unlock this view.</p>
              )}
            </div>

            <div className="card study-plan-card">
              <h3>Personalized Study Plan</h3>
              {hasStudyPlanData ? (
                <div className="study-plan-grid">
                  <div>
                    <p className="label">Recommended hours this week</p>
                    <strong>{studyPlan.recommendedHours || '—'} {studyPlan.recommendedHours ? 'hrs' : ''}</strong>
                  </div>
                  <div>
                    <p className="label">Chapters to focus</p>
                    <strong>{studyPlan.chapters && studyPlan.chapters.length ? studyPlan.chapters.join(', ') : '—'}</strong>
                  </div>
                  <div>
                    <p className="label">Focus subjects</p>
                    <strong>{studyPlan.focusSubjects && studyPlan.focusSubjects.length ? studyPlan.focusSubjects.join(', ') : '—'}</strong>
                  </div>
                  <div>
                    <p className="label">Suggested videos</p>
                    <strong>
                      {Array.isArray(studyPlan.videos) && studyPlan.videos.length ? `${studyPlan.videos.length} tutorials` : '—'}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="empty-state">Add study-plan inputs above to unlock personalized guidance.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section alert-section">
            {performanceTrend.length < 3 ? (
              <div className="alert-card neutral">
                <h3>ℹ Need More Data</h3>
                <p>Add at least three weekly scores to detect downward trends.</p>
              </div>
            ) : isDeclining ? (
              <div className="alert-card danger">
                <h3>⚠ Performance Dropping</h3>
                <p>Your last 3 weekly test scores: {weeklyScoreString}</p>
                <p>
                  Action: Review the weak topics above and add
                  {studyPlan.recommendedHours
                    ? ` at least ${studyPlan.recommendedHours} focused study hours.`
                    : ' additional focused study hours.'}
                </p>
              </div>
            ) : (
              <div className="alert-card success">
                <h3>✅ Trend Stable</h3>
                <p>No decline detected in the last 3 weeks. Keep your study rhythm!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const resourcesData = {
  'Video Lectures': {
    'Mathematics': [
      { id: 1, title: 'Calculus I - Limits', url: 'https://www.youtube.com/watch?v=WsQQvHm4lSw' },
      { id: 2, title: 'Algebra II - Linear Equations', url: 'https://www.youtube.com/watch?v=0L-dEp8TuvU&list=PLlxE9WKuvDj85E5j0KBDvf4CFscn3L5hH' },
    ],
    'Physics': [
      { id: 3, title: 'Kinematics - Motion in 1D', url: 'https://www.youtube.com/watch?v=CBvaO-uDvs8&list=PL_A4M5IAkMadyoou3Fl2jR0pG3X1Wi6xA' },
      { id: 4, title: 'Newtonian Mechanics', url: 'https://www.youtube.com/watch?v=zftiLfSVEmI&list=PLh190Xdu5f-vFLr9WEu9lAMK5XYvoqpDv' },
    ],
  },
  'Notes': {
    'Mathematics': [
      { id: 1, title: 'Calculus Notes (PDF)', url: 'https://example.com/notes/math-calc.pdf' },
      { id: 2, title: 'Algebra Practice Sheet', url: 'https://example.com/notes/math-algebra.pdf' },
    ],
    'Physics': [
      { id: 3, title: 'Physics Formulae', url: 'https://example.com/notes/physics-formulae.docx' },
    ],
  },
  'Sample Quizzes': {
    'Mathematics': [
      { id: 1, title: 'Quiz 1: Limits & Continuity', url: 'https://example.com/quiz/math-q1' },
      { id: 2, title: 'Quiz 2: Derivatives', url: 'https://example.com/quiz/math-q2' },
    ],
    'Physics': [
      { id: 3, title: 'Quiz 1: Kinematics', url: 'https://example.com/quiz/physics-q1' },
    ],
  },
  'Practice Questions': {
    'Mathematics': [
      { id: 1, title: 'Math Qs - Chapter 1', url: 'https://example.com/questions/math-ch1' },
      { id: 2, title: 'Math Qs - Chapter 2', url: 'https://example.com/questions/math-ch2' },
    ],
    'Physics': [
      { id: 3, title: 'Physics Qs - Chapter 1', url: 'https://example.com/questions/physics-ch1' },
    ],
  },
};
function ResourcesPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Video Lectures');
  const [activeSubject, setActiveSubject] = useState('');

  // Set the first subject as active when a new tab is clicked
  useEffect(() => {
    if (resourcesData[activeTab]) {
      const firstSubject = Object.keys(resourcesData[activeTab])[0];
      setActiveSubject(firstSubject);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  const currentSubjects = resourcesData[activeTab] || {};
  const currentResources = currentSubjects[activeSubject] || [];

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
            {/* Main Tabs */}
            <div className="tabs-header">
              {Object.keys(resourcesData).map(tabName => (
                <button
                  key={tabName}
                  className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
                  onClick={() => setActiveTab(tabName)}
                >
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
              {currentResources.length > 0 ? (
                <div className="resources-list">
                  {currentResources.map(resource => (
                    <div key={resource.id} className="resource-item-card">
                      <h3>{resource.title}</h3>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        View Resource
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No resources available for this subject yet.</p>
                </div>
              )}
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
            <NavLink to="/risk-status" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Risk Status</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Profile</span>
            </NavLink>
          </div>
          
          <div className="nav-section">
            <h5>Teaching</h5>
            <Link to="/my-students" className="nav-item active">
              <span className="nav-text">My Students</span>
            </Link>
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
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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
    year: '3rd year',
    semester: 'Spring',
    photo: '👨‍🎓',
    attendance: 87,
    avgQuizScore: 78,
    totalStudyHours: 142,
    engagementScore: 82,
    riskLevel: 'Low',
    finance: {
      totalPayable: 10000,
      totalPaid: 5000,
      others: 300
    },
    enrolledCourses: [
      { 
        id: 1, 
        title: 'Object oriented programming', 
        progress: 65,
        color: '#9b87f5'
      },
      { 
        id: 2, 
        title: 'Fundamentals of database systems', 
        progress: 45,
        color: '#9b87f5'
      }
    ],
    instructors: [
      { id: 1, name: 'Dr. Sarah Johnson', photo: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, name: 'Prof. Michael Chen', photo: 'https://i.pravatar.cc/150?img=2' },
      { id: 3, name: 'Dr. Emily Davis', photo: 'https://i.pravatar.cc/150?img=3' }
    ],
    notices: [
      {
        id: 1,
        title: 'Prelim payment due',
        description: 'Sorem ipsum dolor sit amet, consectetur adipiscing elit.',
        link: 'See more'
      },
      {
        id: 2,
        title: 'Exam schedule',
        description: 'Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
        link: 'See more'
      }
    ],
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
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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
            <Link to="/feedback" className="nav-item active">
              <span className="nav-text">Feedback</span>
            </Link>
            <NavLink to="/Studentresources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Resources</span>
            </NavLink>
            <NavLink to="/weekly-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-text">Weekly Report</span>
            </NavLink>
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




function instructorOverview() {
  // const session = readSession();
  // const navigate = useNavigate();
  // useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);
  return <InstructorDashboard />;
}


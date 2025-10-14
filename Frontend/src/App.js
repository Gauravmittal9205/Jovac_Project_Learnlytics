import React, { useState, useRef, useEffect, useContext } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavIcons from './NavIcons';
import Help from './Help';
import About from './About';
import Resources from './Resources';
//hello world

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart, 
  Line,
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar
} from "recharts";
import Contact from './Contact';

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
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
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

          {/* Enhanced Recommendations Section */}
<div className="dashboard-section">
  <div className="section-header">
    <h2 className="section-title">Suggested for You</h2>
    <p className="section-subtitle">Personalized recommendations based on your learning goals</p>
  </div>
  
  <div className="recommendations-grid">
    {studentData.recommendations.map((rec, index) => (
      <div key={index} className="recommendation-card enhanced">
        <div className="card-header">
          <div className={`rec-icon ${rec.type}`}>
            {rec.type === 'course' && '📚'}
            {rec.type === 'quiz' && '🧠'}
            {rec.type === 'tutorial' && '💡'}
            {rec.type === 'practice' && '🎯'}
          </div>
          <div className="rec-type-badge">
            {rec.type}
          </div>
        </div>
        
        <div className="card-content">
          <h4 className="rec-title">{rec.title}</h4>
          <p className="rec-description">{rec.reason}</p>
          
          {rec.difficulty && (
            <div className="rec-meta">
              <span className={`difficulty-badge ${rec.difficulty.toLowerCase()}`}>
                {rec.difficulty}
              </span>
              {rec.duration && (
                <span className="duration-info">⏱️ {rec.duration}</span>
              )}
            </div>
          )}
          
          {rec.progress !== undefined && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${rec.progress}%`}}
                ></div>
              </div>
              <span className="progress-text">{rec.progress}% complete</span>
            </div>
          )}
        </div>
        
        <div className="card-actions">
  <button
    className="btn-recommendation-primary"
    onClick={() => {
              if (rec.type === 'course' || rec.type === 'tutorial') {
                navigate(`/learn/${rec.title.replace(/\s+/g, "-").toLowerCase()}`);
              } else if (rec.type === 'quiz') {
                navigate(`/quiz/${rec.title.replace(/\s+/g, "-").toLowerCase()}`);
              } else {
                navigate(`/recommendation/${rec.title.replace(/\s+/g, "-").toLowerCase()}`);
              }
            }}
          >
            Start Now
            </button>

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

function ProfilePage(){
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    personal: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      AdhaarNumber: '',
      Category: ''
    },
    contact: {
      email: '',
      phone: '',
      address: '',
      emergencyContact: ''
    },
    academic: {
      program: '',
      year: '',
      semester: '',
      gpa: ''
    }
  });

  useEffect(() => {
    if (!session) navigate('/login');
  }, [navigate, session]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile/me', {
          headers: { 'x-auth-token': token }
        });
        setProfile(res.data);
        setForm({
          name: res.data?.name || '',
          email: res.data?.email || '',
          personal: {
            fullName: res.data?.profile?.personal?.fullName || res.data?.name || '',
            dateOfBirth: res.data?.profile?.personal?.dateOfBirth || '',
            gender: res.data?.profile?.personal?.gender || '',
            AdhaarNumber: res.data?.profile?.personal?.AdhaarNumber || '',
            Category: res.data?.profile?.personal?.Category || ''
          },
          contact: {
            email: res.data?.profile?.contact?.email || res.data?.email || '',
            phone: res.data?.profile?.contact?.phone || '',
            address: res.data?.profile?.contact?.address || '',
            emergencyContact: res.data?.profile?.contact?.emergencyContact || ''
          },
          academic: {
            program: res.data?.profile?.academic?.program || '',
            year: res.data?.profile?.academic?.year || '',
            semester: res.data?.profile?.academic?.semester || '',
            gpa: res.data?.profile?.academic?.gpa || ''
          }
        });
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load profile';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const basicPersonal = profile?.profile?.personal || {};
  const basicContact = profile?.profile?.contact || {};
  const academic = profile?.profile?.academic || {};

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess('');
      setError('');
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        email: form.email,
        personal: form.personal,
        contact: form.contact,
        academic: form.academic
      };
      const res = await axios.put('http://localhost:5000/api/profile', payload, {
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' }
      });
      setSuccess('Profile updated successfully');
      if (res.data?.user) {
        setProfile(res.data.user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

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
            {(profile?.name || 'ST')
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{profile?.name || 'Student'}</h4>
            <p>{academic.program || 'Program'}</p>
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
            <h1>Profile</h1>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <div className="profile-card">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {error && <p className="error">{error}</p>}
                  {success && <p className="success">{success}</p>}

                  <div className="profile-details-grid">
                    <div className="detail-group">
                      <h3>Basic Details</h3>
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="label">Name</span>
                          <input className="input" name="name" value={form.name} onChange={handleBasicChange} placeholder="Enter name" />
                        </label>
                        <label className="form-field">
                          <span className="label">Email</span>
                          <input className="input" name="email" value={form.email} onChange={handleBasicChange} placeholder="Enter email" />
                        </label>
                        <div className="detail readonly"><span>Role</span><strong>{profile?.role || '-'}</strong></div>
                      </div>
                    </div>

                    <div className="detail-group">
                      <h3>Personal</h3>
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="label">Full Name</span>
                          <input className="input" value={form.personal.fullName} onChange={(e)=>handleNestedChange('personal','fullName', e.target.value)} placeholder="Full name" />
                        </label>
                        <label className="form-field">
                          <span className="label">Date of Birth</span>
                          <input className="input" value={form.personal.dateOfBirth} onChange={(e)=>handleNestedChange('personal','dateOfBirth', e.target.value)} placeholder="YYYY-MM-DD" />
                        </label>
                        <label className="form-field">
                          <span className="label">Gender</span>
                          <input className="input" value={form.personal.gender} onChange={(e)=>handleNestedChange('personal','gender', e.target.value)} placeholder="Gender" />
                        </label>
                        <label className="form-field">
                          <span className="label">Category</span>
                          <input className="input" value={form.personal.Category} onChange={(e)=>handleNestedChange('personal','Category', e.target.value)} placeholder="Category" />
                        </label>
                        <label className="form-field">
                          <span className="label">Adhaar Number</span>
                          <input className="input" value={form.personal.AdhaarNumber} onChange={(e)=>handleNestedChange('personal','AdhaarNumber', e.target.value)} placeholder="Adhaar" />
                        </label>
                      </div>
                    </div>

                    <div className="detail-group">
                      <h3>Contact</h3>
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="label">Email</span>
                          <input className="input" value={form.contact.email} onChange={(e)=>handleNestedChange('contact','email', e.target.value)} placeholder="Email" />
                        </label>
                        <label className="form-field">
                          <span className="label">Phone</span>
                          <input className="input" value={form.contact.phone} onChange={(e)=>handleNestedChange('contact','phone', e.target.value)} placeholder="Phone" />
                        </label>
                        <label className="form-field">
                          <span className="label">Address</span>
                          <input className="input" value={form.contact.address} onChange={(e)=>handleNestedChange('contact','address', e.target.value)} placeholder="Address" />
                        </label>
                        <label className="form-field">
                          <span className="label">Emergency Contact</span>
                          <input className="input" value={form.contact.emergencyContact} onChange={(e)=>handleNestedChange('contact','emergencyContact', e.target.value)} placeholder="Emergency Contact" />
                        </label>
                      </div>
                    </div>

                    <div className="detail-group">
                      <h3>Academic</h3>
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="label">Program</span>
                          <input className="input" value={form.academic.program} onChange={(e)=>handleNestedChange('academic','program', e.target.value)} placeholder="Program" />
                        </label>
                        <label className="form-field">
                          <span className="label">Year</span>
                          <input className="input" value={form.academic.year} onChange={(e)=>handleNestedChange('academic','year', e.target.value)} placeholder="Year" />
                        </label>
                        <label className="form-field">
                          <span className="label">Semester</span>
                          <input className="input" value={form.academic.semester} onChange={(e)=>handleNestedChange('academic','semester', e.target.value)} placeholder="Semester" />
                        </label>
                        <label className="form-field">
                          <span className="label">GPA</span>
                          <input className="input" value={form.academic.gpa} onChange={(e)=>handleNestedChange('academic','gpa', e.target.value)} placeholder="GPA" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
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


function RiskStatusPage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);
  const RiskAnalysisData = {
    data : [
  { name: 'Week 1', value: 25 },
  { name: 'Week 2', value: 20 },
  { name: 'Week 3', value: 15 },
  { name: 'Week 4', value: 18 },
  { name: 'Week 5', value: 15 },
]
  };
  const historicalData = {
  summary: [
    { title: "Average Risk Level", value: "18%", colorClass: "low-risk" },
    { title: "Highest Risk Period", value: "Week 2 (25%)", colorClass: "high-risk" },
    { title: "Risk Improvement", value: "-10%", colorClass: "positive" },
    { title: "Interventions Used", value: "2", colorClass: "" },
  ],
  timeline: [
    { week: "Week 1", risk: "25% Risk", note: "Initial assessment" },
    { week: "Week 2", risk: "20% Risk", note: "Improved attendance" },
    { week: "Week 3", risk: "15% Risk", note: "Better quiz scores" },
    { week: "Week 4", risk: "18% Risk", note: "Assignment delay" },
    { week: "Week 5", risk: "15% Risk", note: "Current status" },
  ]
};
  const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p className="value">{`Risk: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
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
      <div className="risk-trend-chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={RiskAnalysisData.data}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
            <YAxis
              domain={[0, 30]} // Adjust domain based on your expected risk percentage range
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              hide // Hide Y-axis for a cleaner look, as values are shown on points
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#5a7dfd"
              strokeWidth={3}
              dot={{ stroke: '#5a7dfd', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, stroke: '#5a7dfd', strokeWidth: 4 }}
              label={({ value, index, x, y }) => (
                <text x={x} y={y - 15} dy={-4} fill="#5a7dfd" textAnchor="middle" className="chart-label-value">
                  {`${value}%`}
                </text>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
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
          <div className="historical-analysis-section">
      <h2 className="section-title">Historical Risk Analysis</h2>
      
      {/* Historical Summary Dashboard */}
      <div className="historical-summary-card">
        {historicalData.summary.map((item, index) => (
          <div className="summary-item" key={index}>
            <h4 className="summary-title">{item.title}</h4>
            <span className={`summary-value ${item.colorClass}`}>{item.value}</span>
          </div>
        ))}
      </div>

    </div>
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
const performanceData = [
  { week: 'Week 1', score: 75, grade: 'C' },
  { week: 'Week 2', score: 78, grade: 'C+' },
  { week: 'Week 3', score: 82, grade: 'B-' },
  { week: 'Week 4', score: 85, grade: 'B' },
  { week: 'Week 5', score: 80, grade: 'B-' },
  { week: 'Week 6', score: 88, grade: 'B+' },
  { week: 'Week 7', score: 82, grade: 'B-' },
];

const subjectData = [
  { subject: 'Math', score: 88, fullMark: 100 },
  { subject: 'Physics', score: 75, fullMark: 100 },
  { subject: 'History', score: 92, fullMark: 100 },
  { subject: 'English', score: 85, fullMark: 100 },
];

const assessmentData = [
  { name: 'Quizzes', score: 85 },
  { name: 'Homework', score: 90 },
  { name: 'Midterm', score: 78 },
  { name: 'Final Exam', score: 82 },
];
function AcademicPerformancePage() {
  const session = readSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

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
        </div>

        <div className="dashboard-container">
          <div className="dashboard-section">
            <h2 className="section-title">Academic Performance Overview</h2>
            <p className="section-description">A quick snapshot of your academic standing with key metrics.</p>
            <div className="performance-metrics">
              <div className="metric-card">
                <div className="icon"><i className="fas fa-graduation-cap"></i></div>
                <div className="metric-info">
                  <h3>Overall GPA</h3>
                  <p className="metric-value">3.8/4.0</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon"><i className="fas fa-user-check"></i></div>
                <div className="metric-info">
                  <h3>Attendance Rate</h3>
                  <p className="metric-value">95%</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon"><i className="fas fa-star-half-alt"></i></div>
                <div className="metric-info">
                  <h3>Current Grade</h3>
                  <p className="metric-value">B+</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-section">
            <h2 className="section-title">Performance Trends & Insights</h2>
            <p className="section-description">Dive deeper into your academic data with interactive graphs and analytics.</p>
            <div className="chart-container">
              <div className="chart-card">
                <h3>Course Performance Trends</h3>
                <p className="chart-description">Track your grades in each subject over the semester to identify areas of improvement.</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ec" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#4c6ef5" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Subject-Wise Performance</h3>
                <p className="chart-description">Compare your average scores across different subjects to see your strengths and weaknesses.</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ec" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#a770ef" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Quiz vs. Exam Performance</h3>
                <p className="chart-description">Analyze your average score by assignment type (quizzes, exams, homework, etc.).</p>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={assessmentData}>
                    <PolarGrid stroke="#e0e6ec" />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="score" stroke="#2575fc" fill="#2575fc" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="dashboard-section">
            <h2 className="section-title">Actionable Insights</h2>
            <p className="section-description">Based on your data, here are some personalized recommendations.</p>
            <div className="insights-card">
              <div className="insight-item">
                <h4>What's Your Trend?</h4>
                <p>Your performance has been consistently **improving** over the last few weeks. Keep up the great work!</p>
              </div>
              <div className="insight-item">
                <h4>Where to Focus</h4>
                <p>Your scores in **Physics** have shown a slight dip. We recommend focusing on chapters 5 and 6 and reviewing the **Video Tutorials** in your Resources tab.</p>
              </div>
              <div className="insight-item">
                <h4>Next Steps</h4>
                <p>Consider taking a **Practice Quiz** in your most challenging subject to prepare for your upcoming exam.</p>
                <button className="btn primary-btn">Take a Practice Quiz</button>
              </div>
            </div>
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
const engagementData = [
    { week: 'Week 1', score: 75 },
    { week: 'Week 2', score: 78 },
    { week: 'Week 3', score: 82 },
    { week: 'Week 4', score: 85 },
    { week: 'Week 5', score: 80 },
    { week: 'Week 6', score: 88 },
    { week: 'Week 7', score: 82 },
  ];

  const currentScore = engagementData[engagementData.length - 1].score;
  const peakScore = Math.max(...engagementData.map(point => point.score));
  const trend = currentScore > engagementData[0].score ? 'Improving' : 'Stable';
  const weeklyData = {
  performanceData: [
    { score: 95, status: 'excellent' },
    { score: 88, status: 'excellent' },
    { score: 65, status: 'needs-improvement' },
    { score: 78, status: 'excellent' },
    { score: 84, status: 'excellent' }
  ]
};
const totalCourses = weeklyData.performanceData.length;
  const averageScore = Math.round(weeklyData.performanceData.reduce((acc, course) => acc + course.score, 0) / totalCourses);
  const excellentCourses = weeklyData.performanceData.filter(course => course.status === 'excellent').length;
  const needsAttentionCourses = weeklyData.performanceData.filter(course => course.status === 'needs-improvement').length;


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
           


    <div className="report-card">
      <div className="card-header">
        <h3 className="card-title">Weekly Report</h3>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{currentScore}%</span>
            <span className="stat-label">Engagement</span>
          </div>
          <div className="stat-item">
            <span className="stat-value risk-low">Low</span>
            <span className="stat-label">Risk Level</span>
          </div>
        </div>
      </div>

      <div className="performance-section">
        
        <div className="chart-container-recharts">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={engagementData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <YAxis domain={[70, 90]} hide /> {/* Set the domain for a better view */}
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ stroke: '#ddd', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3f51b5"
                strokeWidth={3}
                dot={{ stroke: '#fff', strokeWidth: 2, r: 6 }}
                activeDot={{ stroke: '#3f51b5', strokeWidth: 2, r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-stat">
          <span className="stat-label">Current Score:</span>
          <span className="stat-value score-primary">{currentScore}%</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Trend:</span>
          <span className={`stat-value trend ${trend === 'Improving' ? 'trend-positive' : ''}`}>
            {trend === 'Improving' ? '↗ Improving' : 'Stable'}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Peak Score:</span>
          <span className="stat-value score-primary">{peakScore}%</span>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 3L2 3L10 12.46L10 19L14 21L14 12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-icon" title="Sort by performance">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M6 12H18M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-icon" title="View more options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="19" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="course-stats-overview">
        <div className="stat-box gradient-1">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{totalCourses}</span>
            <span className="stat-label">Total Courses</span>
          </div>
        </div>
        
        <div className="stat-box gradient-2">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{averageScore}%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
        
        <div className="stat-box gradient-3">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{excellentCourses}</span>
            <span className="stat-label">Excellent</span>
          </div>
        </div>
        
        <div className="stat-box gradient-4">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{needsAttentionCourses}</span>
            <span className="stat-label">Needs Attention</span>
          </div>
        </div>
      </div>

            <div className="course-report-grid">
              {weeklyData.performanceData.map((course, index) => (
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
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [tas, setTas] = useState([]);
  const [courseView, setCourseView] = useState(null); // 'view' | 'manage' | 'gradebook' | 'announcements'

  // Instructor-specific mock data (separate from student data)
  const instructorData = {
    summary: { totalStudents: 24, activeCourses: 3, avgEngagementPct: 87, atRiskCount: 2 },
    courses: [
      { id: 'CS101', code: 'CS-101', section: 'A', term: 'Fall 2025', title: 'Intro to CS', enrolled: 12, limit: 30, avgScore: 81, risk: 'Low', lastActivity: '2d ago', schedule: 'Mon/Wed 10:00-11:30', officeHours: 'Thu 2-4 PM', syllabusUrl: '#' },
      { id: 'DS201', code: 'DS-201', section: 'B', term: 'Fall 2025', title: 'Data Structures', enrolled: 8, limit: 25, avgScore: 76, risk: 'Medium', lastActivity: '5h ago', schedule: 'Tue/Thu 11:00-12:30', officeHours: 'Fri 1-3 PM', syllabusUrl: '#' },
      { id: 'AL301', code: 'AL-301', section: 'C', term: 'Fall 2025', title: 'Algorithms', enrolled: 4, limit: 20, avgScore: 69, risk: 'High', lastActivity: '1h ago', schedule: 'Mon 3-5 PM', officeHours: 'Wed 11-12', syllabusUrl: '#' },
      { id: 'ML401', code: 'ML-401', section: 'D', term: 'Fall 2025', title: 'Machine Learning', enrolled: 22, limit: 35, avgScore: 88, risk: 'Low', lastActivity: '3d ago', schedule: 'Fri 9-11 AM', officeHours: 'Tue 4-5 PM', syllabusUrl: '#' }
    ],
    students: [
      { id: 'S001', name: 'Aarav Singh', course: 'CS101', engagementPct: 92 },
      { id: 'S002', name: 'Isha Patel', course: 'DS201', engagementPct: 85 },
      { id: 'S003', name: 'Ravi Kumar', course: 'AL301', engagementPct: 63 }
    ],
    analytics: {
      weeklyEngagement: [72, 75, 78, 80, 82, 86, 87],
      riskBreakdown: [
        { label: 'Low', value: 18 },
        { label: 'Medium', value: 4 },
        { label: 'High', value: 2 }
      ]
    },
    resources: [
      { type: 'rubric', name: 'Assignment Rubric Template', link: '#' },
      { type: 'policy', name: 'Late Submission Policy', link: '#' },
      { type: 'guide', name: 'Engagement Best Practices', link: '#' }
    ]
  };

  useEffect(() => { if (!session) navigate('/login'); }, [navigate, session]);

  const resourceCatalog = {
    'res-guides': {
      links: [
        { label: 'Engagement Best Practices (PDF)', href: '#' },
        { label: 'Assessment Design Guide (PDF)', href: '#' },
        { label: 'Accessibility Checklist (DOCX)', href: '#' },
        { label: 'Effective Feedback Techniques (PDF)', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      images: [
        'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=60'
      ]
    },
    'res-templates': {
      links: [
        { label: 'Course Syllabus Template (Google Doc)', href: '#' },
        { label: 'Project Rubric (XLSX)', href: '#' },
        { label: 'Weekly Plan Template (DOCX)', href: '#' },
        { label: 'Announcement Templates (DOCX)', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      images: [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=60'
      ]
    },
    'res-policies': {
      links: [
        { label: 'Late Submission Policy (DOCX)', href: '#' },
        { label: 'Academic Integrity Statement (PDF)', href: '#' },
        { label: 'Grading Policy (PDF)', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
      images: [
        'https://images.unsplash.com/photo-1555375771-14b2a63968a2?auto=format&fit=crop&w=800&q=60'
      ]
    },
    'res-tools': {
      links: [
        { label: 'Plagiarism Checker', href: '#' },
        { label: 'LMS Sync Guide', href: '#' },
        { label: 'Quiz Randomizer Tool', href: '#' },
        { label: 'Video Captioning Helper', href: '#' },
      ],
      videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
      images: [
        'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60'
      ]
    },
  };

  const openManage = (course) => {
    setSelectedCourse(course);
    // Mock roster/TAs per course for now
    setRoster([
      { id: 'S001', name: 'Aarav Singh', email: 'aarav@example.com' },
      { id: 'S002', name: 'Isha Patel', email: 'isha@example.com' }
    ]);
    setTas([{ id: 'T001', name: 'TA Neha', email: 'neha@example.com' }]);
    setManageOpen(true);
    setCourseView('manage');
  };

  const exportRosterCsv = () => {
    const header = 'id,name,email';
    const rows = roster.map(r => `${r.id},${r.name},${r.email}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedCourse?.id || 'course'}-roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importRosterCsv = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const dataLines = lines.slice(1); // drop header
      const parsed = dataLines.map((l, idx) => {
        const [id, name, email] = l.split(',');
        return { id: id || `S${100+idx}`, name: name || '', email: email || '' };
      });
      setRoster(parsed);
    };
    reader.readAsText(file);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar (profile card only) */}
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
          <div className="instructor-profile-card">
            <div className="profile-top">
              {session?.photoUrl ? (
                <img className="profile-photo-img" src={session.photoUrl} alt="Instructor" />
              ) : (
                <div className="profile-avatar">
                  {(session?.name || 'Instructor').split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <div className="profile-info">
                <h4>{session?.name || 'Instructor'}</h4>
                <p>Instructor</p>
              </div>
            </div>
            <p className="profile-bio">Empowering learners with engaging coursework and data-driven guidance.</p>
            <div className="profile-meta">
              <div>Department: Computer Science</div>
              <div>Email: instructor@example.com</div>
            </div>
            <div className="profile-tags">
              <span className="tag">Teaching</span>
              <span className="tag">Analytics</span>
              <span className="tag">Mentorship</span>
            </div>
            <div className="profile-stats">
              <div className="stat-chip">24 Students</div>
              <div className="stat-chip">3 Courses</div>
            </div>
            <div className="profile-actions">
              <button className="btn small" onClick={() => navigate('/profile')}>View Profile</button>
              <button className="btn small ghost" onClick={() => navigate('/resources')}>Resources</button>
            </div>
          </div>
        </div>

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
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'courses' ? 'My Courses' : activeTab === 'students' ? 'Students' : activeTab === 'analytics' ? 'Analytics' : 'Resources'}</h1>
          </div>
          <div className="header-right">
            <button className="btn ghost" onClick={() => navigate('/')}>Back</button>
            <div className="header-stats">
              <span className="stat-item">
                <span className="stat-value">{instructorData.summary.totalStudents}</span>
                <span className="stat-label">Students</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{instructorData.summary.activeCourses}</span>
                <span className="stat-label">Courses</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2>Welcome, {session?.name || 'Instructor'}!</h2>
              <p>Manage your courses, track student progress, and view key analytics.</p>

              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon students"></div>
                  <div className="stat-content">
                    <div className="stat-value">{instructorData.summary.totalStudents}</div>
                    <div className="stat-label">Total Students</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon courses"></div>
                  <div className="stat-content">
                    <div className="stat-value">{instructorData.summary.activeCourses}</div>
                    <div className="stat-label">Active Courses</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon engagement"></div>
                  <div className="stat-content">
                    <div className="stat-value">{instructorData.summary.avgEngagementPct}%</div>
                    <div className="stat-label">Avg Engagement</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon risk"></div>
                  <div className="stat-content">
                    <div className="stat-value">{instructorData.summary.atRiskCount}</div>
                    <div className="stat-label">At Risk</div>
                  </div>
                </div>
              </div>
              <div className="cards-grid">
                <div className="card">
                  <h4>Quick Actions</h4>
                  <div className="pill-row">
                    <button className="btn small">Create Assignment</button>
                    <button className="btn small">Post Announcement</button>
                    <button className="btn small">Schedule Session</button>
                  </div>
                </div>
                <div className="card">
                  <h4>Upcoming Items</h4>
                  <ul className="list plain">
                    <li>Assignment 2 due Friday (CS101)</li>
                    <li>Quiz: Trees & Graphs next Tuesday (DS201)</li>
                    <li>Office Hours: Thursday 3PM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="dashboard-container">
            <div className="dashboard-section courses-bg">
              <div className="courses-bg-img" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/classroom.webp'})` }}></div>
              <h2>My Courses</h2>
              <div className="courses-grid">
                {instructorData.courses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-card-header">
                      <div>
                        <h4 className="course-title">{course.title}</h4>
                        <div className="course-sub">{course.code} • Sec {course.section} • {course.term}</div>
                      </div>
                      <span className={`risk-chip ${String(course.risk).toLowerCase()}`}>{course.risk} Risk</span>
                      </div>
                    <div className="course-metrics">
                      <div className="metric"><span className="metric-label">Enrolled</span><span className="metric-value">{course.enrolled}/{course.limit}</span></div>
                      <div className="metric"><span className="metric-label">Avg Score</span><span className="metric-value">{course.avgScore}%</span></div>
                      <div className="metric"><span className="metric-label">Last Activity</span><span className="metric-value">{course.lastActivity}</span></div>
                    </div>
                    <div className="course-extra">
                      <div className="extra-item"><span className="extra-label">Schedule</span><span className="extra-value">{course.schedule}</span></div>
                      <div className="extra-item"><span className="extra-label">Office Hours</span><span className="extra-value">{course.officeHours}</span></div>
                      <div className="extra-item"><span className="extra-label">Syllabus</span><a className="extra-link" href={course.syllabusUrl}>Open</a></div>
                    </div>
                    <div className="course-actions">
                      <button className="btn small" onClick={() => { setSelectedCourse(course); setCourseView('view'); }}>View</button>
                      <button className="btn small" onClick={() => openManage(course)}>Manage</button>
                      <button className="btn small ghost" onClick={() => { setSelectedCourse(course); setCourseView('gradebook'); }}>Gradebook</button>
                      <button className="btn small ghost" onClick={() => { setSelectedCourse(course); setCourseView('announcements'); }}>Announcements</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2>Students</h2>
              <div className="list">
                {instructorData.students.map(s => (
                  <div key={s.id} className="list-item">
                    <div className="list-item-main">
                      <strong>{s.name}</strong>
                      <span className="muted">{s.course}</span>
                    </div>
                    <div className="list-item-meta">
                      <span>Engagement {s.engagementPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2>Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Weekly Engagement</h4>
                  <div className="trend-chart-mini">
                    {instructorData.analytics.weeklyEngagement.map((score, index) => (
                      <div key={index} className="trend-point" style={{
                        left: `${(index / (instructorData.analytics.weeklyEngagement.length - 1)) * 100}%`,
                        bottom: `${score}%`
                      }}>
                        <div className="trend-dot"></div>
                        <div className="trend-value">{score}%</div>
                      </div>
                    ))}
                    <div className="trend-line"></div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h4>Risk Breakdown</h4>
                  <div className="pill-row">
                    {instructorData.analytics.riskBreakdown.map((r, idx) => (
                      <span key={idx} className="pill">{r.label}: {r.value}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="dashboard-container">
            <div className="dashboard-section">
              <h2>Resources</h2>
              <div className="resource-tiles">
                {[
                  { key: 'guides', title: 'Guides', color: '#f59e0b', desc: 'Best practices and how-tos', icon: '📘', count: 8, highlights: ['Engagement tips', 'Assessment design'] },
                  { key: 'templates', title: 'Templates', color: '#ef4444', desc: 'Rubrics, syllabi, checklists', icon: '🧩', count: 12, highlights: ['Project rubric', 'Syllabus v2.1'] },
                  { key: 'policies', title: 'Policies', color: '#8b5cf6', desc: 'Classroom and grading policies', icon: '⚖️', count: 5, highlights: ['Late work policy', 'Academic integrity'] },
                  { key: 'tools', title: 'Tools', color: '#f97316', desc: 'Integrations and utilities', icon: '🛠️', count: 6, highlights: ['Plagiarism checker', 'LMS sync'] }
                ].map((tile, idx) => (
                  <button key={tile.key} className="resource-tile" style={{ ['--tile-color']: tile.color }} onClick={() => setCourseView(`res-${tile.key}`)}>
                    <div className="tile-icon" aria-hidden="true">{tile.icon}</div>
                    <div className="tile-body">
                      <div className="tile-title">{tile.title}</div>
                      <div className="tile-desc">{tile.desc}</div>
                      <ul className="tile-highlights">
                        {tile.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                      <div>
                        <button type="button" className="btn small light" onClick={(e) => { e.stopPropagation(); setCourseView(`res-${tile.key}`); }}>Open</button>
                    </div>
                    </div>
                    <div className="tile-aside">
                      <span className="tile-count">{tile.count}</span>
                      <div className="tile-num" aria-hidden="true">{idx+1}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Bottom expanded navbar */}
        <div className="bottom-nav">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses</button>
          <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Resources</button>
          <NavLink to="/my-students" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>My Students</NavLink>
        </div>
        {/* On-screen detail panel (View/Manage/Gradebook/Announcements) */}
        {(courseView && (selectedCourse || String(courseView).startsWith('res-'))) && (
          <div className="course-detail-panel">
            <div className="panel-header">
              {String(courseView).startsWith('res-') ? (
                <>
                  <div>
                    <h3 className="panel-title">Resources</h3>
                    <div className="panel-sub">{courseView==='res-guides' ? 'Guides' : courseView==='res-templates' ? 'Templates' : courseView==='res-policies' ? 'Policies' : 'Tools'}</div>
                  </div>
                  <div className="panel-tabs">
                    <button className="btn ghost" onClick={()=>{ setCourseView(null); setManageOpen(false); }}>Close</button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="panel-title">{selectedCourse.title}</h3>
                    <div className="panel-sub">{selectedCourse.code} • Sec {selectedCourse.section} • {selectedCourse.term}</div>
                  </div>
                  <div className="panel-tabs">
                    <button className={`tab-btn ${courseView==='view'?'active':''}`} onClick={()=>setCourseView('view')}>View</button>
                    <button className={`tab-btn ${courseView==='manage'?'active':''}`} onClick={()=>{ if(!manageOpen) openManage(selectedCourse); else setCourseView('manage'); }}>Manage</button>
                    <button className={`tab-btn ${courseView==='gradebook'?'active':''}`} onClick={()=>setCourseView('gradebook')}>Gradebook</button>
                    <button className={`tab-btn ${courseView==='announcements'?'active':''}`} onClick={()=>setCourseView('announcements')}>Announcements</button>
                    <button className="btn ghost" onClick={()=>{ setCourseView(null); setManageOpen(false); }}>Close</button>
                  </div>
                </>
              )}
            </div>
            <div className="panel-body">
              {courseView==='view' && (
                <div className="panel-grid">
                  <div className="panel-card">
                    <h4>Overview</h4>
                    <p>Enrolled: {selectedCourse.enrolled}/{selectedCourse.limit}</p>
                    <p>Average Score: {selectedCourse.avgScore}%</p>
                    <p>Last Activity: {selectedCourse.lastActivity}</p>
                  </div>
                  <div className="panel-card">
                    <h4>Upcoming</h4>
                    <ul className="list plain">
                      <li>Assignment 2 due Friday</li>
                      <li>Quiz next Tuesday</li>
                    </ul>
                  </div>
                </div>
              )}
              {courseView==='manage' && (
                <div className="manage-grid">
                  <div className="manage-section">
                    <h4>Roster</h4>
                    <div className="roster-list">
                      {roster.map(s => (
                        <div key={s.id} className="roster-row">
                          <div>
                            <strong>{s.name}</strong>
                            <div className="muted">{s.email}</div>
                          </div>
                          <button className="btn small ghost" onClick={() => setRoster(prev => prev.filter(r => r.id !== s.id))}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="roster-actions">
                      <button className="btn small" onClick={exportRosterCsv}>Export CSV</button>
                      <label className="btn small ghost">
                        Import CSV
                        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => e.target.files && e.target.files[0] && importRosterCsv(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                  <div className="manage-section">
                    <h4>Invite</h4>
                    <div className="invite-box">
                      <div>Join Code: <strong>{selectedCourse.id}-JOIN</strong></div>
                      <div>Invite Link:</div>
                      <div className="invite-link">https://app.learnlytics.example/join/{selectedCourse.id}</div>
                      <div className="invite-actions">
                        <button className="btn small" onClick={() => navigator.clipboard.writeText(`${selectedCourse.id}-JOIN`)}>Copy Code</button>
                        <button className="btn small ghost" onClick={() => navigator.clipboard.writeText(`https://app.learnlytics.example/join/${selectedCourse.id}`)}>Copy Link</button>
                      </div>
                    </div>
                    <h4>Teaching Assistants</h4>
                    <div className="roster-list">
                      {tas.map(t => (
                        <div key={t.id} className="roster-row">
                          <div>
                            <strong>{t.name}</strong>
                            <div className="muted">{t.email}</div>
                          </div>
                          <button className="btn small ghost" onClick={() => setTas(prev => prev.filter(x => x.id !== t.id))}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="roster-actions">
                      <button className="btn small" onClick={() => setTas(prev => [...prev, { id: `T${100+prev.length}`, name: 'New TA', email: 'ta@example.com' }])}>Add TA</button>
                    </div>
                  </div>
                </div>
              )}
              {courseView==='gradebook' && (
                <div className="panel-card">
                  <h4>Gradebook (placeholder)</h4>
                  <p>Display grade distribution and per-student grades here.</p>
                </div>
              )}
              {courseView==='announcements' && (
                <div className="panel-card">
                  <h4>Announcements (placeholder)</h4>
                  <p>Create and manage course announcements.</p>
                </div>
              )}
              {String(courseView).startsWith('res-') && (
                <div className="panel-grid">
                  <div className="panel-card">
                    <h4>{courseView==='res-guides' ? 'Guides' : courseView==='res-templates' ? 'Templates' : courseView==='res-policies' ? 'Policies' : 'Tools'} — Featured Video</h4>
                    <div className="video-wrapper">
                      <iframe
                        src={(resourceCatalog[courseView]?.videoUrl) || ''}
                        title="Resource Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <div className="panel-card">
                    <h4>Resources</h4>
                    <ul className="resource-links">
                      {(resourceCatalog[courseView]?.links || []).map((item, i) => (
                        <li key={i}><a className="resource-link" href={item.href} target="_blank" rel="noreferrer">{item.label}</a></li>
                      ))}
                    </ul>
                    <div className="gallery">
                      {(resourceCatalog[courseView]?.images || []).map((src, i) => (
                        <img key={i} className="gallery-img" src={src} alt="Resource visual" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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


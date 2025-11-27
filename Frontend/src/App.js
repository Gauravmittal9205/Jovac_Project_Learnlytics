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
import RecommendationPage from './components/RecommendationPage';
import CourseAnalysisPage from './components/CourseAnalysisPage';
import FeedbackPage from './components/Feedback';
import ResourcesPage from './components/ResourcePage';
import Home from './components/Home'
import MyInstructorsPage from './components/MyInstructorPage';
import SubscriptionPlans from './components/Payment/SubscriptionPlans';
import SchedulePage from './components/SchedulePage';
import AcademicPerformancePage from './components/AcademicPerformancePage'
import MyStudentsPage from './components/MyStudentPage';

// Stripe imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load Stripe with your publishable key
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;


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
    <>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
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
                      <li><a href="#pricing"><span className="nav-icon" aria-hidden="true"></span><span>Pricing</span></a></li>
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
                <Route path="/forget" element={
                  <PublicRoute>
                    <ForgotPasswordPage />
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
        </Elements>
      ) : (
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
                    <li><a href="#pricing" className="nav-link"><span className="nav-icon" aria-hidden="true"></span><span>Pricing</span></a></li>
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
              <Route path="/forget" element={
                <PublicRoute>
                  <ForgotPasswordPage />
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
      )}
    </>
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
            <Link to="/forget">Forgot password?</Link>
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
export default App;
function instructorOverview() {
  return <InstructorDashboard />;
}


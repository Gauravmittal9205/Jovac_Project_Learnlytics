import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

// Pages
import Help from "./Help";
import About from "./About";
import Resources from "./Resources";
import Home from "./components/Home";
import ProfileNew from "./components/ProfileNew";
import Contact from "./Contact";

import OverviewPage from "./components/Overview_Page";
import InstructorDashboard from "./components/Instructor_Dashboard";
import WeeklyReport from "./components/Weekly_report";
import RiskStatusPage from "./components/RiskStatusPage";
import RecommendationPage from "./components/RecommendationPage";
import CourseAnalysisPage from "./components/CourseAnalysisPage";
import FeedbackPage from "./components/Feedback";
import ResourcesPage from "./components/ResourcePage";
import MyInstructorsPage from "./components/MyInstructorPage";
import SchedulePage from "./components/SchedulePage";
import AcademicPerformancePage from "./components/AcademicPerformancePage";
import MyStudentsPage from "./components/MyStudentPage";

// ======================
// AUTH CONFIG
// ======================

export const API_URL =
  "https://jovacprojectlearnlytics-production.up.railway.app/api/auth";

export const SESSION_KEY = "learnlytics_session";

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (data) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));

const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const AuthContext = createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ================
  // Auto-restore user
  // ================
  useEffect(() => {
    const session = readSession();
    if (session?.token) verifyUser(session.token);
    else setIsLoading(false);
  }, []);

  const verifyUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { "x-auth-token": token },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Token invalid");

      const data = await response.json();
      const user = { ...data.user, token };
      writeSession(user);
      setCurrentUser(user);
    } catch {
      clearSession();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================
  // LOGIN
  // =====================
  const login = async (token, user) => {
    const sessionUser = { ...user, token };
    writeSession(sessionUser);
    setCurrentUser(sessionUser);
    await verifyUser(token);
  };

  // =====================
  // LOGOUT
  // =====================
  const logout = () => {
    clearSession();
    setCurrentUser(null);
    navigate("/login");
  };

  // =====================
  // PROTECTED ROUTE
  // =====================
  const ProtectedRoute = ({ children, roles = [] }) => {
    if (isLoading) return <div>Loading...</div>;
    if (!currentUser)
      return <Navigate to="/login" state={{ from: location }} replace />;

    if (roles.length && !roles.includes(currentUser.role))
      return <Navigate to="/unauthorized" replace />;

    return children;
  };

  // =====================
  // PUBLIC ROUTE
  // =====================
  const PublicRoute = ({ children }) => {
    if (isLoading) return <div>Loading...</div>;
    if (currentUser)
      return (
        <Navigate
          to={
            currentUser.role === "instructor"
              ? "/dashboard-instructor"
              : "/overview"
          }
          replace
        />
      );
    return children;
  };

  const authContextValue = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="site">
        {/* NAVBAR */}
        {!window.location.pathname.includes("/dashboard-") && (
          <nav className="navbar">
            <div className="container nav-inner">
              <div className="brand">
                <span className="logo-shield">🛡️</span>
                <span className="brand-text">Learnlytics</span>
              </div>

              <ul className="nav-links">
                <li>
                  <Link to="/about">About</Link>
                </li>

                <li>
                  <Link to="/resources">Resources</Link>
                </li>

                <li>
                  <Link to="/contact">Contact</Link>
                </li>

                <li>
                  <Link to="/help">Help</Link>
                </li>
              </ul>

              <div className="auth-actions">
                {!currentUser ? (
                  <>
                    <button className="btn ghost" onClick={() => navigate("/login")}>
                      Login
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => navigate("/register")}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn primary"
                      onClick={() =>
                        navigate(
                          currentUser.role === "instructor"
                            ? "/dashboard-instructor"
                            : "/overview"
                        )
                      }
                    >
                      Dashboard
                    </button>
                    <button className="btn ghost" onClick={logout}>
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />

          {/* AUTH ROUTES */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* PROTECTED ROUTES */}
          <Route
            path="/overview"
            element={
              <ProtectedRoute>
                <OverviewPage />
              </ProtectedRoute>
            }
          />

          <Route path="/profile" element={<ProfileNew />} />

          <Route
            path="/dashboard-instructor"
            element={
              <ProtectedRoute roles={["instructor"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/weekly-report"
            element={
              <ProtectedRoute>
                <WeeklyReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/risk-status"
            element={
              <ProtectedRoute>
                <RiskStatusPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-instructors"
            element={
              <ProtectedRoute>
                <MyInstructorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendation/:topic"
            element={
              <ProtectedRoute>
                <RecommendationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course-analysis"
            element={
              <ProtectedRoute>
                <CourseAnalysisPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/academic-performance"
            element={
              <ProtectedRoute>
                <AcademicPerformancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-students"
            element={
              <ProtectedRoute roles={["instructor"]}>
                <MyStudentsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

// ========================
// LOGIN PAGE COMPONENT
// ========================

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>Login</h2>

        {error && <div className="form-error">{error}</div>}

        <div className="role-tabs">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            className={role === "instructor" ? "active" : ""}
            onClick={() => setRole("instructor")}
          >
            Instructor
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary">Login</button>
        </form>
      </div>
    </div>
  );
}

// ========================
// REGISTER PAGE
// ========================

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) return setError("Passwords do not match");

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Account created! Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={onSubmit}>
          <label>Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <div className="role-tabs">
            <button
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
              type="button"
            >
              Student
            </button>
            <button
              className={role === "instructor" ? "active" : ""}
              onClick={() => setRole("instructor")}
              type="button"
            >
              Instructor
            </button>
          </div>

          <button className="btn primary">Register</button>
        </form>
      </div>
    </div>
  );
}

export default App;



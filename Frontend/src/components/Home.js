import React, { useState, useRef, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import WebinarRegistrationModal from './WebinarRegistrationModal';
import PaymentFormModal from './PaymentFormModal';
import SubscriptionSuccessModal from './SubscriptionSuccessModal';
import {StepCard,Stat,WebinarCard,FooterCol,NewsletterSignup} from './HomeComponents';
import CustomSubscriptionModal from './CustomSubscriptionModal';
import AIChatbotModal from './AI_Chat_Bot';
import PricingCard from './PricingCard';
import { ImOpt } from 'react-icons/im';
import SubscriptionPlans from './Payment/SubscriptionPlans';
import HackathonsSection from './HackathonsSection';
import styled from 'styled-components';

const SESSION_KEY = 'learnlytics_session';
const API_URL = 'http://localhost:5000/api/auth';

function readSession(){
  try { 
    const raw = localStorage.getItem(SESSION_KEY); 
    return raw ? JSON.parse(raw) : null; 
  } catch { 
    return null; 
  }
}

function clearSession(){ 
  localStorage.removeItem(SESSION_KEY); 
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

      {/* Why choose us */}
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

      {/* Upcoming Hackathons & Webinars */}
      <HackathonsSection />

      {/* Subscription Plans Section */}
      <SubscriptionSection id="pricing">
        <div className="container">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-sub">Choose the perfect plan for your needs</p>
          <SubscriptionPlans />
          <div className="enterprise-cta">
            <p>Need a custom solution for your institution?</p>
            <button 
              className="btn outline" 
              onClick={() => setCustomSubscription({ isOpen: true, plan: 'enterprise' })}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </SubscriptionSection>

      

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

// Styled Components
const SubscriptionSection = styled.section`
  padding: 4rem 0;
  background: #f8fafc;
  text-align: center;
  
  .section-title {
    font-size: 2.5rem;
    color: #1e293b;
    margin-bottom: 1rem;
  }
  
  .section-sub {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 3rem;
  }
  
  .enterprise-cta {
    margin-top: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    
    p {
      font-size: 1.125rem;
      color: #475569;
      margin-bottom: 1.5rem;
    }
    
    .btn.outline {
      background: transparent;
      border: 2px solid #4f46e5;
      color: #4f46e5;
      font-weight: 600;
      padding: 0.75rem 2rem;
      transition: all 0.2s ease;
      
      &:hover {
        background: #4f46e5;
        color: white;
      }
    }
  }
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
    
    .section-title {
      font-size: 2rem;
    }
    
    .section-sub {
      font-size: 1.1rem;
    }
  }
`;

export default Home;
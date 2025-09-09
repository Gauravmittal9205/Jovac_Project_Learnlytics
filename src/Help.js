import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Help(){
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState('q1');

  const faqs = [
    { id: 'q1', q: 'How do I get started with Learnlytics?', a: 'Click Sign Up in the top right, choose your role, and follow the guided onboarding to connect your LMS.' },
    { id: 'q2', q: 'Is my data secure?', a: 'Yes. We follow FERPA/GDPR principles, encrypt data in transit and at rest, and apply role-based access controls.' },
    { id: 'q3', q: 'Where can I find documentation?', a: 'See Resources for quick-starts, videos, and API docs. You can also contact support for specific questions.' },
    { id: 'q4', q: 'How are risk scores calculated?', a: 'We aggregate engagement events and apply explainable models. Each alert includes top contributing factors.' },
    { id: 'q5', q: 'Does Learnlytics integrate with my LMS?', a: 'We support Canvas, Moodle, Google Classroom, and Blackboard. More integrations can be enabled on request.' },
    { id: 'q6', q: 'Can instructors and students have different dashboards?', a: 'Yes. The experience is role-based. Instructors see class-level analytics and alerts; students see their own progress and recommendations.' },
    { id: 'q7', q: 'How do I reset my password?', a: 'Use the Forgot password link on the Login page. You will receive an email with reset instructions.' },
    { id: 'q8', q: 'Is there a free trial?', a: 'Yes. You can start a 14-day free trial from the Pricing section. No charges during the trial—cancel anytime.' },
    { id: 'q9', q: 'How can I contact support?', a: 'Go to Contact and use the form, or email support@learnlytics.app. Priority support is available on paid plans.' },
    { id: 'q10', q: 'Can I export reports?', a: 'Reports can be exported as CSV or PDF from the Reports section. Automated weekly emails can also be scheduled.' },
  ];

  const filtered = faqs.filter(item =>
    item.q.toLowerCase().includes(query.toLowerCase()) ||
    item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="help-page">
      <div className="help-hero">
        <div className="container help-hero-inner">
          <div className="help-copy">
            <h1>Help Center</h1>
            <p className="muted">Find answers fast, or reach our support team.</p>
            <div className="help-search">
              <span className="search-icon" aria-hidden="true">🔎</span>
              <input
                type="search"
                placeholder="Search articles, topics, or questions"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                aria-label="Search help center"
              />
            </div>
            <div className="help-quicklinks">
              <Link to="/resources" className="ql">Resources</Link>
              <Link to="/contact" className="ql">Contact Support</Link>
              <a href="#faqs" className="ql">FAQs</a>
            </div>
          </div>
          <div className="help-art" aria-hidden="true"></div>
        </div>
      </div>

      <div className="container help-content" id="faqs">
        <h2 className="section-title">Frequently asked questions</h2>
        <p className="section-sub">Can’t find it here? Reach out via Contact.</p>

        <div className="faq-list">
          {filtered.map((item) => (
            <div key={item.id} className={`faq ${openId===item.id? 'open' : ''}`}>
              <button
                className="faq-head"
                onClick={()=>setOpenId(openId===item.id? '' : item.id)}
                aria-expanded={openId===item.id}
                aria-controls={`panel-${item.id}`}
              >
                <span className="faq-q">{item.q}</span>
                <span className="chev" aria-hidden="true">{openId===item.id? '▾' : '▸'}</span>
              </button>
              <div id={`panel-${item.id}`} className="faq-body">
                {item.a}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="no-results">
              <span role="img" aria-label="no results">🔍</span>
              <div>
                <div className="no-title">No results for “{query}”</div>
                <div className="muted">Try a different keyword or browse the quick links above.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



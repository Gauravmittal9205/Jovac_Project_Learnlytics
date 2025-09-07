import React from 'react';

function TabButton({ active, onClick, children }){
  return (
    <button className={`tab-pill ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
  );
}

const SECTIONS = [
  { key: 'all', label: 'All' },
  { key: 'cases', label: 'Case studies' },
  { key: 'webinars', label: 'Webinars' },
  { key: 'hackathons', label: 'Hackathons' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'certifications', label: 'Certifications' },
];

const ITEMS = [
  // Case studies
  { id: 'cs-cc', category: 'cases', title: 'Community college', sub: 'Boosting pass rates', img: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cs-k12', category: 'cases', title: 'K‑12 district', sub: 'Improving attendance', img: 'https://images.unsplash.com/photo-1523246191548-8b1421f6b7cf?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cs-uni', category: 'cases', title: 'University', sub: 'Reducing DFW rates', img: 'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?q=80&w=1200&auto=format&fit=crop' },
  // Webinars
  { id: 'wb-tour', category: 'webinars', title: '15‑min product tour', sub: 'Guided overview', img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop' },
  { id: 'wb-explain', category: 'webinars', title: 'Designing explainable alerts', sub: 'What makes alerts trustworthy', img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1200&auto=format&fit=crop' },
  { id: 'wb-privacy', category: 'webinars', title: 'Privacy‑first analytics', sub: 'Safeguards that matter', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop' },
  // Hackathons
  { id: 'hk-campus', category: 'hackathons', title: 'Campus hackathon', sub: '48‑hour student sprint', img: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'hk-edu', category: 'hackathons', title: 'EdTech weekend', sub: 'Instructor‑led challenges', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop' },
  // Quizzes
  { id: 'qz-ai', category: 'quizzes', title: 'AI literacy quiz', sub: '10‑minute check', img: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop' },
  { id: 'qz-ethics', category: 'quizzes', title: 'Ethics & privacy quiz', sub: 'Classroom scenarios', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop' },
  // Certifications
  { id: 'cf-instructor', category: 'certifications', title: 'Certified Instructor', sub: 'Learnlytics Level 1', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cf-admin', category: 'certifications', title: 'Certified Admin', sub: 'Deploy & govern', img: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=1200&auto=format&fit=crop' },
];

export default function Resources(){
  const [active, setActive] = React.useState('all');
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('show'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const filtered = React.useMemo(() => {
    if (active === 'all') return ITEMS;
    return ITEMS.filter(i => i.category === active);
  }, [active]);

  return (
    <div className="resources-page">
      <header className="resources-hero">
        <div className="container resources-hero-inner">
          <div className="resources-copy reveal">
            <h1>Resources</h1>
            <p>Concise playbooks, templates, videos, and guides to help you get results fast.</p>
          </div>
          <div className="resources-art reveal" aria-hidden="true">
            <img className="tilt" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" alt="People collaborating"/>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="tabs-row">
          {SECTIONS.map(s => (
            <TabButton key={s.key} active={active===s.key} onClick={() => setActive(s.key)}>{s.label}</TabButton>
          ))}
        </div>

        <section className="resource-section reveal">
          <h2 className="section-title">{SECTIONS.find(s=>s.key===active)?.label || 'All'}</h2>
          <div className="grid-3">
            {filtered.map(item => (
              <Tile key={item.id} img={item.img} title={item.title} sub={item.sub} />
            ))}
          </div>
        </section>

        <section className="cta-block">
          <div className="cta-card reveal">
            <div>
              <h3>Explore our Starter Kit</h3>
              <p>Download the Instructor Starter Kit PDF or try the Sandbox course.</p>
            </div>
            <div className="cta-actions">
              <a className="btn primary" href="#">Download kit</a>
              <a className="btn ghost" href="#">Try sandbox</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Tile({ img, title, sub }){
  return (
    <div className="tile">
      <img className="tilt" src={img} alt={title} />
      <div className="tile-meta">
        <div className="tile-title">{title}</div>
        <div className="tile-sub">{sub}</div>
      </div>
    </div>
  );
}

function DocCard({ title, desc }){
  return (
    <div className="doc-card">
      <div className="doc-icon" aria-hidden="true">📄</div>
      <div>
        <div className="doc-title">{title}</div>
        <div className="doc-desc">{desc}</div>
      </div>
      <a className="doc-action" href="#">View</a>
    </div>
  );
}



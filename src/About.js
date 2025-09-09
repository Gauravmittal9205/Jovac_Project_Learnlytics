import React from 'react';


function WhyItem({ icon, title, text, proof }){
  return (
    <div className="why-item">
      <div className="why-icon" aria-hidden="true">{icon}</div>
      <div>
        <h3 className="why-title">{title}</h3>
        <p className="why-text">{text}</p>
        {proof && <span className="chip">{proof}</span>}
      </div>
    </div>
  );
}

export default function About(){
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-copy reveal">
            <h1>About Learnlytics</h1>
            <p>Helping every learner succeed by giving instructors timely, explainable insights and simple actions that improve outcomes.</p>
            <div className="hero-cta">
              <a className="btn primary" href="#mission">Our Mission</a>
              <a className="btn ghost" href="#contact">Contact</a>
            </div>
          </div>
          <div className="about-hero-art reveal" aria-hidden="true">
            <img className="tilt" src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop" alt="Analytics dashboard illustration"/>
          </div>
        </div>
      </header>

      <section id="mission" className="container about-section">
        <h2 className="section-title">Our mission</h2>
        <p className="section-sub">We focus on measurable student outcomes, not vanity dashboards. We aggregate LMS signals into a clear picture, surface explainable risk alerts, and close the loop with actions that show real impact.</p>
        <div className="cards reveal">
          <div className="card">
            <div className="card-icon" aria-hidden="true">📡</div>
            <h3 className="card-title">Aggregate</h3>
            <p className="card-text">Bring together engagement, assessments, and activity to see the full story.</p>
          </div>
          <div className="card">
            <div className="card-icon" aria-hidden="true">🧭</div>
            <h3 className="card-title">Explain</h3>
            <p className="card-text">Every alert includes the “why” and confidence so instructors can trust it.</p>
          </div>
          <div className="card">
            <div className="card-icon" aria-hidden="true">⚡</div>
            <h3 className="card-title">Act</h3>
            <p className="card-text">Nudges, targeted resources, and reports that prove what worked.</p>
          </div>
        </div>
      </section>

      <section className="container about-section">
        <h2 className="section-title">Why instructors choose us</h2>
        <p className="section-sub">Co‑designed with educators. Fast setup. Explainable and privacy‑first.</p>
        <div className="why-grid reveal">
          <WhyItem icon="🧩" title="Explainable AI" text="Clear reason behind every alert, with confidence levels." proof="Transparent" />
          <WhyItem icon="⚙️" title="Fast setup" text="From zero to insights in under 10 minutes." proof="Quick start" />
          <WhyItem icon="🛡️" title="Privacy‑first" text="Encryption, RBAC, and strict data minimization." proof="FERPA/GDPR" />
        </div>
      </section>

      <section className="container about-gallery about-section">
        <h2 className="section-title">Inside the product</h2>
        <p className="section-sub">Hover images to explore — they gently zoom and tilt.</p>
        <div className="gallery-grid reveal">
          <figure className="gallery-item"><img className="tilt" src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop" alt="Dashboard view"/><figcaption>Dashboard</figcaption></figure>
          <figure className="gallery-item"><img className="tilt" src="https://images.unsplash.com/photo-1553867745-1e2f3a63d8d3?q=80&w=1200&auto=format&fit=crop" alt="Alerts view"/><figcaption>Alerts</figcaption></figure>
          <figure className="gallery-item"><img className="tilt" src="https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=1200&auto=format&fit=crop" alt="Recommendations view"/><figcaption>Recommendations</figcaption></figure>
          <figure className="gallery-item"><img className="tilt" src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop" alt="Reports view"/><figcaption>Reports</figcaption></figure>
        </div>
      </section>

      <section className="stats impact">
        <div className="container stat-grid">
          <div className="stat reveal"><div className="stat-value">92%</div><div className="stat-label">Timely interventions</div></div>
          <div className="stat reveal"><div className="stat-value">200+</div><div className="stat-label">Institutions</div></div>
          <div className="stat reveal"><div className="stat-value">30%</div><div className="stat-label">Fewer unseen at‑risk</div></div>
          <div className="stat reveal"><div className="stat-value">10m</div><div className="stat-label">Setup minutes</div></div>
        </div>
      </section>



      <section className="container privacy-leadership about-section">
        <div className="split reveal">
          <div>
            <h3>Privacy & security</h3>
            <p>Data minimization, encryption in transit and at rest, strict role‑based access, and annual audits.</p>
          </div>
          <div>
            <h3>Leadership</h3>
            <p>Education, data science, and product leaders with classroom and district experience.</p>
          </div>
        </div>
      </section>

      <section className="container cta-block about-section">
        <div className="cta-card reveal">
          <div>
            <h3>See Learnlytics in action</h3>
            <p>Book a 15‑minute demo or try the sandbox to explore on your own.</p>
          </div>
          <div className="cta-actions">
            <a className="btn primary" href="#">Book demo</a>
            <a className="btn ghost" href="#">Try sandbox</a>
          </div>
        </div>
      </section>
    </div>
  );
}




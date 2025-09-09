import React from 'react';

function InfoRow({ label, value, href }){
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      {href ? (
        <a className="info-value" href={href} target="_blank" rel="noreferrer">{value}</a>
      ) : (
        <div className="info-value">{value}</div>
      )}
    </div>
  );
}

export default function Contact(){
  const [sent, setSent] = React.useState(false);
  const formRef = React.useRef(null);

  function handleSubmit(e){
    e.preventDefault();
    const data = new FormData(formRef.current);
    // Simulate async submit
    setTimeout(() => {
      console.log('Contact form payload', Object.fromEntries(data.entries()));
      setSent(true);
    }, 400);
  }

  return (
    <div className="contact-page">
      <header className="contact-hero">
        <div className="container contact-hero-inner">
          <div>
            <h1>We’re here to help</h1>
            <p className="muted">Response within 1 business day for general queries; 4 hours for priority support.</p>
          </div>
        </div>
      </header>

      <section className="container contact-content">
        <div className="contact-grid">
          <div className="contact-left">
            <h2 className="section-title">Contact options</h2>
            <div className="contact-card">
              <InfoRow label="Sales" value="sales@learnytics.app" href="mailto:sales@learnytics.app" />
              <InfoRow label="Support" value="support@learnytics.app" href="mailto:support@learnytics.app" />
              <InfoRow label="Partnerships" value="partners@learnytics.app" href="mailto:partners@learnytics.app" />
              <InfoRow label="Press" value="press@learnytics.app" href="mailto:press@learnytics.app" />
              <InfoRow label="Phone" value="+1 (800) LEARN-ED" href="tel:+18005327633" />
              <InfoRow label="Office hours" value="Mon–Fri, 9am–6pm local" />
            </div>

            <h3>Address</h3>
            <div className="contact-card">
              <InfoRow label="HQ" value="123 Educator Way, Suite 400, Austin, TX 78701" />
              <InfoRow label="Link" value="View on map" href="https://maps.google.com/?q=123+Educator+Way,+Austin,+TX+78701" />
            </div>
          </div>

          <div className="contact-right">
            <h2 className="section-title">Contact form</h2>
            {!sent ? (
              <form ref={formRef} className="form contact-form" onSubmit={handleSubmit}>
                <div className="grid-2">
                  <label>Name<input name="name" type="text" placeholder="Your full name" required /></label>
                  <label>Work email<input name="email" type="email" placeholder="you@school.edu" required /></label>
                </div>
                <div className="grid-2">
                  <label>Institution<input name="institution" type="text" placeholder="e.g., Austin HS" /></label>
                  <label>Role
                    <select name="role" defaultValue="Instructor">
                      <option>Student</option>
                      <option>Instructor</option>
                      <option>Admin</option>
                      <option>Other</option>
                    </select>
                  </label>
                </div>
                <div className="grid-2">
                  <label>Topic
                    <select name="topic" defaultValue="Support">
                      <option>Sales</option>
                      <option>Support</option>
                      <option>Billing</option>
                      <option>Privacy</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>Attachment<input name="attachment" type="file" /></label>
                </div>
                <label>Message<textarea name="message" rows="5" placeholder="How can we help?" required /></label>
                <label className="checkbox"><input type="checkbox" required /> I agree to the privacy policy</label>
                <button className="btn primary" type="submit">Send message</button>
              </form>
            ) : (
              <div className="contact-success">
                <div className="success-icon" aria-hidden="true">✅</div>
                <h3>Thanks! We’ll get back within 1 business day.</h3>
                <p className="muted">For urgent issues, call +1 (800) LEARN-ED.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}



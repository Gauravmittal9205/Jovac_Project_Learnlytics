import React, { useEffect } from 'react';
import styled from 'styled-components';

// This is a custom hook to handle the scroll-based reveal animation
const useRevealOnScroll = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target); // Stop observing once it's visible
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const StyledAboutPage = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1a202c;
  line-height: 1.6;
  background-color: #f7fafc;
`;

const SectionContainer = styled.section`
  padding: 4rem 1rem;
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  color: #2c5282;
  margin-bottom: 0.75rem;
`;

const SectionSubtext = styled.p`
  font-size: clamp(1rem, 2vw, 1.125rem);
  max-width: 700px;
  margin: 0 auto 3rem;
  color: #4a5568;
`;

// Hero Section
const HeroSection = styled.header`
  background-color: #2c5282;
  color: #fff;
  padding: 6rem 1rem;
  text-align: left;
`;

const HeroInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  max-width: 1100px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
  }
`;

const HeroCopy = styled.div`
  flex: 1;

  h1 {
    font-size: clamp(2.5rem, 6vw, 3rem);
    font-weight: 800;
    margin-bottom: 1rem;
  }

  p {
    font-size: clamp(1rem, 2vw, 1.25rem);
    margin-bottom: 2rem;
    opacity: 0.9;
  }
`;

const HeroArt = styled.div`
  flex: 1;
  text-align: center;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    transform-style: preserve-3d;
    transition: transform 0.3s ease-in-out;
  }
`;

const Button = styled.a`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  cursor: pointer;

  &.primary {
    background-color: #38a169;
    color: #fff;
    border: 2px solid #38a169;

    &:hover {
      background-color: #2f855a;
    }
  }

  &.ghost {
    background-color: transparent;
    color: #fff;
    border: 2px solid #fff;
    margin-left: 1rem;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

// Card Grid
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  text-align: left;
`;

const Card = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #2c5282;
  }
`;

// Why Grid
const WhyGrid = styled(CardGrid)`
  /* Inherits styles from CardGrid */
`;

const WhyItemContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  .why-icon {
    font-size: 2.5rem;
    line-height: 1;
  }

  .why-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #2c5282;
  }
`;

const Chip = styled.span`
  display: inline-block;
  background-color: #bee3f8;
  color: #2c5282;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-top: 0.5rem;
`;

// Gallery
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const GalleryItem = styled.figure`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease-in-out;
  }

  &:hover img {
    transform: scale(1.1) rotateX(2deg) rotateY(2deg);
  }

  figcaption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 0.75rem 1rem;
    font-weight: 500;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover figcaption {
    opacity: 1;
  }
`;

// Stats
const StatsSection = styled.section`
  background-color: #2c5282;
  color: #fff;
  padding: 4rem 1rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
`;

const Stat = styled.div`
  .stat-value {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    color: #48bb78;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: clamp(0.9rem, 2vw, 1.125rem);
    font-weight: 500;
    color: #e2e8f0;
  }
`;

// Meet the Team Section
const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const TeamMemberCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  text-align: center;
  
  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
    border: 3px solid #38a169;
  }

  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #2c5282;
  }

  p {
    font-size: 0.875rem;
    color: #4a5568;
  }
`;

// Testimonials Section
const TestimonialsSectionContainer = styled(SectionContainer)`
  background-color: #edf2f7;
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 3rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TestimonialCard = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
  border-left: 4px solid #38a169;

  .quote {
    font-style: italic;
    color: #4a5568;
    margin-bottom: 1rem;
  }

  .author {
    font-weight: 600;
    color: #2c5282;
  }

  .affiliation {
    font-size: 0.875rem;
    color: #718096;
  }
`;

// Split Section
const SplitSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: left;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 4rem;
  }

  div {
    flex: 1;
  }
`;

// CTA Block
const CTASection = styled(SectionContainer)`
  background-color: #2c5282;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    padding: 4rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const CTAContent = styled.div`
  text-align: left;
  h3 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: clamp(1rem, 2vw, 1.125rem);
    opacity: 0.9;
  }
`;

const CTAActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (min-width: 768px) {
    margin-top: 0;
    flex-direction: row;
  }

  .ghost-cta {
    background-color: transparent;
    color: #fff;
    border-color: #fff;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

// =========================================================================
// REACT COMPONENTS
// =========================================================================

function WhyItem({ icon, title, text, proof }) {
  return (
    <WhyItemContainer>
      <div className="why-icon" aria-hidden="true">{icon}</div>
      <div>
        <h3 className="why-title">{title}</h3>
        <p className="why-text">{text}</p>
        {proof && <Chip>{proof}</Chip>}
      </div>
    </WhyItemContainer>
  );
}

const teamMembers = [
  { name: 'Anushree Agrawal', title: 'Co-Founder & CEO', img: 'https://images.unsplash.com/photo-1720765551038-3571ca77dccd?q=80&w=1193&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Gaurav Mittal', title: 'Chief Product Officer', img: 'https://images.unsplash.com/photo-1638174267779-5fcd54afe356?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Harshit Bhardwaj', title: 'Lead Data Scientist', img: 'https://images.unsplash.com/photo-1659353221237-6a1cfb73fd90?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

const testimonials = [
  { quote: 'Learnlytics has transformed how my department approaches student support. We can now proactively intervene and make a real impact on student success.', author: 'Prof. Anjali Desai', affiliation: 'University of Technology' },
  { quote: 'The explainable AI is a game-changer. I finally have the confidence to act on the data and see the results.', author: 'Dr. Vikram Patel', affiliation: 'College of Arts and Sciences' },
  { quote: 'Implementation was a breeze, and the insights were immediate. A must-have for any institution serious about student outcomes.', author: 'Principal Neha Reddy', affiliation: 'Global High School' },
];

export default function About() {
  useRevealOnScroll();

  return (
    <StyledAboutPage>
      {/* Hero Section */}
      <HeroSection className="reveal">
        <HeroInner>
          <HeroCopy>
            <h1>About Learnlytics</h1>
            <p>Helping every learner succeed by giving instructors timely, explainable insights and simple actions that improve outcomes.</p>
            <div className="hero-cta">
              <Button href="#mission" className="primary">Our Mission</Button>
              <Button href="#contact" className="ghost">Contact</Button>
            </div>
          </HeroCopy>
          <HeroArt className="reveal" aria-hidden="true">
            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop" alt="Analytics dashboard illustration" />
          </HeroArt>
        </HeroInner>
      </HeroSection>

      {/* Mission Section */}
      <SectionContainer id="mission">
        <SectionTitle className="reveal">Our mission</SectionTitle>
        <SectionSubtext className="reveal">We focus on measurable student outcomes, not vanity dashboards. We aggregate LMS signals into a clear picture, surface explainable risk alerts, and close the loop with actions that show real impact.</SectionSubtext>
        <CardGrid className="reveal">
          <Card>
            <div className="card-icon" aria-hidden="true">📡</div>
            <h3 className="card-title">Aggregate</h3>
            <p className="card-text">Bring together engagement, assessments, and activity to see the full story.</p>
          </Card>
          <Card>
            <div className="card-icon" aria-hidden="true">🧭</div>
            <h3 className="card-title">Explain</h3>
            <p className="card-text">Every alert includes the “why” and confidence so instructors can trust it.</p>
          </Card>
          <Card>
            <div className="card-icon" aria-hidden="true">⚡</div>
            <h3 className="card-title">Act</h3>
            <p className="card-text">Nudges, targeted resources, and reports that prove what worked.</p>
          </Card>
        </CardGrid>
      </SectionContainer>

      {/* Why Instructors Choose Us Section */}
      <SectionContainer>
        <SectionTitle className="reveal">Why instructors choose us</SectionTitle>
        <SectionSubtext className="reveal">Co‑designed with educators. Fast setup. Explainable and privacy‑first.</SectionSubtext>
        <WhyGrid className="reveal">
          <WhyItem icon="🧩" title="Explainable AI" text="Clear reason behind every alert, with confidence levels." proof="Transparent" />
          <WhyItem icon="⚙️" title="Fast setup" text="From zero to insights in under 10 minutes." proof="Quick start" />
          <WhyItem icon="🛡️" title="Privacy‑first" text="Encryption, RBAC, and strict data minimization." proof="FERPA/GDPR" />
        </WhyGrid>
      </SectionContainer>
      
      

      {/* Product Gallery Section */}
      <SectionContainer>
        <SectionTitle className="reveal">Inside the product</SectionTitle>
        <SectionSubtext className="reveal">Hover images to explore — they gently zoom and tilt.</SectionSubtext>
        <GalleryGrid className="reveal">
          <GalleryItem><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Dashboard view" /><figcaption>Dashboard</figcaption></GalleryItem>
          <GalleryItem><img src="https://plus.unsplash.com/premium_photo-1733317302666-82fb00a68109?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Alerts view" /><figcaption>Alerts</figcaption></GalleryItem>
          <GalleryItem><img src="https://plus.unsplash.com/premium_photo-1738585039709-c6e96e07fc93?q=80&w=1267&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Recommendations view" /><figcaption>Recommendations</figcaption></GalleryItem>
          <GalleryItem><img src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop" alt="Reports view" /><figcaption>Reports</figcaption></GalleryItem>
        </GalleryGrid>
      </SectionContainer>
      
      {/* Meet the Team Section */}
      <SectionContainer id="team">
        <SectionTitle className="reveal">Meet the Team</SectionTitle>
        <SectionSubtext className="reveal">Our passionate team of educators, data scientists, and engineers.</SectionSubtext>
        <TeamGrid className="reveal">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index}>
              <img src={member.img} alt={member.name} />
              <h4>{member.name}</h4>
              <p>{member.title}</p>
            </TeamMemberCard>
          ))}
        </TeamGrid>
      </SectionContainer>

      {/* Testimonials Section */}
      <TestimonialsSectionContainer>
        <SectionTitle className="reveal">What Our Partners Say</SectionTitle>
        <TestimonialGrid className="reveal">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index}>
              <p className="quote">"{testimonial.quote}"</p>
              <p className="author">{testimonial.author}</p>
              <p className="affiliation">{testimonial.affiliation}</p>
            </TestimonialCard>
          ))}
        </TestimonialGrid>
      </TestimonialsSectionContainer>

      {/* Stats Section */}
      <StatsSection>
        <StatGrid className="reveal">
          <Stat><div className="stat-value">92%</div><div className="stat-label">Timely interventions</div></Stat>
          <Stat><div className="stat-value">200+</div><div className="stat-label">Institutions</div></Stat>
          <Stat><div className="stat-value">30%</div><div className="stat-label">Fewer unseen at‑risk</div></Stat>
          <Stat><div className="stat-value">10m</div><div className="stat-label">Setup minutes</div></Stat>
        </StatGrid>
      </StatsSection>

      {/* Privacy & Leadership Section */}
      <SplitSection className="reveal">
        <div>
          <h3>Privacy & security</h3>
          <p>Data minimization, encryption in transit and at rest, strict role‑based access, and annual audits.</p>
        </div>
        <div>
          <h3>Leadership</h3>
          <p>Education, data science, and product leaders with classroom and district experience.</p>
        </div>
      </SplitSection>

      {/* CTA Section */}
      <SectionContainer>
        <CTASection className="reveal">
          <CTAContent>
            <h3>See Learnlytics in action</h3>
            <p>Book a 15‑minute demo or try the sandbox to explore on your own.</p>
          </CTAContent>
          <CTAActions>
            <Button className="primary" href="#">Book demo</Button>
            <Button className="ghost ghost-cta" href="#">Try sandbox</Button>
          </CTAActions>
        </CTASection>
      </SectionContainer>
    </StyledAboutPage>
  );
}
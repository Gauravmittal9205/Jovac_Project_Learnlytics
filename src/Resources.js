import React from 'react';
import styled, { css, keyframes } from 'styled-components';

// Custom hook for scroll-based reveal animation
const useRevealOnScroll = () => {
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

// =========================================================================
// STYLED COMPONENTS
// =========================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledResourcesPage = styled.div`
  font-family: 'Inter', sans-serif;
  color: #1a202c;
  line-height: 1.6;
  background-color: #f7fafc;
`;

const SectionContainer = styled.section`
  padding: 4rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

// Updated UniqueHeader for full screen width, half screen height
const UniqueHeader = styled.header`
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  
  width: 100vw;
  height: 50vh; /* Set height to half of the viewport height */
  margin: 0; /* Remove top margin to start just below the nav */
  padding: 4vh 5vw; /* Use viewport units for padding to keep spacing consistent */
  
  /* Remove border-radius and box-shadow to fit the full-width design */
  border-radius: 0;
  box-shadow: none;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically and horizontally */
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between; /* Space out the text and image on large screens */
    text-align: left;
    padding: 6vh 8vw;
  }

  .header-content {
    flex: 1;
    max-width: 600px;
    @media (max-width: 767px) {
      text-align: center;
    }
  }
  
  h1 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    color: #2c5282;
    margin-bottom: 0.8rem;
  }

  p {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: #4a5568;
  }

  .header-image {
    flex: 1;
    text-align: right;

    @media (max-width: 767px) {
      display: none; /* Hide image on small screens to save space */
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease-in-out;
      object-fit: cover;
      max-height: 40vh; /* Prevents the image from being too large */

      &:hover {
        transform: translateY(-5px);
      }
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem auto;
  max-width: 800px;
`;

const TabPill = styled.button`
  background-color: #e2e8f0;
  color: #4a5568;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #cbd5e0;
  }

  ${(props) =>
    props.active &&
    css`
      background-color: #2c5282;
      color: #fff;
      &:hover {
        background-color: #2a4365;
      }
    `}
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const TileContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease-in-out;
    &:hover {
      transform: scale(1.05);
    }
  }

  .tile-meta {
    padding: 1.5rem;
    text-align: left;
  }

  .tile-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c5282;
  }

  .tile-sub {
    font-size: 0.875rem;
    color: #4a5568;
    margin-top: 0.25rem;
  }
`;

const FeatureCard = styled.div`
  background-color: #48bb78;
  color: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: left;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }

  img {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }

  .feature-content {
    flex: 1;
    h3 {
      font-size: clamp(1.5rem, 4vw, 2rem);
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: clamp(1rem, 2vw, 1.125rem);
      opacity: 0.9;
    }
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
  text-align: center;
  
  &.primary {
    background-color: #2c5282;
    color: #fff;
    border: 2px solid #2c5282;

    &:hover {
      background-color: #2a4365;
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

const CTASection = styled.section`
  padding: 4rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const CTACard = styled.div`
  background-color: #2c5282;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

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
  
  @media (min-width: 768px) {
    flex-direction: row;
    margin-top: 0;
  }
`;


// =========================================================================
// REACT COMPONENTS
// =========================================================================

function TabButton({ active, onClick, children }){
  return (
    <TabPill active={active} onClick={onClick}>
      {children}
    </TabPill>
  );
}

function Tile({ img, title, sub }){
  return (
    <TileContainer>
      <img src={img} alt={title} />
      <div className="tile-meta">
        <div className="tile-title">{title}</div>
        <div className="tile-sub">{sub}</div>
      </div>
    </TileContainer>
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
  { id: 'cs-cc', category: 'cases', title: 'Community college', sub: 'Boosting pass rates', img: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cs-k12', category: 'cases', title: 'K‑12 district', sub: 'Improving attendance', img: 'https://images.unsplash.com/photo-1523246191548-8b1421f6b7cf?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cs-uni', category: 'cases', title: 'University', sub: 'Reducing DFW rates', img: 'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?q=80&w=1200&auto=format&fit=crop' },
  { id: 'wb-tour', category: 'webinars', title: '15‑min product tour', sub: 'Guided overview', img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop' },
  { id: 'wb-explain', category: 'webinars', title: 'Designing explainable alerts', sub: 'What makes alerts trustworthy', img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1200&auto=format&fit=crop' },
  { id: 'wb-privacy', category: 'webinars', title: 'Privacy‑first analytics', sub: 'Safeguards that matter', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'hk-campus', category: 'hackathons', title: 'Campus hackathon', sub: '48‑hour student sprint', img: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'hk-edu', category: 'hackathons', title: 'EdTech weekend', sub: 'Instructor‑led challenges', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop' },
  { id: 'qz-ai', category: 'quizzes', title: 'AI literacy quiz', sub: '10‑minute check', img: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop' },
  { id: 'qz-ethics', category: 'quizzes', title: 'Ethics & privacy quiz', sub: 'Classroom scenarios', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cf-instructor', category: 'certifications', title: 'Certified Instructor', sub: 'Learnlytics Level 1', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop' },
  { id: 'cf-admin', category: 'certifications', title: 'Certified Admin', sub: 'Deploy & govern', img: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=1200&auto=format&fit=crop' },
];

export default function Resources(){
  const [active, setActive] = React.useState('all');
  useRevealOnScroll();

  const filtered = React.useMemo(() => {
    if (active === 'all') return ITEMS;
    return ITEMS.filter(i => i.category === active);
  }, [active]);

  const featuredItem = ITEMS.find(item => item.id === 'wb-tour');

  return (
    <StyledResourcesPage>
      {/* Unique Header for Resources Page */}
      <UniqueHeader className="reveal">
        <div className="header-content">
          <h1>Resources</h1>
          <p>A curated library of guides, videos, and case studies to help you maximize your impact.</p>
        </div>
        <div className="header-image" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" alt="People collaborating on resources"/>
        </div>
      </UniqueHeader>

      {/* Featured Resource Section */}
      <SectionContainer>
        <h2 className="section-title reveal">Featured Resource</h2>
        <p className="section-subtext reveal">Take a quick tour of the Learnlytics platform with a guided video overview.</p>
        {featuredItem && (
          <FeatureCard className="reveal">
            <img src={featuredItem.img} alt={featuredItem.title} />
            <div className="feature-content">
              <h3>{featuredItem.title}</h3>
              <p>{featuredItem.sub}</p>
              <Button href="#" className="ghost">Watch now</Button>
            </div>
          </FeatureCard>
        )}
      </SectionContainer>

      {/* Main Resources Section */}
      <SectionContainer>
        <div className="reveal">
          <TabsContainer>
            {SECTIONS.map(s => (
              <TabButton key={s.key} active={active === s.key} onClick={() => setActive(s.key)}>{s.label}</TabButton>
            ))}
          </TabsContainer>
        </div>
        
        <div className="resource-section reveal">
          <ResourceGrid>
            {filtered.map(item => (
              <Tile key={item.id} img={item.img} title={item.title} sub={item.sub} />
            ))}
          </ResourceGrid>
        </div>
      </SectionContainer>

      {/* CTA Section */}
      <CTASection>
        <CTACard className="reveal">
          <CTAContent>
            <h3>Explore our Starter Kit</h3>
            <p>Download the Instructor Starter Kit PDF or try the Sandbox course.</p>
          </CTAContent>
          </CTACard>
        </CTASection>
    </StyledResourcesPage>
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
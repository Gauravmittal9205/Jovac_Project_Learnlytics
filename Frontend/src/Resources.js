import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import axios from 'axios';
import { FaGithub, FaCode, FaQuestionCircle, FaGraduationCap, FaExternalLinkAlt } from 'react-icons/fa';

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
  
  .section-title {
    color: #000000;
    font-weight: 700;
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
    
    .section-title {
      font-size: 3rem;
    }
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
  padding: 1rem;
  .resource-section {
    margin: 2rem 0;
    min-height: 300px;
    padding: 1rem;
    
    .loading-state, .error-state, .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      text-align: center;
      min-height: 300px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 1rem 0;
      
      p {
        margin: 1rem 0;
        color: #4a5568;
        font-size: 1.1rem;
      }
      
      button {
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        background: #3182ce;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        
        &:hover {
          background: #2c5282;
        }
      }
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #3182ce;
      animation: spin 1s ease-in-out infinite;
      margin: 0 auto 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
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
    position: relative;
  }
  
  .tile-icon {
    margin-right: 8px;
    color: #4a5568;
  }  
  
  .tile-link {
    display: flex;
    align-items: center;
    color: #3182ce;
    font-size: 0.875rem;
    margin-top: 0.75rem;
    cursor: pointer;
    
    svg {
      margin-right: 6px;
      font-size: 0.8em;
    }
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .tile-placeholder {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f7fafc;
    color: #a0aec0;
    
    svg {
      font-size: 2.5rem;
    }
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
  background-color: #4299e1;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .feature-placeholder {
    background-color: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: white;
    
    svg {
      opacity: 0.8;
    }
  }
  color: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 2rem;

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
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
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

function Tile({ img, title, sub, type, url, onClick }){
  const getTypeIcon = () => {
    switch(type) {
      case 'github':
        return <FaGithub className="tile-icon" />;
      case 'quiz':
        return <FaQuestionCircle className="tile-icon" />;
      case 'course':
        return <FaGraduationCap className="tile-icon" />;
      case 'hackathon':
        return <FaCode className="tile-icon" />;
      default:
        return <FaExternalLinkAlt className="tile-icon" />;
    }
  };

  return (
    <TileContainer onClick={() => onClick && onClick(url)}>
      {img ? (
        <img src={img} alt={title} onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
        }} />
      ) : (
        <div className="tile-placeholder">
          {getTypeIcon()}
        </div>
      )}
      <div className="tile-meta">
        <div className="tile-title">
          {getTypeIcon()}
          {title}
        </div>
        <div className="tile-sub">{sub}</div>
        {url && (
          <div className="tile-link">
            <FaExternalLinkAlt /> View Resource
          </div>
        )}
      </div>
    </TileContainer>
  );
}

const SECTIONS = [
  { key: 'all', label: 'All' },
  { key: 'cases', label: 'Case Studies' },
  { key: 'hackathons', label: 'Hackathons' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'courses', label: 'Courses' },
];

// API endpoints
const API_ENDPOINTS = {
  CASE_STUDIES: 'https://api.github.com/orgs/opencasestudies/repos',
  HACKATHONS: 'https://www.hackerearth.com/chrome-extension/events/',
  QUIZZES: 'https://opentdb.com/api.php?amount=10&type=multiple',
  COURSES: 'https://api.coursera.org/api/courses.v1'
};

export default function Resources(){
  const [active, setActive] = useState('all');
  const [resources, setResources] = useState({
    cases: [],
    hackathons: [],
    quizzes: [],
    courses: [],
    loading: true,
    error: null
  });
  useRevealOnScroll();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResources(prev => ({ ...prev, loading: true, error: null }));
        
        // Use Promise.all to fetch in parallel
        const [caseStudiesRes, quizzesRes] = await Promise.allSettled([
          axios.get(API_ENDPOINTS.CASE_STUDIES, {
            timeout: 5000, // 5 second timeout
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            }
          }),
          axios.get(API_ENDPOINTS.QUIZZES, { timeout: 5000 })
        ]);

        // Common fallback images for different resource types
        const FALLBACK_IMAGES = {
          cases: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000', // Data analysis
            'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1000', // ML/AI
            'https://images.unsplash.com/photo-1581092921461-39b2f2f8a4c6?q=80&w=1000', // Data visualization
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000', // Statistics
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000', // Coding
            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000', // Web development
            'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1000', // Programming
            'https://images.unsplash.com/photo-1517694712201-5dd0d6c4c3ad?q=80&w=1000', // Mobile development
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000', // Electronics
            'https://images.unsplash.com/photo-1551434678-3d3f7c9d9a5b?q=80&w=1000'  // Code review
          ],
          hackathons: [
            'https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=1000',
            'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=1000',
            'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1000',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000'
          ],
          quizzes: [
            'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000',
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0a?q=80&w=1000'
          ],
          courses: [
            'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000',
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0a?q=80&w=1000'
          ]
        };
        
        // Function to get a fallback image based on category and index
        const getFallbackImage = (category, index) => {
          const images = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.cases;
          return images[index % images.length];
        };
        
        // Process case studies
        let caseStudies = [];
        if (caseStudiesRes.status === 'fulfilled') {
          // Get shuffled images for case studies
          const shuffledImages = [...FALLBACK_IMAGES.cases].sort(() => 0.5 - Math.random());

          // Get first 10 case studies with unique images
          const uniqueRepos = Array.from(new Set(caseStudiesRes.value.data.map(r => r.id)))
            .map(id => caseStudiesRes.value.data.find(r => r.id === id))
            .filter(Boolean) // Remove any undefined entries
            .slice(0, 10); // Get up to 10 unique repos

          caseStudies = uniqueRepos.map((repo, index) => {
            // Use modulo to cycle through images if we have more repos than images
            const imageIndex = index % shuffledImages.length;
            const imageUrl = shuffledImages[imageIndex];

            return {
              id: `case-${repo.id}`,
              title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              sub: repo.description || 'Open source case study',
              img: imageUrl,
              url: repo.html_url,
              type: 'github',
              category: 'cases',
              updated: new Date(repo.updated_at).toLocaleDateString()
            };
          });
        } else {
          console.warn('Failed to fetch case studies:', caseStudiesRes.reason?.message || 'Unknown error');
          // Add fallback case studies with unique images if API fails
          caseStudies = [
            {
              id: 'case-1',
              title: 'Data Analysis Case Study',
              sub: 'Comprehensive data analysis workflow',
              img: getFallbackImage('cases', 0),
              url: 'https://github.com/opencasestudies',
              type: 'github',
              category: 'cases',
              updated: new Date().toLocaleDateString()
            },
            {
              id: 'case-2',
              title: 'Machine Learning Project',
              sub: 'End-to-end ML pipeline implementation',
              img: getFallbackImage('cases', 1),
              url: 'https://github.com/opencasestudies',
              type: 'github',
              category: 'cases',
              updated: new Date().toLocaleDateString()
            },
            {
              id: 'case-3',
              title: 'Web Development',
              sub: 'Modern web application development',
              img: getFallbackImage('cases', 2),
              url: 'https://github.com/opencasestudies',
              type: 'github',
              category: 'cases',
              updated: new Date().toLocaleDateString()
            },
            {
              id: 'case-4',
              title: 'Mobile App Development',
              sub: 'Cross-platform mobile applications',
              img: getFallbackImage('cases', 3),
              url: 'https://github.com/opencasestudies',
              type: 'github',
              category: 'cases',
              updated: new Date().toLocaleDateString()
            },
            {
              id: 'case-5',
              title: 'Data Visualization',
              sub: 'Interactive data dashboards',
              img: getFallbackImage('cases', 4),
              url: 'https://github.com/opencasestudies',
              type: 'github',
              category: 'cases',
              updated: new Date().toLocaleDateString()
            }
          ];
        }

        // Process quizzes
        let quizzes = [];
        if (quizzesRes.status === 'fulfilled') {
          quizzes = quizzesRes.value.data.results.slice(0, 4).map((quiz, index) => ({
            id: `quiz-${index}`,
            title: `Quiz: ${quiz.category}`,
            sub: quiz.question.replace(/&[a-z]+;/g, '').substring(0, 100) + '...',
            img: getFallbackImage('quizzes', index),
            type: 'quiz',
            category: 'quizzes',
            difficulty: quiz.difficulty,
            answers: [quiz.correct_answer, ...quiz.incorrect_answers],
            correctAnswer: quiz.correct_answer
          }));
        } else {
          console.warn('Failed to fetch quizzes:', quizzesRes.reason?.message || 'Unknown error');
        }

        // Add default hackathons with fallback images
        const hackathons = [
          {
            id: 'hack-1',
            title: 'Upcoming Hackathons',
            sub: 'Participate in coding challenges and win prizes',
            url: 'https://www.hackerearth.com/challenges/',
            type: 'hackathon',
            category: 'hackathons',
            img: getFallbackImage('hackathons', 0)
          },
          {
            id: 'hack-2',
            title: 'Global AI Hackathon',
            sub: 'Build AI solutions for real-world problems',
            url: 'https://www.hackerearth.com/challenges/competitive/hackathons/',
            type: 'hackathon',
            category: 'hackathons',
            img: getFallbackImage('hackathons', 1)
          }
        ];

        // Add default courses with fallback images
        const courses = [
          {
            id: 'course-1',
            title: 'Data Science Specialization',
            sub: 'Master data science with hands-on projects',
            url: 'https://www.coursera.org/specializations/jhu-data-science',
            type: 'course',
            category: 'courses',
            img: getFallbackImage('courses', 0)
          },
          {
            id: 'course-2',
            title: 'Web Development Bootcamp',
            sub: 'Learn full-stack web development',
            url: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
            type: 'course',
            category: 'courses',
            img: getFallbackImage('courses', 1)
          }
        ];

        setResources({
          cases: caseStudies,
          hackathons,
          quizzes,
          courses,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load resources. Please try again later.'
        }));
      }
    };

    fetchResources();
  }, []);

  const allItems = [
    ...resources.cases,
    ...resources.hackathons,
    ...resources.quizzes,
    ...resources.courses
  ];

  const filteredItems = React.useMemo(() => {
    if (active === 'all') return allItems;
    return allItems.filter(item => item.category === active);
  }, [active, allItems]);

  const featuredItem = allItems[0];

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
      
      {/* Main Resources Section */}
      <SectionContainer>
        <h2 className="section-title reveal">Featured Resource</h2>
        <div className="reveal">
          <TabsContainer>
            {SECTIONS.map(s => (
              <TabButton key={s.key} active={active === s.key} onClick={() => setActive(s.key)}>{s.label}</TabButton>
            ))}
          </TabsContainer>
        </div>
        
        <div className="resource-section reveal">
          {resources.loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading resources...</p>
            </div>
          ) : resources.error ? (
            <div className="error-state">
              <p>{resources.error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredItems.length > 0 ? (
            <ResourceGrid>
              {filteredItems.map(item => (
                <Tile 
                  key={item.id} 
                  img={item.img} 
                  title={item.title} 
                  sub={item.sub}
                  type={item.type}
                  url={item.url}
                  onClick={(url) => url && window.open(url, '_blank')}
                />
              ))}
            </ResourceGrid>
          ) : (
            <div className="no-results">
              <p>No resources found in this category.</p>
            </div>
          )}
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
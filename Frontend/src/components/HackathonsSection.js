import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const HackathonsContainer = styled.section`
  padding: 4rem 0;
  background-color: #f8f9fa;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748;
  font-size: 2rem;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const EventImage = styled.div`
  height: 160px;
  background: #e2e8f0;
  background-size: cover;
  background-position: center;
`;

const EventContent = styled.div`
  padding: 1.5rem;
`;

const EventTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2d3748;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  
  span {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    
    svg {
      margin-right: 0.25rem;
    }
  }
`;

const EventDescription = styled.p`
  color: #4a5568;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EventLink = styled.a`
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-left: 0.5rem;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e53e3e;
  background: #fff5f5;
  border-radius: 8px;
`;

const HackathonsSection = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hackathons');
        
        if (!response.ok) {
          throw new Error('Failed to fetch hackathons');
        }
        
        const data = await response.json();
        // The data is already in the correct format from our backend
        const events = data.data || [];
        setHackathons(events);
      } catch (err) {
        console.error('Error fetching hackathons:', err);
        setError('Failed to load upcoming events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // Return as is if date parsing fails
    }
  };

  const loadMoreHackathons = async () => {
    try {
      setIsLoadingMore(true);
      // In a real implementation, you would fetch the next page from the API
      // For now, we'll just increase the visible count
      setVisibleCount(prev => prev + 6);
    } catch (err) {
      console.error('Error loading more hackathons:', err);
      setError('Failed to load more events. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <HackathonsContainer id="events">
      <Container>
        <SectionTitle>Upcoming Hackathons & Webinars</SectionTitle>
        
        {loading ? (
          <Loading>Loading events...</Loading>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <>
            <EventsGrid>
              {hackathons.slice(0, visibleCount).map((event) => (
              <EventCard key={event.id}>
                <EventImage 
                  style={event.thumbnail_url ? { backgroundImage: `url(${event.thumbnail_url})` } : {}}
                />
                <EventContent>
                  <EventTitle>{event.title}</EventTitle>
                  <EventMeta>
                    <span>📅 {formatDate(event.submission_period_dates)}</span>
                    <span>📍 {event.location || 'Online'}</span>
                  </EventMeta>
                  <EventDescription>
                    {event.description ? 
                      (typeof event.description === 'string' ? 
                        event.description.replace(/<[^>]*>/g, '').substring(0, 150) : 
                        'No description available') + '...' : 
                      'No description available'
                    }
                  </EventDescription>
                  <EventLink href={event.url} target="_blank" rel="noopener noreferrer">
                    Learn More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </EventLink>
                </EventContent>
              </EventCard>
              ))}
            </EventsGrid>
            {visibleCount < hackathons.length && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  onClick={loadMoreHackathons}
                  disabled={isLoadingMore}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    opacity: isLoadingMore ? 0.7 : 1,
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                >
                  {isLoadingMore ? 'Loading...' : 'Show More'}
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </HackathonsContainer>
  );
};

export default HackathonsSection;

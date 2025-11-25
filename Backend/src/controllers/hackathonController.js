const axios = require('axios');

const getHackathons = async (req, res) => {
  try {
    // Using a more reliable proxy service
    const response = await axios.get('https://devpost.com/api/hackathons?status[]=upcoming&order_by=recently-added&challenge_type[]=all', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Learnlytics/1.0 (contact@learnlytics.app)'
      }
    });
    
    // Return the hackathons data
    res.json({
      success: true,
      data: response.data.hackathons || []
    });
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    // Fallback data in case the API fails
    const fallbackData = [
      {
        id: 'fallback-1',
        title: 'Global AI Hackathon',
        url: 'https://devpost.com/hackathons',
        thumbnail_url: 'https://hackernoon.com/hn-images/1*XOSAOhTwm0hO3YKEaXQl9Q.jpeg',
        submission_period_dates: '2025-12-15T00:00:00.000Z',
        location: 'Online',
        description: 'Join developers worldwide to build innovative AI solutions.'
      },
      {
        id: 'fallback-2',
        title: 'Education Technology Challenge',
        url: 'https://devpost.com/hackathons',
        thumbnail_url: 'https://cdn.dribbble.com/users/1355613/screenshots/14809897/media/7f02a2d6c32a2c5f5e3e3d9f9a9c9b9a.png',
        submission_period_dates: '2025-12-20T00:00:00.000Z',
        location: 'Online',
        description: 'Build the future of education technology with like-minded innovators.'
      },
      {
        id: 'fallback-3',
        title: 'Coding for Good',
        url: 'https://devpost.com/hackathons',
        thumbnail_url: 'https://miro.medium.com/max/1400/1*XOSAOhTwm0hO3YKEaXQl9Q.jpeg',
        submission_period_dates: '2025-12-25T00:00:00.000Z',
        location: 'Online',
        description: 'Use your coding skills to make a positive impact on society.'
      }
    ];
    
    res.status(200).json({
      success: true,
      data: fallbackData,
      message: 'Using fallback data as the API is currently unavailable.'
    });
  }
};

module.exports = {
  getHackathons
};

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { FaUserEdit, FaSave, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  text-align: center;
`;

const ProfileImage = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 5px solid #f8f9fa;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #4e73df;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2e59d9;
  }
  
  input {
    display: none;
  }
`;

const ProfileName = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin: 0.5rem 0;
`;

const ProfileRole = styled.span`
  color: #718096;
  font-size: 1.1rem;
`;

const EditButton = styled.button`
  background: #4e73df;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2e59d9;
    transform: translateY(-2px);
  }
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSection = styled.div`
  background: #f8f9fc;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4a5568;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #4e73df;
      box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.15);
    }
    
    &:disabled {
      background-color: #f7fafc;
      cursor: not-allowed;
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const SaveButton = styled(EditButton)`
  background: #10b981;
  
  &:hover {
    background: #0d9f6e;
  }
`;

function Profile(){
  console.log('Profile component rendering');
  const { user } = useAuth();
  console.log('AuthContext user in Profile:', user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    console.log('Profile component mounted');
    return () => console.log('Profile component unmounted');
  }, []);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: 'student',
    profile: {
      personal: {
        fullName: '',
        dateOfBirth: '',
        gender: '',
        AdhaarNumber: '',
        Category: ''
      },
      contact: {
        phone: '',
        address: '',
        emergencyContact: ''
      },
      academic: {
        program: '',
        major: '',
        minor: '',
        year: '',
        semester: '',
        expectedGraduation: '',
        gpa: ''
      }
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log('useEffect in Profile component running');
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Try multiple sources for token to be robust across app contexts
        const sessionRaw = localStorage.getItem('learnlytics_session');
        const session = sessionRaw ? JSON.parse(sessionRaw) : null;
        const token = (user && (user.token || user?.data?.token)) || session?.token || localStorage.getItem('token');
        console.log('Resolved auth token for Profile:', token ? 'exists' : 'missing');
        if (!token) {
          console.log('No auth token found for Profile.');
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }

        console.log('Fetching profile data...');
        const response = await axios.get('http://localhost:5000/api/profile/me', {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        console.log('Profile data received:', response.data);

        setProfileData(prev => ({
          ...prev,
          ...response.data,
          profile: {
            ...prev.profile,
            ...response.data.profile
          }
        }));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
        setIsLoading(false);
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e, section, field) => {
    const { name, value } = e.target;
    
    if (section) {
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [section]: {
            ...prev.profile[section],
            [field || name]: value
          }
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('picture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/profile/picture',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update the profile picture in the UI
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          picture: response.data.picture
        }
      }));

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show loading state
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Updating profile with data:', profileData);

      const response = await axios.put(
        'http://localhost:5001/api/profile',
        profileData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Profile update response:', response.data);

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);

      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data.message || 'Failed to update profile';
        toast.error(`Update failed: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    console.log('Profile component is loading...');
    return <div>Loading profile data...</div>;
  }

  return (
    <ProfileContainer>
      <form onSubmit={handleSubmit}>
        <ProfileHeader>
          <ProfileImage>
            <img 
              src={
                profileData.profile?.picture || 
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileData.name) + '&background=4e73df&color=fff&size=150'
              } 
              alt="Profile" 
            />
            {isEditing && (
              <UploadButton>
                <FaCamera />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </UploadButton>
            )}
          </ProfileImage>
          
          {isEditing ? (
            <FormGroup>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={(e) => handleInputChange(e)}
                placeholder="Full Name"
                required
              />
            </FormGroup>
          ) : (
            <>
              <ProfileName>{profileData.name}</ProfileName>
              <ProfileRole>{profileData.role}</ProfileRole>
            </>
          )}
          
          {isEditing ? (
            <SaveButton type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </SaveButton>
          ) : (
            <EditButton type="button" onClick={() => setIsEditing(true)}>
              <FaUserEdit /> Edit Profile
            </EditButton>
          )}
        </ProfileHeader>

        <ProfileContent>
          <div>
            <ProfileSection>
              <SectionTitle>
                <FaUserEdit /> Personal Information
              </SectionTitle>
              
              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.profile.personal?.fullName || ''}
                  onChange={(e) => handleInputChange(e, 'personal', 'fullName')}
                  disabled={!isEditing}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileData.profile.personal?.dateOfBirth || ''}
                  onChange={(e) => handleInputChange(e, 'personal', 'dateOfBirth')}
                  disabled={!isEditing}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Gender</label>
                <select
                  name="gender"
                  value={profileData.profile.personal?.gender || ''}
                  onChange={(e) => handleInputChange(e, 'personal', 'gender')}
                  disabled={!isEditing}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  name="AdhaarNumber"
                  value={profileData.profile.personal?.AdhaarNumber || ''}
                  onChange={(e) => handleInputChange(e, 'personal', 'AdhaarNumber')}
                  disabled={!isEditing}
                  pattern="[0-9]{12}"
                  title="Aadhaar number must be 12 digits"
                />
              </FormGroup>
              
              <FormGroup>
                <label>Category</label>
                <select
                  name="Category"
                  value={profileData.profile.personal?.Category || ''}
                  onChange={(e) => handleInputChange(e, 'personal', 'Category')}
                  disabled={!isEditing}
                >
                  <option value="">Select Category</option>
                  <option value="general">General</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="other">Other</option>
                </select>
              </FormGroup>
            </ProfileSection>
            
            <ProfileSection>
              <SectionTitle>
                <FaEnvelope /> Contact Information
              </SectionTitle>
              
              <FormGroup>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange(e)}
                  disabled={!isEditing}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.profile.contact?.phone || ''}
                  onChange={(e) => handleInputChange(e, 'contact', 'phone')}
                  disabled={!isEditing}
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
              </FormGroup>
              
              <FormGroup>
                <label>Address</label>
                <textarea
                  name="address"
                  value={profileData.profile.contact?.address || ''}
                  onChange={(e) => handleInputChange(e, 'contact', 'address')}
                  disabled={!isEditing}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={profileData.profile.contact?.emergencyContact || ''}
                  onChange={(e) => handleInputChange(e, 'contact', 'emergencyContact')}
                  disabled={!isEditing}
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
              </FormGroup>
            </ProfileSection>
          </div>
          
          <div>
            <ProfileSection>
              <SectionTitle>
                <FaGraduationCap /> Academic Information
              </SectionTitle>
              
              <FormGroup>
                <label>Program</label>
                <input
                  type="text"
                  name="program"
                  value={profileData.profile.academic?.program || ''}
                  onChange={(e) => handleInputChange(e, 'academic', 'program')}
                  disabled={!isEditing}
                />
              </FormGroup>
              
              <TwoColumnGrid>
                <FormGroup>
                  <label>Major</label>
                  <input
                    type="text"
                    name="major"
                    value={profileData.profile.academic?.major || ''}
                    onChange={(e) => handleInputChange(e, 'academic', 'major')}
                    disabled={!isEditing}
                  />
                </FormGroup>
                
                <FormGroup>
                  <label>Minor</label>
                  <input
                    type="text"
                    name="minor"
                    value={profileData.profile.academic?.minor || ''}
                    onChange={(e) => handleInputChange(e, 'academic', 'minor')}
                    disabled={!isEditing}
                  />
                </FormGroup>
              </TwoColumnGrid>
              
              <TwoColumnGrid>
                <FormGroup>
                  <label>Year</label>
                  <select
                    name="year"
                    value={profileData.profile.academic?.year || ''}
                    onChange={(e) => handleInputChange(e, 'academic', 'year')}
                    disabled={!isEditing}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <label>Semester</label>
                  <select
                    name="semester"
                    value={profileData.profile.academic?.semester || ''}
                    onChange={(e) => handleInputChange(e, 'academic', 'semester')}
                    disabled={!isEditing}
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </FormGroup>
              </TwoColumnGrid>
              
              <TwoColumnGrid>
                <FormGroup>
                  <label>Expected Graduation</label>
                  <input
                    type="month"
                    name="expectedGraduation"
                    value={profileData.profile.academic?.expectedGraduation || ''}
                    onChange={(e) => handleInputChange(e, 'academic', 'expectedGraduation')}
                    disabled={!isEditing}
                  />
                </FormGroup>
                
                <FormGroup>
                  <label>GPA</label>
                  <input
                    type="number"
                    name="gpa"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profileData.profile.academic?.gpa || ''}
                    onChange={(e) => handleInputChange(e, 'academic', 'gpa')}
                    disabled={!isEditing}
                  />
                </FormGroup>
              </TwoColumnGrid>
            </ProfileSection>
          </div>
        </ProfileContent>
      </form>
    </ProfileContainer>
  );
};

export default Profile;
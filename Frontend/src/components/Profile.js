import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile({ userId }) {
  const [profile, setProfile] = useState({ name: "", age: "", bio: "" });

  // Get token from localStorage (or wherever you stored it)
  const token = localStorage.getItem("token"); // <--- yaha define karna hai

  useEffect(() => {
    axios.get(`http://localhost:5000/api/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}` // <--- yaha use karna hai
      }
    })
      .then(res => setProfile(res.data))
      .catch(err => console.error(err));
  }, [userId, token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("userId:", userId);
    console.log("profile data:", profile);

    axios.put(`http://localhost:5000/api/profile/${userId}`, profile)
      .then(res => alert("Profile updated successfully!"))
      .catch(err => console.error(err));
};

  return (
    <div>
      <h2>Edit Profile</h2>
      <input
        name="name"
        value={profile.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="age"
        value={profile.age}
        onChange={handleChange}
        placeholder="Age"
      />
      <input
        name="bio"
        value={profile.bio}
        onChange={handleChange}
        placeholder="Bio"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default Profile;

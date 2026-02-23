import axios from "axios";

const API = "http://localhost:5000/api/auth";

// Register User
export const registerUser = async (userData) => {
  return await axios.post(`${API}/register`, userData);
};

// Login User
export const loginUser = async (userData) => {
  return await axios.post(`${API}/login`, userData);
};

// Get Profile
export const getProfile = async (token) => {
  return await axios.get(`${API}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
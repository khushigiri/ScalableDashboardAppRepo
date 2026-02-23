// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api", // change if your backend port is different
// });

// // Attach token automatically to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   // Do NOT attach token for auth routes
//   if (
//     token &&
//     !config.url.includes("/auth/login") &&
//     !config.url.includes("/auth/register")
//   ) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
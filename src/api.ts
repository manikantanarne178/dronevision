import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://dronbackend.onrender.com";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle cold start / network connectivity issues gracefully
    if (error.code === "ECONNABORTED" || !error.response) {
      console.warn(
        "Render backend connection timeout or cold-start waking up:",
        error.message
      );
    } else if (error.response?.status === 401) {
      // If unauthorized and not on login page, clear token
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        console.warn("Session expired or unauthenticated.");
      }
    }
    return Promise.reject(error);
  }
);

export default API;
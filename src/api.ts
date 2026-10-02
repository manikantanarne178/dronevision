import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://dronbackend.onrender.com";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s default for standard JSON requests
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
    if (error.code === "ECONNABORTED" || !error.response) {
      console.warn(
        "Render backend connection timeout or cold-start waking up:",
        error.message
      );
    } else if (error.response?.status === 401) {
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

/**
 * Ping backend health endpoint to check wakefulness and avoid cold-start upload timeouts
 */
export async function pingBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 15000,
    });
    return res.status === 200;
  } catch (err) {
    console.warn("Backend health ping failed or waking up:", err);
    return false;
  }
}

export default API;
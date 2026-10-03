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
      const isAuthPage =
        window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/register");
      if (!isAuthPage) {
        console.warn("Session expired or unauthorized. Please log in.");
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Returns the active authentication token from localStorage if present.
 */
export async function ensureAuthToken(): Promise<string | null> {
  return localStorage.getItem("token");
}

/**
 * Ping backend health endpoint with automatic retry to warm up Render cold starts
 */
export async function pingBackendHealth(
  onAttempt?: (attempt: number, maxAttempts: number) => void
): Promise<boolean> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      onAttempt?.(attempt, maxAttempts);
      const res = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 12000,
      });
      if (res.status === 200) {
        return true;
      }
    } catch (err) {
      console.warn(`Health check attempt ${attempt}/${maxAttempts} failed:`, err);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
}

export default API;
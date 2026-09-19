import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // send httpOnly auth cookie
});

// Attach bearer token as a fallback if stored (cookie auth is primary)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("homelyhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export const registerUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong. Please try again.";

    if (status === 401) {
      localStorage.removeItem("homelyhub_token");
      if (onUnauthorized) onUnauthorized();
    } else if (status === 403) {
      toast.error(message || "You don't have permission to do that.");
    } else if (status === 404) {
      // Let calling code decide how to present "not found" in context.
    } else if (status === 409) {
      toast.error(message);
    } else if (status >= 500) {
      toast.error("Server error. Please try again shortly.");
    }

    return Promise.reject(error);
  }
);

export default api;

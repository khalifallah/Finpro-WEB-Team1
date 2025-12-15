import { BASE_API_URL } from "@/config/app.config";
import axios from "axios";

// Create axios instance with better defaults
const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 60000,
  timeoutErrorMessage: "Request timeout. Backend might be starting up...",
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
          config.url
        }`
      );
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry on timeout or network errors
    if (
      (error.code === "ECONNABORTED" ||
        error.message.includes("timeout") ||
        !error.response) &&
      !config._retry
    ) {
      config._retry = true;

      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`Retrying request to ${config.url}`);
      return axiosInstance(config);
    }

    // Don't log empty errors
    if (error && (error.message || error.response)) {
      console.error("API Error Details:", {
        hasError: !!error,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        configUrl: error?.config?.url,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data,
      });
    }

    // Handle specific errors
    if (error?.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timeout. Please check your connection.")
      );
    }

    if (!error?.response) {
      if (error?.message?.includes("Network Error")) {
        return Promise.reject(
          new Error("Network error. Please check your connection.")
        );
      }
      return Promise.reject(error);
    }

    // Don't redirect on 401 for checkout/cart endpoints to prevent loops
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.warn("Unauthorized access, but not redirecting to prevent loops");
      // Return a specific error that can be handled by components
      return Promise.reject(new Error("session_expired"));
    }

    // Extract error message
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An error occurred";

    return Promise.reject(new Error(errorMessage));
  }
);

export { axiosInstance };

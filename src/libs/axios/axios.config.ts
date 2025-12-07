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
  timeout: 30000, // 30 second timeout
  timeoutErrorMessage: "Request timeout. Please check your connection.",
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
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Safely log error details
    console.error("API Error Details:", {
      hasError: !!error,
      errorType: error?.constructor?.name,
      errorMessage: error?.message,
      hasConfig: !!error?.config,
      configUrl: error?.config?.url,
      configMethod: error?.config?.method,
      hasResponse: !!error?.response,
      responseStatus: error?.response?.status,
      responseData: error?.response?.data,
      code: error?.code,
      isNetworkError: error?.isAxiosError && !error?.response,
      isTimeout: error?.code === "ECONNABORTED",
    });

    // Handle specific errors
    if (error?.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timeout. Please check your connection.")
      );
    }

    if (!error?.response) {
      // Check if it's a CORS or network error
      if (error?.message?.includes("Network Error") || error?.isAxiosError) {
        return Promise.reject(
          new Error(
            "Network error. Please check if backend server is running and CORS is configured properly."
          )
        );
      }

      return Promise.reject(
        new Error(
          error?.message || "Network error. Please check your connection."
        )
      );
    }

    // For 401 errors (unauthorized), clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Extract error message from response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.message ||
      "An error occurred";

    return Promise.reject(new Error(errorMessage));
  }
);

export { axiosInstance };

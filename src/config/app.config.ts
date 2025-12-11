const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8000/api";

// Add these for debugging
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export {
  BASE_API_URL,
  IS_DEVELOPMENT,
  FRONTEND_URL,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
};

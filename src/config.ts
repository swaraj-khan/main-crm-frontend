// Centralized configuration
export const API_URL = import.meta.env.VITE_API_URL || "https://main-crm-backend.onrender.com/api";
export const APP_VERSION = "2";
console.log(`App Version: ${APP_VERSION} | API URL: ${API_URL}`);
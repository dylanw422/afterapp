// Environment variable configuration
export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  // Add other environment variables as needed
  API_URL: process.env.API_URL || "/api",

  // Helper functions
  isDev: () => env.NODE_ENV === "development",
  isProd: () => env.NODE_ENV === "production",
  isTest: () => env.NODE_ENV === "test",
};

/**
 * Application configuration
 * Centralized configuration for environment variables and app settings
 */

export const config = {
  app: {
    name: 'Education Platform API',
    version: '0.1.0',
    env: process.env.NODE_ENV || 'development',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
} as const;

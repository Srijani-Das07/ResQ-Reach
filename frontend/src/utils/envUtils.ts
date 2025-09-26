// Utility functions for safely accessing environment variables in browser/server environments

/**
 * Safely get environment variables that work in both browser and server environments
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Browser environment - check multiple sources
      // 1. Window ENV object (for runtime configuration)
      if ((window as any).ENV && (window as any).ENV[key]) {
        return (window as any).ENV[key];
      }
      
      // 2. Process.env (if available and not undefined)
      if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
        return process.env[key] || defaultValue;
      }
      
      return defaultValue;
    }
    
    // Server environment - use process.env directly
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    // Fallback if any error occurs
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Check if we're in a development environment
 */
export const isDevelopment = (): boolean => {
  return getEnvVar('NODE_ENV', 'development') === 'development';
};

/**
 * Check if we're in a production environment
 */
export const isProduction = (): boolean => {
  return getEnvVar('NODE_ENV', 'development') === 'production';
};

/**
 * Get the current environment name
 */
export const getEnvironment = (): string => {
  return getEnvVar('NODE_ENV', 'development');
};

/**
 * Check if a URL is a placeholder/default value
 */
export const isPlaceholderUrl = (url: string): boolean => {
  const placeholders = [
    'http://localhost:3001',
    'https://your-production-url.com',
    'localhost',
    'example.com',
    ''
  ];
  return placeholders.some(placeholder => url.includes(placeholder)) || !url;
};

/**
 * Validate if an environment variable is properly configured
 */
export const isEnvVarConfigured = (key: string): boolean => {
  const value = getEnvVar(key);
  return value !== '' && !isPlaceholderUrl(value);
};
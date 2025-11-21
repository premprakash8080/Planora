import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection
 * Centralized endpoint definitions matching backend API structure
 */
export const ENDPOINTS = {
  // Authentication endpoints
  login: `${environment.apiBaseUrl}/api/users/login`,
  register: `${environment.apiBaseUrl}/api/users/register`,
  profile: `${environment.apiBaseUrl}/api/users/profile`,
  updateProfile: `${environment.apiBaseUrl}/api/users/profile`,
  
  // Legacy endpoints (for backward compatibility if needed)
  forgot_password: `${environment.apiBaseUrl}/api/users/forgot/password`,
  verify_token: `${environment.apiBaseUrl}/api/users/validate/token`,
  reset_password: `${environment.apiBaseUrl}/api/users/reset/password`,
};

import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection
 * Centralized endpoint definitions matching backend API structure
 */
export const ENDPOINTS = {
  // Authentication endpoints
  getProfile: `${environment.apiBaseUrl}/api/users/profile`,
  verifyToken: `${environment.apiBaseUrl}/api/users/validate/token`,
  updateProfile: `${environment.apiBaseUrl}/api/users/update`,
 
};

/**
 * US state formatting utilities for consistent display
 */

import { US_STATES } from '../constants/usStates';

/**
 * Normalizes state value to full name
 * Handles both state codes (e.g., "CA") and full names (e.g., "California")
 */
export function normalizeStateName(state: string): string {
  if (!state) return '';
  
  // Check if it's already a full name
  const existingState = US_STATES.find(s => s.name === state);
  if (existingState) {
    return state;
  }
  
  // Try to find by code
  const stateByCode = US_STATES.find(s => s.code === state.toUpperCase());
  if (stateByCode) {
    return stateByCode.name;
  }
  
  // Return as-is if not found
  return state;
}

/**
 * Gets state code from full name
 */
export function getStateCode(stateName: string): string {
  const state = US_STATES.find(s => s.name === stateName);
  return state ? state.code : stateName;
}

/**
 * Runtime configuration helper that reads environment values safely,
 * validates backend canister ID format, and provides diagnostics data for UI rendering.
 * Supports both build-time env injection (IC deployment) and runtime config file (static hosting).
 */

import { Principal } from '@dfinity/principal';

export interface RuntimeConfigDiagnostics {
  backendCanisterId: string | null;
  isBackendCanisterIdMissing: boolean;
  isBackendCanisterIdInvalid: boolean;
  validationError: string | null;
  isAuthenticated: boolean;
  environment: 'development' | 'production';
  source: 'build-time' | 'runtime-file' | 'none';
  runtimeConfigAttempted: boolean;
  runtimeConfigLoaded: boolean;
}

export interface RuntimeConfigValidation {
  isValid: boolean;
  canisterId: string | null;
  error: 'missing' | 'invalid' | null;
  errorMessage: string | null;
  source: 'build-time' | 'runtime-file' | 'none';
}

interface RuntimeConfigFile {
  backendCanisterId?: string;
}

let runtimeConfigCache: RuntimeConfigFile | null = null;
let runtimeConfigFetchAttempted = false;
let runtimeConfigLoadedSuccessfully = false;

/**
 * Fetch runtime config from static JSON file (for static hosting scenarios)
 */
async function fetchRuntimeConfig(): Promise<RuntimeConfigFile> {
  if (runtimeConfigCache !== null) {
    return runtimeConfigCache;
  }

  if (runtimeConfigFetchAttempted) {
    return {};
  }

  runtimeConfigFetchAttempted = true;

  try {
    const response = await fetch('/runtime-config.json');
    if (!response.ok) {
      console.warn('[Runtime Config] Failed to fetch /runtime-config.json:', response.status);
      runtimeConfigCache = {};
      return {};
    }
    const config = await response.json();
    runtimeConfigCache = config;
    runtimeConfigLoadedSuccessfully = true;
    console.log('[Runtime Config] Loaded /runtime-config.json successfully');
    return config;
  } catch (error) {
    console.warn('[Runtime Config] Error loading /runtime-config.json:', error);
    runtimeConfigCache = {};
    return {};
  }
}

/**
 * Validate that a string is a valid IC principal format
 */
function isValidPrincipalFormat(value: string): boolean {
  try {
    Principal.fromText(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate the backend canister ID with detailed error classification
 * Prefers build-time env, falls back to runtime config file
 */
export async function validateBackendCanisterId(): Promise<RuntimeConfigValidation> {
  // First, try build-time environment variable
  const buildTimeValue = import.meta.env.VITE_BACKEND_CANISTER_ID;

  if (buildTimeValue && buildTimeValue.trim() !== '') {
    const trimmedValue = buildTimeValue.trim();

    if (!isValidPrincipalFormat(trimmedValue)) {
      return {
        isValid: false,
        canisterId: trimmedValue,
        error: 'invalid',
        errorMessage: `Build-time backend canister ID "${trimmedValue}" is not a valid Internet Computer principal. Expected format: xxxxx-xxxxx-xxxxx-xxxxx-xxx`,
        source: 'build-time',
      };
    }

    console.log('[Runtime Config] Using build-time VITE_BACKEND_CANISTER_ID:', trimmedValue);
    return {
      isValid: true,
      canisterId: trimmedValue,
      error: null,
      errorMessage: null,
      source: 'build-time',
    };
  }

  // Fall back to runtime config file (for static hosting)
  console.log('[Runtime Config] Build-time VITE_BACKEND_CANISTER_ID not set, attempting to load /runtime-config.json');
  const runtimeConfig = await fetchRuntimeConfig();
  const runtimeValue = runtimeConfig.backendCanisterId;

  if (!runtimeValue || runtimeValue.trim() === '') {
    return {
      isValid: false,
      canisterId: null,
      error: 'missing',
      errorMessage:
        'Backend canister ID is not configured. For IC deployment, set VITE_BACKEND_CANISTER_ID before building. For static hosting, edit /runtime-config.json in your deployed site.',
      source: 'none',
    };
  }

  const trimmedRuntimeValue = runtimeValue.trim();

  if (!isValidPrincipalFormat(trimmedRuntimeValue)) {
    return {
      isValid: false,
      canisterId: trimmedRuntimeValue,
      error: 'invalid',
      errorMessage: `Runtime backend canister ID "${trimmedRuntimeValue}" from /runtime-config.json is not a valid Internet Computer principal. Expected format: xxxxx-xxxxx-xxxxx-xxxxx-xxx`,
      source: 'runtime-file',
    };
  }

  console.log('[Runtime Config] Using runtime /runtime-config.json backendCanisterId:', trimmedRuntimeValue);
  return {
    isValid: true,
    canisterId: trimmedRuntimeValue,
    error: null,
    errorMessage: null,
    source: 'runtime-file',
  };
}

/**
 * Synchronous check if build-time backend canister ID is missing
 */
export function isBackendCanisterIdMissing(): boolean {
  const rawValue = import.meta.env.VITE_BACKEND_CANISTER_ID;
  return !rawValue || rawValue.trim() === '';
}

/**
 * Get the backend canister ID value (or null if missing/invalid)
 */
export async function getBackendCanisterId(): Promise<string | null> {
  const validation = await validateBackendCanisterId();
  return validation.isValid ? validation.canisterId : null;
}

/**
 * Get runtime configuration diagnostics for error screens
 */
export async function getRuntimeConfigDiagnostics(
  isAuthenticated: boolean
): Promise<RuntimeConfigDiagnostics> {
  const validation = await validateBackendCanisterId();

  return {
    backendCanisterId: validation.canisterId,
    isBackendCanisterIdMissing: validation.error === 'missing',
    isBackendCanisterIdInvalid: validation.error === 'invalid',
    validationError: validation.errorMessage,
    isAuthenticated,
    environment: import.meta.env.DEV ? 'development' : 'production',
    source: validation.source,
    runtimeConfigAttempted: runtimeConfigFetchAttempted,
    runtimeConfigLoaded: runtimeConfigLoadedSuccessfully,
  };
}

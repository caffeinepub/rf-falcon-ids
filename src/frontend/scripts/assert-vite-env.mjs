#!/usr/bin/env node
/**
 * Build-time environment validator for VITE_BACKEND_CANISTER_ID
 * Validates using real IC principal parser and fails fast with clear remediation
 */

import { Principal } from '@dfinity/principal';

const REQUIRED_ENV_VAR = 'VITE_BACKEND_CANISTER_ID';

function validateCanisterId() {
  const rawValue = process.env[REQUIRED_ENV_VAR];

  // Check if missing or empty
  if (!rawValue || rawValue.trim() === '') {
    console.error('');
    console.error('❌ ERROR: VITE_BACKEND_CANISTER_ID is not set or is empty');
    console.error('');
    console.error('This environment variable is REQUIRED for production builds.');
    console.error('The frontend cannot connect to the backend without it.');
    console.error('');
    console.error('How to fix:');
    console.error('  1. Deploy your backend canister first:');
    console.error('     dfx deploy backend --network ic');
    console.error('');
    console.error('  2. Get the canister ID:');
    console.error('     dfx canister id backend --network ic');
    console.error('');
    console.error('  3. Export the environment variable:');
    console.error('     export VITE_BACKEND_CANISTER_ID=$(dfx canister id backend --network ic)');
    console.error('');
    console.error('  4. Then rebuild:');
    console.error('     pnpm run build');
    console.error('');
    process.exit(1);
  }

  const trimmedValue = rawValue.trim();

  // Validate principal format using real IC principal parser
  try {
    Principal.fromText(trimmedValue);
    console.log(`✓ VITE_BACKEND_CANISTER_ID validated: ${trimmedValue}`);
    return true;
  } catch (error) {
    console.error('');
    console.error('❌ ERROR: VITE_BACKEND_CANISTER_ID is not a valid IC principal');
    console.error('');
    console.error(`   Got: "${trimmedValue}"`);
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('Expected format: xxxxx-xxxxx-xxxxx-xxxxx-xxx');
    console.error('');
    console.error('How to fix:');
    console.error('  1. Verify your backend is deployed:');
    console.error('     dfx canister id backend --network ic');
    console.error('');
    console.error('  2. Copy the correct canister ID and export it:');
    console.error('     export VITE_BACKEND_CANISTER_ID=<your-canister-id>');
    console.error('');
    console.error('  3. Then rebuild:');
    console.error('     pnpm run build');
    console.error('');
    process.exit(1);
  }
}

// Run validation
validateCanisterId();

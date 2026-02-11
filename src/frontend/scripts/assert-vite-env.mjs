#!/usr/bin/env node
/**
 * Build-time environment validator for VITE_BACKEND_CANISTER_ID
 * Validates using real IC principal parser and fails fast with clear remediation
 * Allows empty value for static hosting mode (runtime config)
 */

import { Principal } from '@dfinity/principal';

const REQUIRED_ENV_VAR = 'VITE_BACKEND_CANISTER_ID';

function validateCanisterId() {
  const rawValue = process.env[REQUIRED_ENV_VAR];

  // Allow empty/missing for static hosting mode (runtime config)
  if (!rawValue || rawValue.trim() === '') {
    console.log('⚠️  VITE_BACKEND_CANISTER_ID is not set');
    console.log('   This is acceptable for static hosting deployments that use /runtime-config.json');
    console.log('   For IC deployment, set this variable before building:');
    console.log('     export VITE_BACKEND_CANISTER_ID=$(dfx canister id backend --network ic)');
    console.log('');
    return true;
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

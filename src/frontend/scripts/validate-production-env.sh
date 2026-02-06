#!/bin/bash
# Production environment validation script
# Run this before deploying to catch configuration issues early

set -e

echo "🔍 Validating production environment configuration..."

# Check if VITE_BACKEND_CANISTER_ID is set and non-empty
if [ -z "$VITE_BACKEND_CANISTER_ID" ]; then
    echo ""
    echo "❌ ERROR: VITE_BACKEND_CANISTER_ID is not set or is empty"
    echo ""
    echo "This environment variable is required for production deployment."
    echo ""
    echo "How to fix:"
    echo "  1. Deploy your backend canister first:"
    echo "     dfx deploy backend --network ic"
    echo ""
    echo "  2. Get the canister ID:"
    echo "     dfx canister id backend --network ic"
    echo ""
    echo "  3. Export the environment variable:"
    echo "     export VITE_BACKEND_CANISTER_ID=\$(dfx canister id backend --network ic)"
    echo ""
    echo "  4. Then run this script again or proceed with deployment"
    echo ""
    exit 1
fi

echo "✓ VITE_BACKEND_CANISTER_ID is set: $VITE_BACKEND_CANISTER_ID"

# Validate canister ID format (basic check)
if [[ ! "$VITE_BACKEND_CANISTER_ID" =~ ^[a-z0-9-]+$ ]]; then
    echo ""
    echo "⚠️  WARNING: VITE_BACKEND_CANISTER_ID format looks unusual"
    echo "   Expected format: lowercase letters, numbers, and hyphens"
    echo "   Got: $VITE_BACKEND_CANISTER_ID"
    echo ""
    echo "Continuing anyway, but verify this is correct..."
    echo ""
fi

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo ""
    echo "⚠️  WARNING: dfx command not found"
    echo "   Make sure dfx is installed and in your PATH for deployment"
    echo ""
fi

echo ""
echo "✅ Production environment validation passed"
echo ""

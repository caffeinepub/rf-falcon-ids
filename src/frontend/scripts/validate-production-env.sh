#!/bin/bash
# Production environment validation script
# Run this before deploying to catch configuration issues early

set -e

echo "🔍 Validating production environment configuration..."

# Use the Node-based validator for strict principal validation
if ! node "$(dirname "$0")/assert-vite-env.mjs"; then
    echo ""
    echo "❌ Environment validation failed"
    echo ""
    exit 1
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

#!/bin/bash
# IC Mainnet deployment script for RF-FALCON-IDS frontend
# This script handles the complete production deployment process

set -e

echo "🚀 RF-FALCON-IDS Mainnet Deployment"
echo "===================================="
echo ""

# Step 1: Validate environment
echo "Step 1: Validating production environment..."
echo "--------------------------------------------"

# Check if backend canister ID is provided
if [ -z "$VITE_BACKEND_CANISTER_ID" ]; then
    echo "❌ VITE_BACKEND_CANISTER_ID not set"
    echo ""
    echo "Attempting to retrieve from dfx..."
    
    if command -v dfx &> /dev/null; then
        BACKEND_ID=$(dfx canister id backend --network ic 2>/dev/null || echo "")
        if [ -n "$BACKEND_ID" ]; then
            # Trim whitespace and newlines
            BACKEND_ID=$(echo "$BACKEND_ID" | tr -d '[:space:]')
            export VITE_BACKEND_CANISTER_ID="$BACKEND_ID"
            echo "✓ Retrieved backend canister ID: $VITE_BACKEND_CANISTER_ID"
        else
            echo ""
            echo "❌ Could not retrieve backend canister ID from dfx"
            echo ""
            echo "Please ensure:"
            echo "  1. Backend is deployed: dfx deploy backend --network ic"
            echo "  2. Or set manually: export VITE_BACKEND_CANISTER_ID=<your-canister-id>"
            echo ""
            exit 1
        fi
    else
        echo ""
        echo "❌ dfx not found and VITE_BACKEND_CANISTER_ID not set"
        echo ""
        echo "Please install dfx or set VITE_BACKEND_CANISTER_ID manually"
        echo ""
        exit 1
    fi
else
    # Trim whitespace from provided value
    VITE_BACKEND_CANISTER_ID=$(echo "$VITE_BACKEND_CANISTER_ID" | tr -d '[:space:]')
    export VITE_BACKEND_CANISTER_ID
fi

# Run strict validation script
if ! bash "$(dirname "$0")/validate-production-env.sh"; then
    echo ""
    echo "❌ Environment validation failed"
    echo ""
    exit 1
fi

echo ""
echo "Step 2: Building frontend for production..."
echo "--------------------------------------------"

# Build with production mode (includes .ic-assets.json5 for caching)
if ! pnpm run build; then
    echo ""
    echo "❌ Frontend build failed"
    echo ""
    echo "Common causes:"
    echo "  - TypeScript compilation errors"
    echo "  - Missing dependencies (run: pnpm install)"
    echo "  - Invalid environment configuration"
    echo ""
    exit 1
fi

echo "✓ Frontend build completed successfully"
echo ""

# Copy .ic-assets.json5 to dist for deployment
if [ -f "public/.ic-assets.json5" ]; then
    cp public/.ic-assets.json5 dist/.ic-assets.json5
    echo "✓ Caching configuration copied to dist"
fi

echo ""
echo "Step 3: Deploying frontend assets to IC..."
echo "--------------------------------------------"

# Deploy frontend canister
if ! dfx deploy frontend --network ic; then
    echo ""
    echo "❌ Frontend asset deployment failed"
    echo ""
    echo "Common causes:"
    echo "  - Network connectivity issues"
    echo "  - Insufficient cycles in wallet"
    echo "  - dfx authentication issues (run: dfx identity get-principal)"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check network: dfx ping ic"
    echo "  - Check wallet balance: dfx wallet balance --network ic"
    echo "  - Re-authenticate: dfx identity use default"
    echo ""
    exit 1
fi

echo "✓ Frontend assets deployed successfully"
echo ""

echo "Step 4: Verifying deployment..."
echo "--------------------------------"

# Get frontend canister ID
FRONTEND_ID=$(dfx canister id frontend --network ic 2>/dev/null || echo "")

if [ -n "$FRONTEND_ID" ]; then
    echo "✓ Frontend canister ID: $FRONTEND_ID"
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "Access your application at:"
    echo "  https://$FRONTEND_ID.ic0.app"
    echo "  https://$FRONTEND_ID.raw.ic0.app"
    echo ""
    echo "Performance optimizations applied:"
    echo "  ✓ Code splitting (dashboard/admin lazy-loaded)"
    echo "  ✓ WebP icons (~60% smaller)"
    echo "  ✓ Long-lived caching for static assets"
    echo "  ✓ Optimized React Query behavior"
    echo ""
    echo "Next steps:"
    echo "  1. Test authentication (sign up/sign in)"
    echo "  2. Create a test order"
    echo "  3. Verify admin panel access (username: TravvyC)"
    echo "  4. Test export/print functionality"
    echo "  5. Check browser DevTools Network tab for cache hits"
    echo ""
else
    echo "⚠️  Could not retrieve frontend canister ID"
    echo "   Deployment may have succeeded, but verification failed"
    echo ""
fi

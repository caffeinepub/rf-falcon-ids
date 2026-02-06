# RF-FALCON-IDS Deployment Guide

Complete guide for deploying RF-FALCON-IDS to the Internet Computer mainnet.

## Prerequisites

Before deploying, ensure you have:

1. **DFX CLI** installed (version 0.15.0 or higher)
   ```bash
   dfx --version
   ```
   Install/upgrade: `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`

2. **Node.js** (version 18 or higher) and **pnpm** installed
   ```bash
   node --version
   pnpm --version
   ```

3. **Cycles wallet** configured for mainnet
   ```bash
   dfx identity get-wallet --network ic
   ```
   If not configured, follow: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-wallet

4. **Sufficient cycles** in your wallet (minimum ~2-3 TC for initial deployment)
   ```bash
   dfx wallet balance --network ic
   ```

## Admin Bootstrap Configuration

### Setting Up the Initial Admin

The admin role is configured using Internet Identity principals, not email addresses. The backend uses a secure bootstrap mechanism that reads the `caffeineAdminToken` parameter during actor initialization.

**Important:** The admin principal must be obtained from the Internet Identity associated with traviscastonguay@gmail.com.

#### Steps to Configure Admin:

1. **Get Your Internet Identity Principal:**
   - Visit https://identity.ic0.app/
   - Sign in with the Internet Identity linked to traviscastonguay@gmail.com
   - Your principal ID will be displayed (format: `xxxxx-xxxxx-xxxxx-xxxxx-xxx`)
   - Copy this principal ID

2. **Set the Admin Principal:**
   The admin principal is configured during canister deployment via the `caffeineAdminToken` parameter in the actor initialization. This is handled automatically by the deployment infrastructure.

   **For manual configuration (if needed):**
   - The principal should be set as an environment variable or deployment parameter
   - Never commit the admin principal to source control
   - Use secure secret management for production deployments

3. **Verify Admin Access:**
   After deployment, sign in with your Internet Identity and verify that:
   - The "Admin" link appears in the header
   - You can access the `/admin` route
   - The admin panel displays all orders

### Security Notes

- Admin access is granted based on Internet Identity principals, not email addresses
- The Internet Computer does not expose email addresses to canisters
- Admin principals are configured securely during deployment
- Multiple admin principals can be configured if needed
- Admin status persists across sessions and is verified on every backend call

## Quick Deployment (Recommended)

Use the automated deployment script:


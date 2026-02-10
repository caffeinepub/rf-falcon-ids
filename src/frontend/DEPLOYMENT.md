# RF-FALCON-IDS Deployment Guide

This guide covers deploying the RF-FALCON-IDS application to the Internet Computer mainnet and static hosting platforms (cPanel, etc.).

## Prerequisites

- [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed and configured (for IC deployment)
- Sufficient ICP cycles in your wallet (for IC deployment)
- Backend canister already deployed to mainnet (for IC deployment)
- Web hosting account with file upload access (for static hosting)

## Deployment Options

### Option 1: Internet Computer (IC) Mainnet Deployment

#### Important: Build-Time Configuration

**Critical:** The `VITE_BACKEND_CANISTER_ID` environment variable must be set **before building** the frontend. This is a build-time configuration for IC deployments.

The deployment process:
1. Sets/retrieves the backend canister ID
2. Validates the canister ID format (must be a valid IC principal)
3. Builds the frontend with the injected configuration
4. Deploys the built assets to IC

#### Automated Deployment (Recommended)

Use the provided deployment script which handles all steps automatically:


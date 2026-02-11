# Specification

## Summary
**Goal:** Restore the app to Version 55 and fix backend canister ID configuration so Dashboard, Admin Panel, and ordering work reliably in production and static hosting.

**Planned changes:**
- Roll back/restore the codebase to Version 55 as the active version and ensure the project rebuilds cleanly.
- Fix frontend production configuration resolution for the backend canister ID (build-time `VITE_BACKEND_CANISTER_ID` or runtime `/runtime-config.json`) so valid configuration does not route to a generic error page.
- Ensure missing/invalid canister ID shows the dedicated configuration error screen (with diagnostics), not a generic router error.
- Update the configuration error screen help text to reference the correct deployed runtime config file path/workflow (e.g., editing `/runtime-config.json` on the deployed static site) and clearly distinguish static hosting vs IC deployment.
- Verify end-to-end flows against the Motoko backend when configured: loading user dashboard orders, loading admin panel, and successfully placing orders via the cart/checkout flow.

**User-visible outcome:** When the backend canister ID is correctly set (via env var or runtime config), users can access the Dashboard, place orders, and admins can use the Admin Panel without being redirected to a configuration/generic error page; if misconfigured, the app shows a clear configuration error screen with accurate fix instructions.

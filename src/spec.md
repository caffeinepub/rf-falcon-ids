# Specification

## Summary
**Goal:** Enable static self-hosting (e.g., cPanel) by allowing runtime backend canister ID configuration, fix dashboard/admin ordering flow errors, and improve deployment reliability/documentation without changing the existing UI design.

**Planned changes:**
- Add a runtime-config fallback mechanism for the backend canister ID when `VITE_BACKEND_CANISTER_ID` is missing at build time, while preserving current behavior when it is set.
- Update the existing backend connectivity diagnostics/error screen to clearly indicate whether the canister ID is coming from build-time env or runtime config, and display the configured principal once set.
- Ensure the production build output is cPanel-friendly (includes `index.html` and required built assets) and add documentation for uploading to cPanel plus SPA deep-link refresh routing via an Apache `.htaccess` example.
- Fix dashboard and admin-dashboard flows so authenticated users can reach the dashboard via Get Started and complete the order/checkout flow when backend configuration is valid, while preserving current design/behavior.
- Improve IC deployment scripts/docs to reliably inject/validate `VITE_BACKEND_CANISTER_ID` (using `dfx` when available), with actionable failure messages and without committing canister IDs into version control.

**User-visible outcome:** The site can be uploaded and run as a static SPA on cPanel with a runtime-editable backend canister ID (no rebuild needed if missing), dashboard/admin routes work correctly when configured, and IC deployment provides clearer, more reliable canister ID injection and guidance.

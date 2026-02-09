# Specification

## Summary
**Goal:** Make signature capture clearly visible and reliable in both light/dark themes, add the falcon “ID” favicon/apple touch icon, and resolve any build/deployment issues.

**Planned changes:**
- Update the signature pad canvas styling and drawing configuration to ensure high-contrast ink vs background in both light and dark mode.
- Fix signature canvas sizing/clearing behavior (devicePixelRatio-aware sizing, crisp rendering, correct pointer coordinate mapping, and clear restoring the intended background).
- Add and wire up the falcon “ID” favicon and apple touch icon files so the existing HTML icon links load successfully after build/deploy.
- Audit and fix concrete missing-asset references and runtime/build errors that could break production build or key flows.

**User-visible outcome:** Users can clearly see their signature while drawing (including in dark mode), signatures render crisply and clear correctly, the site shows the new falcon “ID” favicon/app icon, and the app builds/deploys without missing-asset or console errors in core flows.

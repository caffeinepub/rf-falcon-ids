# Specification

## Summary
**Goal:** Modernize the public site’s theme and typography to match the admin panel’s professional look, ensuring readable, accessible contrast across all supported theme/color combinations using semantic Tailwind design tokens.

**Planned changes:**
- Update global design tokens and base typography in `frontend/src/index.css` (and related Tailwind token usage) to standardize font family, sizes, and UI surface styling using semantic classes (e.g., `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`).
- Audit and adjust key public UI components’ foreground/background pairings and interactive states (hover/focus/active/disabled) to maintain legibility in both light and dark modes, including visible focus indicators.
- Refresh public-facing layout styling (header, footer/shell, landing hero/sections) in `frontend/src/components/BrandHeader.tsx`, `frontend/src/components/AppShell.tsx`, and `frontend/src/pages/LandingPage.tsx` to match the admin panel’s spacing/surfaces/typography without changing routes, navigation, or content.
- Validate existing admin themes (`goth-black`, `silver-steel`, `white-luxury`, `deep-purple`, `fire-red`) for readable contrast and consistent semantic token usage across admin components and theme switching states (without editing `frontend/src/components/ui`).

**User-visible outcome:** The public site and admin panel present a cohesive modern theme with standardized typography and consistently readable text, borders, and interactive states across all existing themes in both light and dark mode.

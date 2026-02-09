# Specification

## Summary
**Goal:** Add admin-managed promo codes that apply a fixed 5% discount at checkout, and record/display promo usage on orders.

**Planned changes:**
- Extend the backend order model to store optional promo usage details (whether a promo was applied and the promo code string used), with safe defaults for existing orders.
- Add admin-only backend APIs to list, add, and remove/deactivate promo codes (normalized/trimmed; consistent matching).
- Update backend order creation to accept an optional promo code, validate it against configured promo codes, apply the 5% discount only when valid, and reject invalid codes with a clear English error.
- Add an Admin Panel “Promo Codes” section to view existing promo codes, add new codes, and remove/deactivate codes with loading/error states and no full page reload.
- Update the checkout/new order UI to include an optional “Promo code” input, show a 5% discount in the pricing summary when valid, and show an invalid-code message when not valid.
- Display promo usage on existing admin order list/detail views as “No promo” or the promo code string used.
- Add React Query hooks + stable query keys for promo code admin operations and invalidate/refetch lists after mutations.

**User-visible outcome:** Admins can manage promo codes in the admin panel, customers can apply a valid promo code for 5% off at checkout, and admins can see on each order whether a promo was used and which code was applied.

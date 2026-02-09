# Specification

## Summary
**Goal:** Ensure VIP status and VIP 10% discount work reliably end-to-end, improve the new order height input UX, and display delivery-time messaging on the landing page.

**Planned changes:**
- Align frontend VIP detection with the backend admin-toggled VIP source of truth so VIP status updates reflect in the customer UI without manual workarounds.
- Apply an exact 10% VIP discount across all new-order pricing displays (pricing breakdown and final total), showing a “VIP 10% Discount” line item only for VIP users.
- Replace the new order form height text input with a dropdown/select while preserving the existing height field in the create-order payload and validation flow.
- Add a clearly visible “2–3 week Delivery time” message to the landing page.
- Fix any runtime errors or broken flows related to VIP checking, admin VIP toggling, order pricing display, and order creation for both VIP and non-VIP users.

**User-visible outcome:** Admins can toggle VIP and customers immediately see the correct VIP experience; VIP users consistently receive 10% off in the order pricing UI; customers select height from a dropdown when creating an order; and the landing page clearly shows “2–3 week Delivery time.”

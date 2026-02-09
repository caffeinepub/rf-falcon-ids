# Specification

## Summary
**Goal:** Simplify the Admin Panel by removing the standalone Accounts area and allow admins to manage a user’s account (ban/VIP) directly from the Orders admin UI.

**Planned changes:**
- Remove the Admin Panel “Accounts” tab/section (trigger, content, and related lazy imports) and update Admin Panel header/description text to no longer reference managing accounts from a separate dashboard section.
- In the Admin Orders management UI, add per-order account controls for the order owner (when present): ban/unban and grant/revoke VIP, including clear messaging when an order has no owner.
- Add an admin-only backend API to fetch account status for a specific Principal (targeted lookup) to support the order-linked account management UI, and refresh UI state after changes without a manual reload.

**User-visible outcome:** Admins no longer see an Accounts tab, and can ban/unban users and toggle VIP status directly from an order (when the order has an associated owner), with the UI reflecting updates immediately.

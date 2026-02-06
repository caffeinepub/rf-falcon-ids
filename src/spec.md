# Specification

## Summary
**Goal:** Let admins add tracking numbers to non-pending orders and show users a payment-instructions notification after submitting an order.

**Planned changes:**
- Extend the backend Order model to include an optional tracking number and return it from existing order queries.
- Add an admin-only backend method to set/update an order’s tracking number, rejecting updates while the order is pending.
- Update the Admin Panel orders UI to display an add/edit tracking-number field per order (disabled/hidden while pending) and save changes with success/error feedback and automatic refresh.
- Update the Order Details page to display the tracking number only when it exists.
- After successful order submission, show a notification/toast with the exact text: "Please contact the owner for payment methods".

**User-visible outcome:** Admins can add or update tracking numbers for approved/shipped orders, customers can see tracking numbers on order details when available, and customers see a payment-methods notification after successfully placing an order.

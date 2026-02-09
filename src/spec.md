# Specification

## Summary
**Goal:** Fix the order placement flow so clicking “Create Order” / “Place Order” never gets stuck in a perpetual loading state and always resolves with success or a clear error.

**Planned changes:**
- Diagnose and fix the root cause of the create-order submission hanging so the mutation always settles (success/error) and the UI exits loading reliably.
- Backend: add a caller-safe `isCallerBanned` query that returns whether the authenticated caller is banned, and traps as Unauthorized for unauthenticated callers.
- Frontend: wrap the backend create-order call with a timeout so hung calls reject, clear `isPending`, and show an actionable English timeout message.
- Frontend: improve error handling by converting backend traps/rejects (unauthorized, banned/security block/rate-limit, duplicate order ID) into clear English messages displayed in the existing error Alert on `NewOrderPage`.

**User-visible outcome:** Submitting an order completes or fails with an understandable English error (including timeouts), and the submit button never remains stuck loading—users can retry immediately after any failure.

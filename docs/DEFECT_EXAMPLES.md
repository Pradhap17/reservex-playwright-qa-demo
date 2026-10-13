# Sample Defect Reports (illustrative, not observed in ReserveX)

## RXQA-001 — Commission total is inconsistent with configured rate
- **Severity:** High (illustrative)
- **Area:** Booking / commission
- **Preconditions:** Tour price $420; commission rate 12%; two guests
- **Steps:** Search the tour; select two guests; create a booking; inspect the response and confirmation summary.
- **Expected:** Subtotal = $840; commission = $100.80.
- **Actual:** Replace with the actual observed result when reproducing in the demo or client staging.
- **Evidence:** Attach Playwright trace, request/response payload with sensitive fields redacted, and screenshot.
- **Status:** Example template only — not a real defect claim.

## RXQA-002 — Refund is accepted before cancellation
- **Severity:** High (illustrative)
- **Area:** Cancellation / refund API
- **Steps:** Create a booking; call the refund endpoint without cancelling.
- **Expected:** Request is rejected with a clear conflict response and no refund state change.
- **Actual:** Fill in only after observing a reproducible failure.
- **Evidence:** API response, booking state before/after, correlation ID.
- **Status:** Example template only — not a real defect claim.

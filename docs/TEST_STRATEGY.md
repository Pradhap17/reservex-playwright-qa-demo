# ReserveX QA Strategy — Demonstration

## Scope
- Tour search, tour details, inventory availability and guest selection
- Booking creation and booking reference validation
- Price subtotal and commission calculation
- Simulated payment success and decline paths
- Cancellation/refund state transitions
- REST API response schema, status codes and negative validation
- Chromium, Firefox and WebKit browser coverage
- Failure evidence via screenshot, video, trace, HTML and JUnit reports

## Risk-based priorities
| Priority | Risk | Example checks |
|---|---|---|
| P0 | Financial integrity | Subtotal, commission, payment decline, duplicate-submit prevention |
| P0 | Booking integrity | No overbooking, no booking for sold-out inventory |
| P1 | Refund integrity | Refund cannot precede cancellation; final refund status is consistent |
| P1 | Supplier/API reliability | Timeout, malformed response, retry/idempotency, partial outage |
| P2 | UX and compatibility | Responsive layout, keyboard access, cross-browser search |

## Proposed release gates
1. No open critical/high defects in booking, payment, cancellation or refund.
2. All P0 automated checks pass against the release candidate.
3. API and UI results reconcile for booking ID, totals, commission and status.
4. Evidence is attached to each failed CI run.
5. QA records a go/no-go decision with risks and known issues.

## Important limitations
This repository uses a deliberately small local mock service. It does not connect to real travel suppliers, a GDS, a payment gateway, production data, or Jira. Payment is simulated; commission rules are illustrative. Before testing a client environment, obtain written authorization, staging credentials and API contracts. Never use real card data.


## Idempotency demonstration
The mock booking endpoint requires an `Idempotency-Key` header. A successful request is stored in process memory; replaying the same key and request returns the original booking, while reusing the key with different booking data returns HTTP 409. Simulated payment declines are not cached, allowing a retry with the same key to succeed. The UI disables the submit button while a request is in flight and preserves the key for retries.

**Production caveat:** the in-memory map is for demonstration only. Production idempotency must be persisted atomically (for example, a database unique constraint/transaction) and coordinated with the payment provider's own idempotency mechanism. This demo does not model concurrent multi-instance servers or real payment side effects.

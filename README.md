# ReserveX — Travel Booking QA Automation Demo

[![Playwright CI](https://github.com/Pradhap17/reservex-playwright-qa-demo/actions/workflows/playwright.yml/badge.svg)](https://github.com/Pradhap17/reservex-playwright-qa-demo/actions/workflows/playwright.yml)

A portfolio project demonstrating end-to-end UI automation, REST API testing, booking workflow validation, and continuous integration using **Playwright, TypeScript, Node.js, and GitHub Actions**.

**Project type:** Independent mock travel-booking application  
**Test framework:** Playwright Test  
**CI platform:** GitHub Actions  
**Latest local test result:** 48 passed

> **Transparency:** ReserveX is a name used for this independent demonstration. This project is not connected to a real travel company or production booking platform. All bookings, inventory, payment outcomes, cancellations, and refunds are simulated.

## Project Highlights

- UI automation for tour search and booking workflows.
- REST API validation for booking creation and business rules.
- Idempotency testing for duplicate submissions and safe retries.
- Validation of payment failures and cancellation/refund transitions.
- Inventory availability and guest-count validation.
- Cross-browser Playwright configuration for Chromium, Firefox, and WebKit.
- Automated test execution through GitHub Actions.
- HTML test reports and failure diagnostics supported by Playwright.

## Technology Stack

| Area | Technology |
|---|---|
| Language | TypeScript |
| Automation | Playwright Test |
| Application | Node.js mock web application and API |
| API testing | Playwright APIRequestContext |
| Browsers | Chromium, Firefox, WebKit |
| CI/CD | GitHub Actions |
| Reporting | Playwright HTML report |

## Test Coverage

### UI testing

- Search tours and verify displayed results.
- Validate availability and pricing information.
- Complete a booking for two guests.
- Verify booking totals and commission calculations.
- Handle simulated payment declines.
- Prevent selection of sold-out tours.
- Validate booking retry behavior.

### API testing

- API health and tour-search validation.
- Booking creation and subtotal calculations.
- Invalid guest-count rejection.
- Sold-out inventory validation.
- Required idempotency-key validation.
- Duplicate booking submission with the same key.
- Rejection of conflicting requests that reuse an idempotency key.
- Safe retry after a simulated payment decline.
- Booking cancellation and refund state transitions.

## Test Results

The enhanced suite completed **48 passing tests in approximately 33 seconds** in a local run.

The local run covered the configured Chromium, Firefox, and WebKit projects. The GitHub Actions workflow also passed for both the initial and enhanced commits.

These results apply to this local mock application and its CI configuration. They are not production test results for a real travel platform.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Pradhap17/reservex-playwright-qa-demo.git
cd reservex-playwright-qa-demo
npm install
npx playwright install
```

### Run the tests

Run the full suite:

```bash
npm test
```

Run API tests only:

```bash
npm run test:api
```

Run smoke tests:

```bash
npm run test:smoke
```

Open the HTML report:

```bash
npm run report
```

The Playwright configuration starts the local mock application automatically at `http://127.0.0.1:4173` during test execution.

## Repository Structure

```text
reservex-playwright-qa-demo/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── demo/
│   ├── public/
│   │   └── index.html
│   └── server.js
├── docs/
│   ├── DEFECT_EXAMPLES.md
│   └── TEST_STRATEGY.md
├── tests/
│   ├── api/
│   │   └── booking-api.spec.ts
│   └── ui/
│       └── booking.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## CI/CD

GitHub Actions runs the configured Playwright workflow when the repository's workflow triggers are met.

[View workflow runs](https://github.com/Pradhap17/reservex-playwright-qa-demo/actions)

## What This Project Demonstrates

- Structured UI and API test design.
- Validation of business rules and booking state transitions.
- Handling duplicate requests and retry scenarios.
- Browser automation and cross-browser execution.
- Test reporting and CI integration.
- Documentation of test strategy and example defects.

## Scope and Limitations

- No connection to a real travel booking platform, GDS, or supplier.
- No real payment processing or refund execution.
- No production performance testing or live production testing.
- No real Jira integration.
- Example defect scenarios are illustrative, not claims of discovered production defects.

## Repository

[View source code on GitHub](https://github.com/Pradhap17/reservex-playwright-qa-demo) · [View CI results](https://github.com/Pradhap17/reservex-playwright-qa-demo/actions)

Created as an independent QA automation portfolio project.
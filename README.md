# ReserveX — Travel Booking QA Automation Demo

A portfolio-ready demonstration of a maintainable Playwright + TypeScript test framework for a multi-day travel booking workflow. Includes a local mock web app/API, UI tests, API tests, cross-browser configuration, CI, and defect/test strategy documentation.

> **Transparency:** ReserveX is the client name from the job description. This is an independent demonstration project, not the client's product and not evidence of testing their systems. Payment and supplier behavior are simulated.

## Stack
- Playwright Test + TypeScript
- UI and REST API validation
- Local Node.js mock server (no extra runtime dependency)
- Chromium, Firefox, WebKit projects
- HTML report, JUnit output, screenshots, video and traces on failure
- GitHub Actions CI

## Quick start
Requirements: Node.js 20+ (Node 22 recommended), npm, Git.

```bash
npm install
npx playwright install
npm test
```

Playwright starts the local demo server automatically at `http://127.0.0.1:4173`. Open the HTML report after the run:

```bash
npm run report
```

Run only smoke checks or API tests:

```bash
npm run test:smoke
npm run test:api
```

## Included scenarios
1. Search tours and verify result details.
2. Complete a two-guest booking and assert subtotal and commission.
3. Handle a simulated payment decline.
4. Prevent selection of sold-out inventory.
5. Validate API health and tour search.
6. Reject invalid guest counts and unavailable inventory.
7. Validate simulated payment failure.
8. Enforce cancellation-before-refund and verify state transitions.

## Suggested repository layout
```text
.
├── .github/workflows/playwright.yml
├── demo/
│   ├── public/index.html
│   └── server.js
├── docs/
│   ├── DEFECT_EXAMPLES.md
│   └── TEST_STRATEGY.md
├── tests/
│   ├── api/booking-api.spec.ts
│   └── ui/booking.spec.ts
├── .env.example
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Strong next steps before client presentation
- Run locally and confirm the suite is green.
- Push to your GitHub account and include a screenshot of the HTML report.
- Add a short screen recording showing search → booking → payment decline → API assertions.
- Be ready to explain test isolation, stable locators, retries, traces, API setup, and why financial calculations are P0.
- Ask the client for the staging URL, API docs, supported browsers, payment sandbox and supplier/GDS integration contracts before proposing production coverage.

## AI-assisted development workflow
Use Claude Code, Cursor or Copilot to draft a test, then review every selector, assertion, test-data assumption and side effect. Keep AI-generated changes small, run the tests, inspect traces, and never paste credentials, customer information or payment data into an AI tool. Playwright MCP can support browser exploration if installed and authorized, but is not required to run this project.

## What this project does not claim
- No connection to ReserveX, a real GDS or real suppliers.
- No real payment capture/refund.
- No live production testing.
- No Jira integration or real defect discovery.
- No guarantee that the suite has passed until you run it in your environment.

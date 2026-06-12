# Test Log

## 2026-06-12

Environment:

- Windows
- Node.js `v24.15.0`
- npm `11.12.1`
- `@croo-network/sdk@0.2.1`

Commands run:

```bash
npm install
npm run build
npm test
npm run mock
npm audit --omit=dev --json
secret scan for CROO SDK key patterns
```

Results:

- `npm install`: passed.
- `npm run build`: passed.
- `npm test`: passed, 12 tests passing.
- `npm run mock`: passed and wrote `outputs/mock-report.json`.
- Base RPC live lookup: succeeded; one transient timeout was observed, then mitigated with a retry and longer timeout.
- Base RPC coverage now includes address transaction count and transaction receipt status where applicable.
- Secret scan: passed; no CROO SDK key value found in project files outside dependencies/build outputs.
- `npm run requester:smoke`: not run because it needs a CROO SDK key and can create a live negotiation.
- Provider and requester loggers redact CROO SDK keys before writing SDK logs.
- Provider smoke test: passed after key rotation and startup script fix. WebSocket connected, pending negotiations count was 0, paid orders count was 0. Smoke provider process was stopped after verification.
- Provider startup now retries the initial CROO WebSocket connection so transient DNS or network errors do not immediately stop the service.
- GitHub repository published at `https://github.com/greendhy/croo-onchain-risk-agent` and README verified in browser.
- `npm audit --omit=dev`: 3 moderate vulnerabilities, all through `@croo-network/sdk -> ethers -> ws`. No fix currently available from npm audit.

Local mock output summary:

```text
LOW risk (10/100) for evm_address on base: 0x4200000000000000000000000000000000000006. Live Base RPC checks completed. No high-confidence danger flag was found from the available automated checks.
```

Pending:

- Live CROO provider connection with SDK key.
- Real paid CAP order.
- Delivery verification inside CROO dashboard.

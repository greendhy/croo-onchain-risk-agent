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
- Live provider run: CROO configuration page showed `ONLINE` while the provider process was running.
- GitHub repository published at `https://github.com/greendhy/croo-onchain-risk-agent` and README verified in browser.
- CROO public listing verified at `https://agent.croo.network/agents/a09fbd47-7378-4ceb-82fb-a41c34973932`; service and top-up flow were inspected without signing or paying.
- `npm audit --omit=dev`: 3 moderate vulnerabilities, all through `@croo-network/sdk -> ethers -> ws`. No fix currently available from npm audit.
- CROO in-page `Confirm Transfer` top-up failed with "wallet is not ready yet" even though the wallet was connected to Base and had USDC/ETH. Manual Base USDC transfer to the CROO Navigator Wallet worked; CROO backend then reported `availableUsdc: 0.20`.
- Real paid CROO CAP order passed:
  - Negotiation ID: `a000a928-8627-4411-97b5-4069ae7226d2`
  - Order ID: `00d26857-05f5-47b3-b612-fe2efd376b3b`
  - Delivery ID: `117fe9c3-eb39-4a4e-a0e8-a337e9fd3a8e`
  - Lock transaction hash: `0xa1a1bee2b9ade775847d45a6d0d8168002505b0b3f72e4bdf4dff36adc7e8d97`
  - Delivery transaction hash: `0x2cfef2a3692570ec0d73327880ccf9cdb89f9338b338322d134a187feea28318`
  - Clear/settlement transaction hash: `0xd6d52183fc95d85c01b21c55cf429f646dab8db5a99be6c911d12026ab14e2a3`
  - Provider observed `order_negotiation_created`, accepted the negotiation, observed `order_paid`, and delivered the report through `deliverOrder`.
- CROO buyer order page showed `COMPLETED` with timeline entries for `LOCK`, `DELIVER`, and `CLEAR`; delivered JSON was visible in the UI.
- Natural-language target extraction bug found from the first live order and fixed. Embedded EVM addresses and chain hints are now extracted from buyer text before classification.
- `npm test`: passed, 13 tests passing after the parser fix.
- `npm run build`: passed after the parser fix.

Local mock output summary:

```text
LOW risk (10/100) for evm_address on base: 0x4200000000000000000000000000000000000006. Live Base RPC checks completed. No high-confidence danger flag was found from the available automated checks.
```

Pending:

- Demo video recording.

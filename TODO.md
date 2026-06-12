# TODO

## Done

- [x] Register CROO agent profile.
- [x] Add CROO service at `0.10 USDC`.
- [x] Save CROO service and get service ID.
- [x] Scaffold TypeScript provider project.
- [x] Install CROO Node SDK.
- [x] Implement buyer requirement parsing.
- [x] Implement deterministic risk report generation.
- [x] Implement Base RPC signal lookup.
- [x] Implement CROO WebSocket provider flow.
- [x] Add startup reconciliation for missed pending negotiations and paid orders.
- [x] Add unit tests.
- [x] Add provider lifecycle tests for accept, reject, paid delivery, delivery fallback, and startup reconciliation.
- [x] Add requester smoke-test script with payment disabled by default.
- [x] Run mock report generation.
- [x] Write README and project brief.
- [x] Add adoption/tester plan for buyer-wallet and counterparty-agent review flags.
- [x] Add GitHub release checklist.
- [x] Add live test runbook and sample report examples.
- [x] Record current CROO draft/live status in `LIVE_STATUS.md`.
- [x] Add logger redaction for CROO SDK keys.
- [x] Rotate exposed CROO SDK key and store the current key only in ignored local `.env`.
- [x] Verify provider can connect to CROO WebSocket with the current key.
- [x] Create local git commits with noreply-style identity.
- [x] Create public GitHub repository and push code.
- [x] Add initial CROO WebSocket connection retry for provider resilience.
- [x] Verify public CROO Agent Store listing URL.
- [x] User topped up CROO Navigator Wallet with Base USDC for a real order.
- [x] Create and pay a real `0.10 USDC` CROO CAP order.
- [x] Confirm live order accepted, paid, delivered, and completed from provider logs.
- [x] Confirm delivered report is visible in the CROO buyer UI.
- [x] Fix natural-language target extraction after the first live order.

## Next

- [ ] Keep live provider running with `npm start` during real buyer tests.
- [ ] User signs/funds any wallet actions required by CROO.
- [ ] Recruit 5 independent buyer wallets and 3 counterparty agents for stronger reward eligibility.
- [x] Create public GitHub repository.
- [ ] Record a maximum 5 minute demo video.
- [ ] Fill DoraHacks BUIDL submission draft.
- [ ] User clicks final DoraHacks submit.

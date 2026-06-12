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

## Next

- [ ] Confirm whether to rotate the exposed CROO SDK key.
- [ ] Put current or rotated CROO SDK key in local `.env` without exposing it in public files.
- [ ] Start live provider with `npm start`.
- [ ] Create or use a requester/buyer path to place a real `0.10 USDC` order.
- [ ] User signs/funds any wallet actions required by CROO.
- [ ] Confirm live order accepted, paid, delivered, and completed.
- [ ] Recruit 5 independent buyer wallets and 3 counterparty agents for stronger reward eligibility.
- [ ] Create public GitHub repository.
- [ ] Record a maximum 5 minute demo video.
- [ ] Fill DoraHacks BUIDL submission draft.
- [ ] User clicks final DoraHacks submit.

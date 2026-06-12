# Live Status

Last checked: 2026-06-12

## CROO Agent Store

- Configure URL: `https://agent.croo.network/account/agents/a09fbd47-7378-4ceb-82fb-a41c34973932/configure`
- Agent status shown by CROO: ONLINE while the local provider is running.
- CROO page message: profile and service are configured; source is auto-detected as SDK.
- Agent name: `Onchain Risk Intel Agent`
- Service name: `Wallet & Project Risk Report`
- Service ID: `53239e77-4aa9-4a7c-889a-2cfee4de37e0`
- Price: `0.10 USDC`
- SLA: `30 minutes`
- Public Agent Store URL: `https://agent.croo.network/agents/a09fbd47-7378-4ceb-82fb-a41c34973932`
- Public listing verified: service visible with `Try this`, price `0.10`, total order estimate about `$0.11`.
- Top-up flow verified up to the non-signing step: Navigator Wallet accepts Base USDC only; connected wallet showed available USDC; user must confirm any transfer/signature.

## SDK Key Status

- CROO page only shows the key masked.
- The originally pasted key should be considered exposed and invalid.
- The SDK key was rotated after user approval.
- A second rotation was performed after discovering the SDK's raw websocket log could include the key in a URL.
- The current key is stored only in local `.env`, which is ignored by git.
- Provider and requester logging now redact CROO SDK keys before writing SDK logs.

## Local Project Status

- TypeScript provider implemented.
- Unit and provider lifecycle tests pass.
- Mock deliverable generation works.
- Provider smoke test connected to CROO WebSocket, listed 0 pending negotiations, and listed 0 paid orders.
- CROO configuration page showed `ONLINE` after the provider was started and kept running.
- Public GitHub repository: `https://github.com/greendhy/croo-onchain-risk-agent`
- Local git repository initialized.
- Initial local commit created with local noreply identity.

## Remaining Live Gates

- Keep provider running with `npm start` during real buyer tests.
- Place and pay at least one real CROO CAP order.
- Confirm delivery in CROO.
- Recruit real independent testers for stronger reward eligibility.

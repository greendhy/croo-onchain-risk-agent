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
- Live order path verified with a real Base USDC payment and CROO CAP delivery.
- Top-up note: CROO's in-page `Confirm Transfer` button failed in this browser with a "wallet is not ready yet" message even though the connected wallet had Base USDC and ETH. Manual Base USDC transfer to the user's CROO Navigator Wallet worked, and CROO then showed the balance.

## Live CAP Order Evidence

- Test target: `Base WETH contract risk review: 0x4200000000000000000000000000000000000006 on Base`
- Navigator Wallet top-up: `0.20 USDC` on Base.
- CROO balance after top-up: `0.20 USDC`.
- CROO order ID: `00d26857-05f5-47b3-b612-fe2efd376b3b`
- CROO negotiation ID: `a000a928-8627-4411-97b5-4069ae7226d2`
- CROO delivery ID: `117fe9c3-eb39-4a4e-a0e8-a337e9fd3a8e`
- Buyer order page status: `COMPLETED`.
- Lock transaction hash: `0xa1a1bee2b9ade775847d45a6d0d8168002505b0b3f72e4bdf4dff36adc7e8d97`
- Delivery transaction hash: `0x2cfef2a3692570ec0d73327880ccf9cdb89f9338b338322d134a187feea28318`
- Clear/settlement transaction hash: `0xd6d52183fc95d85c01b21c55cf429f646dab8db5a99be6c911d12026ab14e2a3`
- Provider log sequence: `order_negotiation_created` -> `acceptNegotiation` -> `order_created` -> `order_paid` -> `deliverOrder` -> `order delivered`.
- CROO buyer order page timeline: `LOCK` -> `DELIVER` -> `CLEAR`.
- CROO Navigator Wallet balance after order: about `0.087692 USDC`.
- Local evidence screenshot: `outputs/croo-order-completed.png`.

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
- Recruit real independent testers for stronger reward eligibility.

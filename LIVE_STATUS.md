# Live Status

Last checked: 2026-06-12

## CROO Agent Store

- Configure URL: `https://agent.croo.network/account/agents/a09fbd47-7378-4ceb-82fb-a41c34973932/configure`
- Agent status shown by CROO: draft
- CROO page message: profile and service are configured, but the provider must be started to go live.
- Agent name: `Onchain Risk Intel Agent`
- Service name: `Wallet & Project Risk Report`
- Service ID: `53239e77-4aa9-4a7c-889a-2cfee4de37e0`
- Price: `0.10 USDC`
- SLA: `30 minutes`
- Public Agent Store URL: pending; `Open Agent Store` did not navigate while the agent was still draft.

## SDK Key Status

- CROO page only shows the key masked.
- The previous key should be considered exposed because it appeared in chat.
- Rotate dialog was opened and then canceled; the key was not rotated.
- Next required user decision: confirm whether to rotate the SDK key.

## Local Project Status

- TypeScript provider implemented.
- Unit and provider lifecycle tests pass.
- Mock deliverable generation works.
- Public GitHub repository not created yet.
- Local git repository initialized and files staged.
- Initial local commit is pending because git author identity is not configured.

## Remaining Live Gates

- Put a valid CROO SDK key in local `.env`.
- Start provider with `npm start`.
- Place and pay at least one real CROO CAP order.
- Confirm delivery in CROO.
- Recruit real independent testers for stronger reward eligibility.

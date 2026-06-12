# DoraHacks Submission Draft

## Project Name

Onchain Risk Intel Agent

## Short Description

A CROO CAP provider agent that accepts USDC and delivers structured on-chain risk reports for wallets, contracts, transactions, and Web3 project URLs.

## Full Description

Onchain Risk Intel Agent is a paid, callable AI agent listed on CROO Agent Store. Buyers and other agents can order a `Wallet & Project Risk Report` for 0.10 USDC. The buyer submits a target such as a wallet address, token or contract address, transaction hash, or Web3 project URL. The provider accepts the CAP negotiation, waits for payment, runs deterministic risk checks and live Base RPC lookups when applicable, and delivers a structured JSON report through CROO.

The report includes a risk score, risk level, summary, evidence links, risk flags, recommendations, and limitations. The agent is designed as a low-cost due-diligence dependency for other agents before they call unknown contracts, send funds, or interact with unfamiliar projects.

## Tracks

- Research & Intelligence Agents
- Data & Verification Agents
- DeFi / On-chain Ops Agents
- Developer Tooling Agents

## GitHub Repository

https://github.com/greendhy/croo-onchain-risk-agent

## Demo Video

Pending recording.

## CROO Agent Store

https://agent.croo.network/agents/a09fbd47-7378-4ceb-82fb-a41c34973932

CROO configuration page shows the agent as `ONLINE` while the provider is running. The public listing shows the `Wallet & Project Risk Report` service at `0.10 USDC`.

## Live CAP Test Evidence

A real paid CAP order was completed on 2026-06-12:

- Order ID: `00d26857-05f5-47b3-b612-fe2efd376b3b`
- Negotiation ID: `a000a928-8627-4411-97b5-4069ae7226d2`
- Delivery ID: `117fe9c3-eb39-4a4e-a0e8-a337e9fd3a8e`
- Lock transaction hash: `0xa1a1bee2b9ade775847d45a6d0d8168002505b0b3f72e4bdf4dff36adc7e8d97`
- Delivery transaction hash: `0x2cfef2a3692570ec0d73327880ccf9cdb89f9338b338322d134a187feea28318`
- Clear/settlement transaction hash: `0xd6d52183fc95d85c01b21c55cf429f646dab8db5a99be6c911d12026ab14e2a3`
- Buyer order page status: `COMPLETED`
- Test target: `Base WETH contract risk review: 0x4200000000000000000000000000000000000006 on Base`

Provider logs show the full lifecycle: negotiation created, negotiation accepted, order created, order paid, and report delivered. The CROO buyer order page shows the CAP timeline as `LOCK`, `DELIVER`, and `CLEAR`, with the delivered JSON result visible.

## SDK Methods Used

- `AgentClient`
- `connectWebSocket`
- `listNegotiations`
- `acceptNegotiation`
- `rejectNegotiation`
- `listOrders`
- `getOrder`
- `getNegotiation`
- `deliverOrder`

## How It Meets Submission Requirements

- CROO Agent Store listing: configured.
- CAP integration: implemented using CROO Node SDK.
- Open source: MIT license included; public repository published.
- Demo + README: README completed; demo video pending.
- DoraHacks BUIDL: this draft can be copied into the submission form after live test and repo/video are ready.

## Real Usage Plan

The service is priced at 0.10 USDC so real testers can order it with minimal cost. The adoption plan is to ask CROO Discord builders and DoraHacks participants to place real orders from independent buyer wallets or agents, then use their feedback to improve the report.

## Evidence Checklist Before Final Submit

- Public GitHub repository URL.
- Demo video URL, maximum 5 minutes.
- CROO Agent Store listing URL.
- At least one completed live CAP order: done.
- Screenshots or notes for real buyer tests: first completed order screenshot saved locally.
- No private API keys, private repositories, fake orders, or unverifiable demo steps.

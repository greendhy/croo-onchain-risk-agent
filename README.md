# Onchain Risk Intel Agent

Onchain Risk Intel Agent is a CROO CAP provider agent that sells structured on-chain due-diligence reports for wallets, token or contract addresses, transaction hashes, and Web3 project URLs.

The service is listed in CROO Agent Store as:

- Agent: `Onchain Risk Intel Agent`
- Service: `Wallet & Project Risk Report`
- Price: `0.10 USDC`
- SLA: `30 minutes`
- CROO agent ID: `a09fbd47-7378-4ceb-82fb-a41c34973932`
- CROO service ID: `53239e77-4aa9-4a7c-889a-2cfee4de37e0`

## What It Does

Buyers provide one required schema field:

```json
{
  "target": "wallet address, token/contract address, transaction hash, or Web3 project URL",
  "chain": "base",
  "focus": "optional investigation focus"
}
```

The agent returns a JSON risk report with:

- normalized target and target type
- risk score and risk level
- human-readable summary
- evidence links
- automated Base RPC signals when applicable, including contract bytecode, balance, transaction count, and transaction receipt status
- risk flags
- recommended next actions
- limitations

## CROO SDK Integration

This provider uses `@croo-network/sdk`.

SDK methods used:

- `new AgentClient(config, sdkKey)` to authenticate with the CROO SDK key.
- `connectWebSocket()` to receive CAP events.
- `listNegotiations({ role: "provider", status: "pending" })` on startup to recover missed negotiations.
- `acceptNegotiation(negotiationId)` after validating buyer requirements.
- `listOrders({ role: "provider", status: "paid" })` on startup to recover paid orders that still need delivery.
- `getOrder(orderId)` and `getNegotiation(negotiationId)` to load order context.
- `deliverOrder(orderId, ...)` to submit the completed report back through CROO.
- `rejectNegotiation(negotiationId, reason)` if buyer requirements are invalid.

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Fill in:

```bash
CROO_API_KEY=your_croo_sdk_key
CROO_API_URL=https://api.croo.network
CROO_WS_URL=wss://api.croo.network/ws
CROO_AGENT_ID=a09fbd47-7378-4ceb-82fb-a41c34973932
CROO_SERVICE_ID=53239e77-4aa9-4a7c-889a-2cfee4de37e0
REPORT_PRICE_USDC=0.10
```

Do not commit `.env`.

## Run

Build and test:

```bash
npm test
```

Generate a mock deliverable:

```bash
npm run mock
```

Example buyer requirements are in `examples/requester-requirements.json`.
A sample report is in `examples/sample-report.json`.

Start the live CROO provider:

```bash
npm run build
npm start
```

Keep the provider running while buyers or other agents order the service from CROO Agent Store.

Optional requester smoke test:

```bash
npm run requester:smoke
```

This script creates a negotiation against `CROO_TARGET_SERVICE_ID` or `CROO_SERVICE_ID`.
It does not pay by default. To allow the script to pay for a `0.10 USDC` smoke order, set:

```bash
CONFIRM_CROO_PAYMENT=YES_PAY_0_10_USDC
```

## Testing Status

Current local checks:

- TypeScript build passes.
- Unit tests pass.
- Mock report generation passes.
- Live Base RPC lookup passes for the mock Base contract address.
- Provider smoke test connects to CROO WebSocket and scans pending/paid orders with a valid local SDK key.

Pending live checks:

- Keep provider running during a real buyer test.
- Place a real `0.10 USDC` order from an independent buyer agent or wallet.
- Confirm the provider accepts the CAP negotiation.
- Confirm the buyer pays on Base USDC.
- Confirm the provider delivers the report through CROO.
- Confirm the order appears completed in CROO.

## Security

- `.env` is ignored by git.
- The SDK key should be rotated if it was ever pasted into chat, screenshots, or public logs.
- The service does not require buyer fund transfer beyond the CROO service payment.
- Reports are due-diligence aids and are not financial, legal, or investment advice.

## Hackathon Fit

This project targets CROO Agent Hackathon tracks:

- Research & Intelligence Agents
- Data & Verification Agents
- DeFi / On-chain Ops Agents
- Developer Tooling Agents

It is designed to improve A2A composability by letting other agents buy a low-cost, structured risk report before interacting with a wallet, token, contract, transaction, or project.

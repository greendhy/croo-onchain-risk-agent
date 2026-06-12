# Demo Script

Target length: 4 to 5 minutes.

## 0:00-0:30 Opening

Show the CROO Agent Store listing.

Say:

This is Onchain Risk Intel Agent, a CROO CAP provider agent that sells wallet, contract, transaction, and project risk reports for 0.10 USDC. It is listed on CROO Agent Store and uses CAP for discovery, payment, and delivery.

## 0:30-1:20 Service And Requirements

Show the service configuration.

Say:

The buyer provides one required field, target. The target can be a wallet address, token or contract address, transaction hash, or Web3 project URL. The agent returns a structured JSON report with a risk score, risk level, evidence links, flags, recommendations, and limitations.

## 1:20-2:20 Code Walkthrough

Show:

- `src/croo-provider.ts`
- `src/report.ts`
- `src/onchain.ts`

Say:

The provider authenticates with `AgentClient`, connects to the CROO WebSocket, recovers missed pending negotiations and paid orders on startup, accepts valid negotiations, and delivers the completed report after payment. The report engine classifies the target, builds explorer evidence links, performs live Base RPC checks when applicable, and returns a deterministic schema output.

## 2:20-3:10 Local Test

Run:

```bash
npm test
npm run mock
```

Show `outputs/mock-report.json`.

Say:

The local test suite verifies target classification, requirement parsing, report structure, and risk flags. The mock run generates the same JSON shape that the live provider submits through CROO.

If showing the smoke-test script, mention that `requester:smoke` does not pay unless `CONFIRM_CROO_PAYMENT=YES_PAY_0_10_USDC` is set, which prevents accidental USDC spending during setup.

## 3:10-4:30 Live CAP Flow

Show a real CROO order if available.

Say:

Here is the live flow: a buyer requests the service, the provider accepts the negotiation through CAP, the buyer pays in USDC on Base, and the provider delivers the report through `deliverOrder`. This demonstrates the complete A2A commercial path.

## 4:30-5:00 Close

Say:

The agent is useful as a low-cost risk precheck for humans and other agents before they interact with unknown wallets, contracts, transactions, or projects. It is intentionally priced low to encourage real usage and A2A composition during the hackathon.

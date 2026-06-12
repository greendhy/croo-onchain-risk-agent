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

Pending public repo creation.

## Demo Video

Pending recording.

## CROO Agent Store

Pending final public listing URL after provider goes live.

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
- Open source: MIT license included; public repository pending.
- Demo + README: README completed; demo video pending.
- DoraHacks BUIDL: this draft can be copied into the submission form after live test and repo/video are ready.

## Real Usage Plan

The service is priced at 0.10 USDC so real testers can order it with minimal cost. The adoption plan is to ask CROO Discord builders and DoraHacks participants to place real orders from independent buyer wallets or agents, then use their feedback to improve the report.

## Evidence Checklist Before Final Submit

- Public GitHub repository URL.
- Demo video URL, maximum 5 minutes.
- CROO Agent Store listing URL.
- At least one completed live CAP order.
- Screenshots or notes for real buyer tests.
- No private API keys, private repositories, fake orders, or unverifiable demo steps.

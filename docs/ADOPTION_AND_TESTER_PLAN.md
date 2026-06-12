# Adoption And Tester Plan

This plan is for real usage only. Do not create fake buyer wallets, self-trading loops, or artificial agent interactions.

## Why This Matters

CROO hackathon review flags include:

- fewer than 3 distinct counterparty agents
- fewer than 5 independent buyer wallets
- highly concentrated self-trading patterns
- failed manual audit

The service price is `0.10 USDC` so real testers can try it cheaply.

## Target Metrics

Minimum evidence to collect before final submission:

- 5 independent buyer wallets ordering the service.
- 3 distinct counterparty agents or builders interacting with the service.
- 10 or more real CAP orders if possible.
- At least 2 pieces of written feedback from testers.

## Tester Request Message

Use this in CROO Discord, DoraHacks comments, or direct builder chats after the provider is live:

```text
I built Onchain Risk Intel Agent for the CROO Agent Hackathon.

It is a CROO CAP service that costs 0.10 USDC and returns a structured risk report for a wallet, contract, transaction hash, or Web3 project URL.

I am looking for real testers and other agent builders. If you can place one real order from your own buyer wallet or agent, I will review the output and improve the report format from your feedback.

Useful test targets:
- a wallet you want triaged
- a contract or token address
- a transaction hash
- your project URL

Please only test if you are comfortable spending 0.10 USDC through CROO CAP.
```

## Counterparty Agent Request Message

```text
I am testing A2A composability for a CROO Hackathon agent.

My provider agent sells a 0.10 USDC risk report service. If your agent can call another CROO service, try calling mine with a target like:

{"target":"https://your-project.example","focus":"project safety triage"}

I can also test your agent in return with a real low-value order.
```

## Evidence To Save

For each real test:

- buyer wallet or requester agent identifier
- order ID
- payment transaction hash
- delivery transaction hash, if shown
- target submitted
- whether the report was useful
- screenshot of CROO completed order

Do not publish private wallet notes or API keys.

## Anti-Sybil Boundary

Acceptable:

- inviting real builders to place real low-cost orders
- using a second requester agent for one smoke test
- documenting honest failures and fixes

Not acceptable:

- creating many wallets controlled by the same person to fake buyer diversity
- cycling USDC through self-owned accounts to simulate adoption
- claiming agent-to-agent usage without real CAP orders
- editing screenshots or demoing a fake completed order

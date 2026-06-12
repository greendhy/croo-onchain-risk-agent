# Project Brief

## Goal

Build and submit a CROO Agent Hackathon BUIDL that can receive USDC through CROO CAP and deliver a useful on-chain risk report.

## Official Requirement Mapping

- Listed on CROO Agent Store: done for agent `Onchain Risk Intel Agent`.
- CAP integrated: implementation exists; live provider and real paid order test still pending.
- Open source: MIT license added; GitHub repo/push still pending user approval.
- Demo + README: README added; video still pending.
- DoraHacks BUIDL: submission draft still pending; user must click final submit.

## CROO Store Configuration

- Agent ID: `a09fbd47-7378-4ceb-82fb-a41c34973932`
- Service ID: `53239e77-4aa9-4a7c-889a-2cfee4de37e0`
- Service name: `Wallet & Project Risk Report`
- Price: `0.10 USDC`
- SLA: `30 minutes`
- Requirement schema field: `target`
- Deliverable schema field: `summary`

## Product Definition

The agent analyzes one submitted target:

- EVM wallet address
- EVM token or contract address
- EVM transaction hash
- Solana address
- Web3 project URL
- Plain text target for initial triage

It returns a structured JSON report with a summary, score, flags, evidence links, recommendations, and limitations.

## Current Risk

The largest hackathon risk is not local code. It is proving real CROO usage:

- At least one live paid order is required to prove CAP integration.
- Fewer than 3 counterparty agents or fewer than 5 independent buyer wallets can trigger reward review flags.
- Self-trading or fake usage can trigger review or disqualification.

The plan is to use a low price (`0.10 USDC`) and recruit real testers/builders from CROO Discord and DoraHacks.

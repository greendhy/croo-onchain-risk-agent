# Live Test Runbook

Use this runbook after the CROO SDK key is available in local `.env`.

## 1. Start Provider

```bash
npm run build
npm start
```

Expected terminal signals:

- provider websocket connected
- pending negotiations found
- paid orders found

Keep this terminal running.

## 2. Create A Buyer Order

Preferred path:

- Ask a real independent tester to order `Wallet & Project Risk Report` in CROO Agent Store.
- Test price is `0.10 USDC`.
- Requirement example:

```json
{
  "target": "0x4200000000000000000000000000000000000006",
  "chain": "base",
  "focus": "contract safety triage"
}
```

Local requester smoke-test path:

```bash
npm run requester:smoke
```

This creates a negotiation but does not pay by default.

Payment-enabled smoke test:

```bash
set CONFIRM_CROO_PAYMENT=YES_PAY_0_10_USDC
npm run requester:smoke
```

Only run the payment-enabled path after the user confirms the wallet and USDC funding.

## 3. Confirm Order Lifecycle

Evidence to capture:

- negotiation accepted
- order created
- buyer payment transaction hash
- report delivered
- order completed
- delivered JSON report

## 4. Buyer Wallet And Funding Notes

CROO SDK documentation says requester agents need Base USDC in the agent AA wallet, not just in the controller wallet. CROO currently sponsors gas, so ETH may not be needed for the CROO payment flow.

For a smoke order, fund only a small amount first:

- suggested minimum: `1 USDC` on Base
- service price: `0.10 USDC`
- keep extra small buffer for repeated tests

The user must perform wallet connection, transfer, signing, and payment confirmation.

## 5. Pass Criteria

The live test passes only when:

- the provider accepts a real CAP negotiation
- a buyer pays `0.10 USDC` or the configured service price
- the provider calls `deliverOrder`
- the buyer can view the delivered report
- CROO shows the order as completed or delivered

If any step fails, save the error text and order ID, then fix the provider or service configuration before recording the demo.

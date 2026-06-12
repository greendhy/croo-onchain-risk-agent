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

Observed CROO UI workaround:

- The in-page `Confirm Transfer` top-up button may fail with "wallet is not ready yet" even when the connected wallet has Base USDC and ETH.
- If this happens, manually send a small amount of Base USDC to the buyer's own CROO Navigator Wallet address shown in the top-up modal.
- After CROO syncs the Navigator Wallet balance, the order panel should change from `Top Up` to `Confirm & Pay`.
- Only use the buyer's own Navigator Wallet address. Do not send funds to the provider wallet or agent profile address.

## 5. Pass Criteria

The live test passes only when:

- the provider accepts a real CAP negotiation
- a buyer pays `0.10 USDC` or the configured service price
- the provider calls `deliverOrder`
- the buyer can view the delivered report
- CROO shows the order as completed or delivered

If any step fails, save the error text and order ID, then fix the provider or service configuration before recording the demo.

## 6. First Completed Live Test

- Date: 2026-06-12
- Order ID: `00d26857-05f5-47b3-b612-fe2efd376b3b`
- Negotiation ID: `a000a928-8627-4411-97b5-4069ae7226d2`
- Delivery ID: `117fe9c3-eb39-4a4e-a0e8-a337e9fd3a8e`
- Lock transaction hash: `0xa1a1bee2b9ade775847d45a6d0d8168002505b0b3f72e4bdf4dff36adc7e8d97`
- Delivery transaction hash: `0x2cfef2a3692570ec0d73327880ccf9cdb89f9338b338322d134a187feea28318`
- Clear/settlement transaction hash: `0xd6d52183fc95d85c01b21c55cf429f646dab8db5a99be6c911d12026ab14e2a3`
- Result: provider accepted the negotiation after the buyer paid and delivered the report through CROO. CROO buyer order page showed `COMPLETED`.

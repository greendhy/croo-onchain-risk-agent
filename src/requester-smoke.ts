import "dotenv/config";
import { AgentClient, EventType } from "@croo-network/sdk";

const apiKey = process.env.CROO_REQUESTER_API_KEY || process.env.CROO_API_KEY || process.env.CROO_SDK_KEY;
const apiUrl = process.env.CROO_API_URL || "https://api.croo.network";
const wsUrl = process.env.CROO_WS_URL || "wss://api.croo.network/ws";
const targetServiceId = process.env.CROO_TARGET_SERVICE_ID || process.env.CROO_SERVICE_ID;
const paymentConfirmed = process.env.CONFIRM_CROO_PAYMENT === "YES_PAY_0_10_USDC";

if (!apiKey) throw new Error("Missing CROO_REQUESTER_API_KEY, CROO_API_KEY, or CROO_SDK_KEY.");
if (!targetServiceId) throw new Error("Missing CROO_TARGET_SERVICE_ID or CROO_SERVICE_ID.");

const client = new AgentClient({
  baseURL: apiUrl,
  wsURL: wsUrl,
  ...(process.env.BASE_RPC_URL ? { rpcURL: process.env.BASE_RPC_URL } : {}),
  logger: console,
}, apiKey);

const stream = await client.connectWebSocket();

const closeAfter = setTimeout(() => {
  console.log("[requester] timeout reached; closing smoke test");
  stream.close();
  process.exit(0);
}, 180_000);

stream.onAny((event) => {
  console.log("[requester] event", event.type, {
    negotiationId: event.negotiation_id,
    orderId: event.order_id,
    serviceId: event.service_id,
  });
});

stream.on(EventType.OrderCreated, (event) => {
  void (async () => {
    if (!event.order_id) return;
    if (!paymentConfirmed) {
      console.log("[requester] order created but payment disabled. Set CONFIRM_CROO_PAYMENT=YES_PAY_0_10_USDC to pay.");
      return;
    }

    const result = await client.payOrder(event.order_id);
    console.log("[requester] paid order", { orderId: event.order_id, txHash: result.txHash });
  })().catch((error) => {
    console.error("[requester] payment failed", error instanceof Error ? error.message : error);
  });
});

stream.on(EventType.OrderCompleted, (event) => {
  void (async () => {
    if (!event.order_id) return;
    const delivery = await client.getDelivery(event.order_id);
    console.log("[requester] delivery received");
    console.log(delivery.deliverableText || delivery.deliverableSchema);
    clearTimeout(closeAfter);
    stream.close();
    process.exit(0);
  })().catch((error) => {
    console.error("[requester] delivery fetch failed", error instanceof Error ? error.message : error);
  });
});

const requirements = JSON.stringify({
  target: process.env.SMOKE_TARGET || "0x4200000000000000000000000000000000000006",
  chain: process.env.SMOKE_CHAIN || "base",
  focus: process.env.SMOKE_FOCUS || "smoke test contract safety triage",
});

const negotiation = await client.negotiateOrder({
  serviceId: targetServiceId,
  requirements,
});

console.log("[requester] negotiation created", {
  negotiationId: negotiation.negotiationId,
  serviceId: targetServiceId,
  paymentMode: paymentConfirmed ? "enabled" : "disabled",
});

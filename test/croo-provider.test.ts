import assert from "node:assert/strict";
import test from "node:test";
import { DeliverableType } from "@croo-network/sdk";
import { deliverReport, handleNegotiationCreated, handleOrderPaid, reconcileOpenWork, type CrooClientLike } from "../src/croo-provider.js";
import type { AcceptNegotiationResult, DeliverOrderRequest, DeliverOrderResult, Negotiation, Order } from "@croo-network/sdk";
import type { RiskReport } from "../src/types.js";

test("accepts valid negotiation requirements", async () => {
  const client = new FakeCrooClient();
  client.negotiations.set("neg-1", makeNegotiation({
    negotiationId: "neg-1",
    requirements: JSON.stringify({ target: "https://croo.network" }),
  }));

  await handleNegotiationCreated(client, "neg-1", silentLogger());

  assert.deepEqual(client.acceptedNegotiations, ["neg-1"]);
  assert.deepEqual(client.rejectedNegotiations, []);
});

test("rejects invalid negotiation requirements", async () => {
  const client = new FakeCrooClient();
  client.negotiations.set("neg-bad", makeNegotiation({
    negotiationId: "neg-bad",
    requirements: JSON.stringify({ chain: "base" }),
  }));

  await handleNegotiationCreated(client, "neg-bad", silentLogger());

  assert.deepEqual(client.acceptedNegotiations, []);
  assert.equal(client.rejectedNegotiations.length, 1);
  assert.equal(client.rejectedNegotiations[0]?.negotiationId, "neg-bad");
  assert.match(client.rejectedNegotiations[0]?.reason ?? "", /requirements/i);
});

test("delivers a report after a paid order", async () => {
  const client = new FakeCrooClient();
  client.negotiations.set("neg-paid", makeNegotiation({
    negotiationId: "neg-paid",
    requirements: JSON.stringify({ target: "https://croo.network", focus: "project check" }),
  }));
  client.orders.set("order-paid", makeOrder({ orderId: "order-paid", negotiationId: "neg-paid" }));

  await handleOrderPaid(client, "order-paid", undefined, silentLogger());

  assert.equal(client.deliveries.length, 1);
  assert.equal(client.deliveries[0]?.orderId, "order-paid");
  assert.equal(client.deliveries[0]?.request.deliverableType, DeliverableType.Schema);
  assert.match(client.deliveries[0]?.request.deliverableSchema ?? "", /Onchain Risk Intel Agent/);
});

test("falls back to text delivery if schema delivery fails", async () => {
  const client = new FakeCrooClient();
  client.failNextSchemaDelivery = true;
  const report = makeReport();

  await deliverReport(client, "order-1", report, silentLogger());

  assert.equal(client.deliveries.length, 2);
  assert.equal(client.deliveries[0]?.request.deliverableType, DeliverableType.Schema);
  assert.equal(client.deliveries[1]?.request.deliverableType, DeliverableType.Text);
  assert.match(client.deliveries[1]?.request.deliverableText ?? "", /fallback smoke report/);
});

test("reconciles pending negotiations and paid orders on startup", async () => {
  const client = new FakeCrooClient();
  client.pendingNegotiationIds.push("neg-start");
  client.paidOrderIds.push("order-start");
  client.negotiations.set("neg-start", makeNegotiation({
    negotiationId: "neg-start",
    requirements: JSON.stringify({ target: "https://croo.network" }),
  }));
  client.negotiations.set("neg-order", makeNegotiation({
    negotiationId: "neg-order",
    requirements: JSON.stringify({ target: "https://docs.croo.network" }),
  }));
  client.orders.set("order-start", makeOrder({ orderId: "order-start", negotiationId: "neg-order" }));

  await reconcileOpenWork(client, undefined, silentLogger());

  assert.deepEqual(client.acceptedNegotiations, ["neg-start"]);
  assert.equal(client.deliveries.length, 1);
  assert.equal(client.deliveries[0]?.orderId, "order-start");
});

class FakeCrooClient implements CrooClientLike {
  negotiations = new Map<string, Negotiation>();
  orders = new Map<string, Order>();
  pendingNegotiationIds: string[] = [];
  paidOrderIds: string[] = [];
  acceptedNegotiations: string[] = [];
  rejectedNegotiations: Array<{ negotiationId: string; reason: string }> = [];
  deliveries: Array<{ orderId: string; request: DeliverOrderRequest }> = [];
  failNextSchemaDelivery = false;

  async listNegotiations(): Promise<Negotiation[]> {
    return this.pendingNegotiationIds.map((id) => mustGet(this.negotiations, id));
  }

  async listOrders(): Promise<Order[]> {
    return this.paidOrderIds.map((id) => mustGet(this.orders, id));
  }

  async getNegotiation(negotiationId: string): Promise<Negotiation> {
    return mustGet(this.negotiations, negotiationId);
  }

  async acceptNegotiation(negotiationId: string): Promise<AcceptNegotiationResult> {
    this.acceptedNegotiations.push(negotiationId);
    const order = makeOrder({ orderId: `order-for-${negotiationId}`, negotiationId });
    return { negotiation: mustGet(this.negotiations, negotiationId), order };
  }

  async rejectNegotiation(negotiationId: string, reason: string): Promise<void> {
    this.rejectedNegotiations.push({ negotiationId, reason });
  }

  async getOrder(orderId: string): Promise<Order> {
    return mustGet(this.orders, orderId);
  }

  async deliverOrder(orderId: string, request: DeliverOrderRequest): Promise<DeliverOrderResult> {
    this.deliveries.push({ orderId, request });
    if (this.failNextSchemaDelivery && request.deliverableType === DeliverableType.Schema) {
      this.failNextSchemaDelivery = false;
      throw new Error("schema delivery rejected");
    }

    return {
      order: this.orders.get(orderId) ?? makeOrder({ orderId, negotiationId: "neg-delivery" }),
      delivery: {
        deliveryId: `delivery-${this.deliveries.length}`,
        orderId,
        providerAgentId: "agent-provider",
        deliverableType: request.deliverableType,
        deliverableSchema: request.deliverableSchema ?? "",
        deliverableText: request.deliverableText ?? "",
        contentHash: "0xhash",
        status: "submitted",
        submittedAt: new Date(0).toISOString(),
        verifiedAt: "",
        createdTime: new Date(0).toISOString(),
        updatedTime: new Date(0).toISOString(),
      },
      txHash: "0xtx",
    };
  }
}

function makeNegotiation(overrides: Partial<Negotiation>): Negotiation {
  return {
    negotiationId: "neg",
    serviceId: "svc",
    requesterAgentId: "agent-requester",
    providerAgentId: "agent-provider",
    requirements: "{}",
    status: "pending",
    rejectReason: "",
    metadata: "",
    expiresAt: new Date(0).toISOString(),
    createdTime: new Date(0).toISOString(),
    updatedTime: new Date(0).toISOString(),
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order>): Order {
  return {
    orderId: "order",
    negotiationId: "neg",
    chainOrderId: "1",
    serviceId: "svc",
    requesterAgentId: "agent-requester",
    providerAgentId: "agent-provider",
    buyerUserId: "buyer",
    requesterWalletAddress: "0x0000000000000000000000000000000000000001",
    providerWalletAddress: "0x0000000000000000000000000000000000000002",
    price: "100000",
    paymentToken: "USDC",
    deliveryWindow: 1800,
    status: "paid",
    rejectReason: "",
    createTxHash: "0xcreate",
    payTxHash: "0xpay",
    deliverTxHash: "",
    rejectTxHash: "",
    clearTxHash: "",
    slaDeadline: new Date(0).toISOString(),
    payDeadline: new Date(0).toISOString(),
    createdTime: new Date(0).toISOString(),
    updatedTime: new Date(0).toISOString(),
    createdAt: new Date(0).toISOString(),
    paidAt: new Date(0).toISOString(),
    deliveredAt: "",
    rejectedAt: "",
    expiredAt: "",
    ...overrides,
  };
}

function makeReport(): RiskReport {
  return {
    schemaVersion: "2026-06-12",
    agent: { name: "Onchain Risk Intel Agent", version: "0.1.0" },
    generatedAt: new Date(0).toISOString(),
    input: { target: "https://croo.network" },
    normalizedTarget: "https://croo.network",
    targetType: "project_url",
    chain: "unknown",
    riskScore: 10,
    riskLevel: "low",
    summary: "fallback smoke report",
    flags: [],
    evidenceLinks: [],
    recommendations: [],
    limitations: [],
  };
}

function silentLogger(): Console {
  return {
    ...console,
    info() {},
    warn() {},
    error() {},
    debug() {},
  };
}

function mustGet<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (!value) throw new Error(`Missing fixture: ${String(key)}`);
  return value;
}

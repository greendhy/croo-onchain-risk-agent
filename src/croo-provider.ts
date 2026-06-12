import { AgentClient, DeliverableType, EventType } from "@croo-network/sdk";
import { generateRiskReport } from "./report.js";
import { parseRequirements } from "./requirements.js";
import { createRedactingLogger } from "./redact.js";
import type { ReportRequest, RiskReport } from "./types.js";
import type { AcceptNegotiationResult, DeliverOrderRequest, DeliverOrderResult, ListOptions, Negotiation, Order } from "@croo-network/sdk";

export interface ProviderConfig {
  apiKey: string;
  apiUrl: string;
  wsUrl: string;
  baseRpcUrl?: string;
  connectRetryMs?: number;
  connectMaxAttempts?: number;
}

export interface ProviderRuntime {
  close(): void;
}

export interface CrooClientLike {
  listNegotiations(opts?: ListOptions): Promise<Negotiation[]>;
  listOrders(opts?: ListOptions): Promise<Order[]>;
  getNegotiation(negotiationId: string): Promise<Negotiation>;
  acceptNegotiation(negotiationId: string): Promise<AcceptNegotiationResult>;
  rejectNegotiation(negotiationId: string, reason: string): Promise<void>;
  getOrder(orderId: string): Promise<Order>;
  deliverOrder(orderId: string, req: DeliverOrderRequest): Promise<DeliverOrderResult>;
}

export async function startCrooProvider(config: ProviderConfig, logger: Console = console): Promise<ProviderRuntime> {
  const redactingLogger = createRedactingLogger(logger);
  const client = new AgentClient(
    {
      baseURL: config.apiUrl,
      wsURL: config.wsUrl,
      ...(config.baseRpcUrl ? { rpcURL: config.baseRpcUrl } : {}),
      logger: redactingLogger,
    },
    config.apiKey,
  );

  const stream = await connectWebSocketWithRetry(client, {
    logger: redactingLogger,
    retryMs: config.connectRetryMs ?? 5_000,
    maxAttempts: config.connectMaxAttempts ?? 0,
  });
  redactingLogger.info("[croo] provider websocket connected");

  await reconcileOpenWork(client, config.baseRpcUrl, redactingLogger);

  stream.onAny((event) => {
    redactingLogger.info("[croo] event", event.type, {
      negotiationId: event.negotiation_id,
      orderId: event.order_id,
      serviceId: event.service_id,
    });
  });

  stream.on(EventType.NegotiationCreated, (event) => {
    void handleNegotiationCreated(client, event.negotiation_id, redactingLogger);
  });

  stream.on(EventType.OrderPaid, (event) => {
    void handleOrderPaid(client, event.order_id, config.baseRpcUrl, redactingLogger);
  });

  return {
    close() {
      stream.close();
    },
  };
}

async function connectWebSocketWithRetry(
  client: Pick<AgentClient, "connectWebSocket">,
  options: { logger: Console; retryMs: number; maxAttempts: number },
) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      return await client.connectWebSocket();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (options.maxAttempts > 0 && attempt >= options.maxAttempts) {
        options.logger.error("[croo] websocket connection failed permanently", { attempt, error: message });
        throw error;
      }

      options.logger.warn("[croo] websocket connection failed; retrying", {
        attempt,
        retryMs: options.retryMs,
        error: message,
      });
      await delay(options.retryMs);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reconcileOpenWork(client: CrooClientLike, baseRpcUrl: string | undefined, logger: Console): Promise<void> {
  try {
    const pendingNegotiations = await client.listNegotiations({ role: "provider", status: "pending", page: 1, pageSize: 50 });
    logger.info("[croo] pending negotiations found", { count: pendingNegotiations.length });
    for (const negotiation of pendingNegotiations) {
      await handleNegotiationCreated(client, negotiation.negotiationId, logger);
    }
  } catch (error) {
    logger.warn("[croo] could not reconcile pending negotiations", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const paidOrders = await client.listOrders({ role: "provider", status: "paid", page: 1, pageSize: 50 });
    logger.info("[croo] paid orders found", { count: paidOrders.length });
    for (const order of paidOrders) {
      await handleOrderPaid(client, order.orderId, baseRpcUrl, logger);
    }
  } catch (error) {
    logger.warn("[croo] could not reconcile paid orders", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleNegotiationCreated(client: CrooClientLike, negotiationId: string | undefined, logger: Console): Promise<void> {
  if (!negotiationId) {
    logger.warn("[croo] negotiation event missing negotiation_id");
    return;
  }

  try {
    const negotiation = await client.getNegotiation(negotiationId);
    parseRequirements(negotiation.requirements);
    const result = await client.acceptNegotiation(negotiationId);
    logger.info("[croo] negotiation accepted", {
      negotiationId,
      orderId: result.order.orderId,
      serviceId: result.order.serviceId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("[croo] failed to accept negotiation", { negotiationId, error: message });
    try {
      await client.rejectNegotiation(negotiationId, `Cannot process requirements: ${message}`);
    } catch (rejectError) {
      logger.error("[croo] failed to reject negotiation", {
        negotiationId,
        error: rejectError instanceof Error ? rejectError.message : String(rejectError),
      });
    }
  }
}

export async function handleOrderPaid(client: CrooClientLike, orderId: string | undefined, baseRpcUrl: string | undefined, logger: Console): Promise<void> {
  if (!orderId) {
    logger.warn("[croo] paid event missing order_id");
    return;
  }

  try {
    const order = await client.getOrder(orderId);
    const negotiation = await client.getNegotiation(order.negotiationId);
    const request = parseRequirements(negotiation.requirements);
    const report = await generateRiskReport(request, { baseRpcUrl });
    await deliverReport(client, orderId, report, logger);
  } catch (error) {
    logger.error("[croo] failed to handle paid order", {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function deliverReport(client: Pick<CrooClientLike, "deliverOrder">, orderId: string, report: RiskReport, logger: Console = console): Promise<void> {
  const payload = JSON.stringify(report, null, 2);
  try {
    const result = await client.deliverOrder(orderId, {
      deliverableType: DeliverableType.Schema,
      deliverableSchema: payload,
    });
    logger.info("[croo] report delivered as schema", { orderId, txHash: result.txHash });
  } catch (error) {
    logger.warn("[croo] schema delivery failed; retrying as text", {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
    const result = await client.deliverOrder(orderId, {
      deliverableType: DeliverableType.Text,
      deliverableText: payload,
    });
    logger.info("[croo] report delivered as text", { orderId, txHash: result.txHash });
  }
}

export function providerConfigFromEnv(env: NodeJS.ProcessEnv): ProviderConfig {
  const apiKey = env.CROO_API_KEY || env.CROO_SDK_KEY;
  const apiUrl = env.CROO_API_URL || "https://api.croo.network";
  const wsUrl = env.CROO_WS_URL || "wss://api.croo.network/ws";

  if (!apiKey) {
    throw new Error("Missing CROO_API_KEY or CROO_SDK_KEY in environment.");
  }

  return {
    apiKey,
    apiUrl,
    wsUrl,
    ...(env.BASE_RPC_URL ? { baseRpcUrl: env.BASE_RPC_URL } : {}),
    ...(env.CROO_CONNECT_RETRY_MS ? { connectRetryMs: Number(env.CROO_CONNECT_RETRY_MS) } : {}),
    ...(env.CROO_CONNECT_MAX_ATTEMPTS ? { connectMaxAttempts: Number(env.CROO_CONNECT_MAX_ATTEMPTS) } : {}),
  };
}

export function summarizeRequestForLog(request: ReportRequest): string {
  return `${request.target}${request.chain ? ` on ${request.chain}` : ""}${request.focus ? ` (${request.focus})` : ""}`;
}

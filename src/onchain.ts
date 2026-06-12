import type { BaseSignals, TargetType } from "./types.js";

const DEFAULT_BASE_RPC_URL = "https://mainnet.base.org";
const WEI_PER_ETH = 1_000_000_000_000_000_000n;

export interface BaseLookupOptions {
  rpcUrl?: string;
  timeoutMs?: number;
}

export async function getBaseSignals(
  normalizedTarget: string,
  targetType: TargetType,
  chain: string,
  options: BaseLookupOptions = {},
): Promise<BaseSignals | undefined> {
  if (!isBaseChain(chain)) {
    return undefined;
  }

  if (targetType !== "evm_address" && targetType !== "evm_transaction") {
    return undefined;
  }

  const rpcUrl = options.rpcUrl ?? DEFAULT_BASE_RPC_URL;
  const timeoutMs = options.timeoutMs ?? 12_000;

  try {
    if (targetType === "evm_address") {
      const [code, balance, transactionCount] = await Promise.all([
        rpcWithRetry<string>(rpcUrl, "eth_getCode", [normalizedTarget, "latest"], timeoutMs),
        rpcWithRetry<string>(rpcUrl, "eth_getBalance", [normalizedTarget, "latest"], timeoutMs),
        rpcWithRetry<string>(rpcUrl, "eth_getTransactionCount", [normalizedTarget, "latest"], timeoutMs),
      ]);
      const codeSizeBytes = Math.max(0, (code.length - 2) / 2);
      return {
        chain: "base",
        lookupStatus: "success",
        targetType: "address",
        isContract: code !== "0x",
        codeSizeBytes,
        balanceEth: weiHexToEthString(balance),
        transactionCount: Number(BigInt(transactionCount)),
      };
    }

    const [tx, receipt] = await Promise.all([
      rpcWithRetry<Record<string, unknown> | null>(rpcUrl, "eth_getTransactionByHash", [normalizedTarget], timeoutMs),
      rpcWithRetry<Record<string, unknown> | null>(rpcUrl, "eth_getTransactionReceipt", [normalizedTarget], timeoutMs),
    ]);
    const receiptStatus = typeof receipt?.status === "string" ? receipt.status : undefined;
    return {
      chain: "base",
      lookupStatus: "success",
      targetType: "transaction",
      txFound: tx !== null,
      txFrom: typeof tx?.from === "string" ? tx.from : undefined,
      txTo: typeof tx?.to === "string" ? tx.to : null,
      txValueEth: typeof tx?.value === "string" ? weiHexToEthString(tx.value) : undefined,
      txReceiptFound: receipt !== null,
      txStatus: receiptStatus === "0x1" ? "success" : receiptStatus === "0x0" ? "failed" : "unknown",
      txBlockNumber: typeof receipt?.blockNumber === "string" ? Number(BigInt(receipt.blockNumber)) : undefined,
      txContractAddress: typeof receipt?.contractAddress === "string" ? receipt.contractAddress : null,
    };
  } catch (error) {
    return {
      chain: "base",
      lookupStatus: "failed",
      targetType: targetType === "evm_address" ? "address" : "transaction",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function isBaseChain(chain: string): boolean {
  const normalized = chain.toLowerCase().replace(/\s+/g, "");
  return normalized === "base" || normalized === "base-mainnet" || normalized === "basescan";
}

async function rpcWithRetry<T>(rpcUrl: string, method: string, params: unknown[], timeoutMs: number): Promise<T> {
  try {
    return await rpc<T>(rpcUrl, method, params, timeoutMs);
  } catch (firstError) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      return await rpc<T>(rpcUrl, method, params, timeoutMs);
    } catch {
      throw firstError;
    }
  }
}

async function rpc<T>(rpcUrl: string, method: string, params: unknown[], timeoutMs: number): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Base RPC HTTP ${response.status}`);
  }

  const json = (await response.json()) as { result?: T; error?: { message?: string } };
  if (json.error) {
    throw new Error(json.error.message ?? "Base RPC returned an error");
  }

  return json.result as T;
}

function weiHexToEthString(hex: string): string {
  const wei = BigInt(hex);
  const whole = wei / WEI_PER_ETH;
  const fraction = wei % WEI_PER_ETH;
  const fractionText = fraction.toString().padStart(18, "0").replace(/0+$/, "");
  return fractionText ? `${whole}.${fractionText}` : whole.toString();
}

import type { ReportRequest } from "./types.js";

const TARGET_KEYS = [
  "target",
  "address",
  "wallet",
  "contract",
  "token",
  "tx",
  "transaction",
  "url",
  "project",
] as const;

export function parseRequirements(raw: unknown): ReportRequest {
  if (typeof raw === "object" && raw !== null) {
    return normalizeRequirementObject(raw as Record<string, unknown>);
  }

  if (typeof raw !== "string") {
    throw new Error("Requirements must contain a target string or JSON object.");
  }

  const text = raw.trim();
  if (!text) {
    throw new Error("Requirements are empty. Buyer must provide a target.");
  }

  const parsed = tryParseJson(text);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return normalizeRequirementObject(parsed as Record<string, unknown>);
  }

  return { target: text };
}

function normalizeRequirementObject(obj: Record<string, unknown>): ReportRequest {
  const target = TARGET_KEYS.map((key) => obj[key]).find((value) => typeof value === "string" && value.trim());

  if (typeof target !== "string" || !target.trim()) {
    throw new Error("Requirements JSON must include target, address, wallet, contract, tx, url, or project.");
  }

  const chain = typeof obj.chain === "string" && obj.chain.trim() ? obj.chain.trim() : undefined;
  const focus = typeof obj.focus === "string" && obj.focus.trim() ? obj.focus.trim() : undefined;

  return {
    target: target.trim(),
    ...(chain ? { chain } : {}),
    ...(focus ? { focus } : {}),
  };
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

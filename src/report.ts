import { getBaseSignals } from "./onchain.js";
import type { BaseSignals, EvidenceLink, FlagSeverity, ReportRequest, RiskFlag, RiskLevel, RiskReport, TargetType } from "./types.js";

const AGENT_VERSION = "0.1.0";
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX_RE = /^0x[a-fA-F0-9]{64}$/;
const EVM_ADDRESS_IN_TEXT_RE = /\b0x[a-fA-F0-9]{40}\b/;
const EVM_TX_IN_TEXT_RE = /\b0x[a-fA-F0-9]{64}\b/;
const URL_IN_TEXT_RE = /\bhttps?:\/\/[^\s<>"'`]+/i;
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export interface ReportOptions {
  includeLiveData?: boolean;
  baseRpcUrl?: string;
}

export async function generateRiskReport(request: ReportRequest, options: ReportOptions = {}): Promise<RiskReport> {
  const extracted = extractAnalyzableTarget(request.target);
  const normalizedTarget = extracted.target;
  const targetType = classifyTarget(normalizedTarget);
  const chain = normalizeChain(request.chain ?? extracted.chainHint, targetType);
  const evidenceLinks = buildEvidenceLinks(normalizedTarget, targetType, chain);
  const flags: RiskFlag[] = [];
  let score = 10;

  if (extracted.extractedFromText) {
    addFlag(flags, "target_extracted_from_text", "info", "Target extracted from buyer text", `The buyer submitted natural language, so the agent extracted ${normalizedTarget} as the analyzable target.`);
  }

  if (targetType === "plain_text") {
    score += addFlag(flags, "target_unstructured", "medium", "Unstructured target", "The target is not an EVM address, transaction hash, Solana address, or URL. Treat this as an initial triage, not a final due-diligence result.");
  }

  if ((targetType === "evm_address" || targetType === "evm_transaction") && !request.chain) {
    score += addFlag(flags, "chain_not_provided", "low", "Chain inferred as Base", "The buyer did not specify a chain. The agent defaulted to Base because CROO settles on Base and the hackathon uses Base USDC.");
  }

  if (targetType === "project_url") {
    score += scoreProjectUrl(normalizedTarget, flags);
  }

  const onchainSignals = options.includeLiveData === false
    ? undefined
    : await getBaseSignals(normalizedTarget, targetType, chain, { rpcUrl: options.baseRpcUrl });

  if (onchainSignals) {
    score += scoreOnchainSignals(onchainSignals, flags, evidenceLinks);
  }

  const riskScore = clamp(score, 0, 100);
  const riskLevel = toRiskLevel(riskScore);
  const summary = makeSummary(normalizedTarget, targetType, chain, riskScore, riskLevel, flags, onchainSignals);

  return {
    schemaVersion: "2026-06-12",
    agent: {
      name: "Onchain Risk Intel Agent",
      version: AGENT_VERSION,
    },
    generatedAt: new Date().toISOString(),
    input: request,
    normalizedTarget,
    targetType,
    chain,
    riskScore,
    riskLevel,
    summary,
    flags,
    evidenceLinks,
    ...(onchainSignals ? { onchainSignals } : {}),
    recommendations: buildRecommendations(targetType, riskLevel, onchainSignals),
    limitations: [
      "This report is a due-diligence aid, not financial, legal, or investment advice.",
      "Explorer links are evidence pointers; a human should inspect source code, deployer history, holders, liquidity, and recent transactions before relying on the result.",
      "Live Base RPC checks identify contract code and transaction existence, but they do not prove source-code verification or business legitimacy.",
    ],
  };
}

export function classifyTarget(target: string): TargetType {
  if (EVM_TX_RE.test(target)) return "evm_transaction";
  if (EVM_ADDRESS_RE.test(target)) return "evm_address";
  if (isLikelyUrl(target)) return "project_url";
  if (SOLANA_ADDRESS_RE.test(target)) return "solana_address";
  return "plain_text";
}

interface ExtractedTarget {
  target: string;
  chainHint?: string;
  extractedFromText: boolean;
}

export function extractAnalyzableTarget(rawTarget: string): ExtractedTarget {
  const trimmed = rawTarget.trim();
  const chainHint = detectChainHint(trimmed);

  if (classifyTarget(trimmed) !== "plain_text") {
    return { target: trimmed, ...(chainHint ? { chainHint } : {}), extractedFromText: false };
  }

  const txMatch = trimmed.match(EVM_TX_IN_TEXT_RE);
  if (txMatch) {
    return { target: txMatch[0], ...(chainHint ? { chainHint } : {}), extractedFromText: true };
  }

  const addressMatch = trimmed.match(EVM_ADDRESS_IN_TEXT_RE);
  if (addressMatch) {
    return { target: addressMatch[0], ...(chainHint ? { chainHint } : {}), extractedFromText: true };
  }

  const urlMatch = trimmed.match(URL_IN_TEXT_RE);
  if (urlMatch) {
    return { target: trimTrailingPunctuation(urlMatch[0]), ...(chainHint ? { chainHint } : {}), extractedFromText: true };
  }

  return { target: trimmed, ...(chainHint ? { chainHint } : {}), extractedFromText: false };
}

export function normalizeChain(chain: string | undefined, targetType: TargetType): string {
  if (chain?.trim()) return chain.trim().toLowerCase();
  if (targetType === "solana_address") return "solana";
  if (targetType === "evm_address" || targetType === "evm_transaction") return "base";
  return "unknown";
}

function buildEvidenceLinks(target: string, targetType: TargetType, chain: string): EvidenceLink[] {
  if (targetType === "project_url") {
    return [{ label: "Submitted project URL", url: ensureUrl(target), source: "buyer_input" }];
  }

  if (targetType === "evm_address") {
    return [{ label: `${chain} address explorer`, url: evmExplorerUrl(chain, "address", target), source: "explorer" }];
  }

  if (targetType === "evm_transaction") {
    return [{ label: `${chain} transaction explorer`, url: evmExplorerUrl(chain, "tx", target), source: "explorer" }];
  }

  if (targetType === "solana_address") {
    return [{ label: "Solana explorer", url: `https://solscan.io/account/${target}`, source: "explorer" }];
  }

  return [];
}

function scoreProjectUrl(target: string, flags: RiskFlag[]): number {
  let score = 0;
  const url = ensureUrl(target);
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      score += addFlag(flags, "non_https_project_url", "high", "Project URL is not HTTPS", "Non-HTTPS project pages can be modified or intercepted in transit.");
    }
    if (parsed.hostname.split(".").length < 2) {
      score += addFlag(flags, "weak_domain_signal", "medium", "Weak domain signal", "The submitted project URL does not look like a normal public project domain.");
    }
  } catch {
    score += addFlag(flags, "invalid_project_url", "high", "Invalid project URL", "The submitted target looked like a URL but could not be parsed reliably.");
  }
  return score;
}

function scoreOnchainSignals(signals: BaseSignals, flags: RiskFlag[], evidenceLinks: EvidenceLink[]): number {
  if (signals.lookupStatus === "failed") {
    return addFlag(flags, "base_rpc_lookup_failed", "low", "Live Base RPC lookup failed", `The Base RPC check failed: ${signals.error ?? "unknown error"}. Explorer links should be inspected manually.`, evidenceLinks);
  }

  if (signals.targetType === "address") {
    if (signals.isContract) {
      return addFlag(flags, "target_is_contract", "info", "Target is a smart contract", `Base RPC returned bytecode for this address (${signals.codeSizeBytes ?? 0} bytes) and ${signals.transactionCount ?? "unknown"} transactions. Review source verification, deployer, admin roles, and recent calls.`, evidenceLinks);
    }

    let score = addFlag(flags, "target_is_eoa", "info", "Target appears to be an EOA", `Base RPC returned no bytecode for this address and ${signals.transactionCount ?? "unknown"} transactions. Review funding source, transaction graph, and counterparties.`, evidenceLinks);
    if (signals.transactionCount !== undefined && signals.transactionCount <= 1) {
      score += addFlag(flags, "fresh_eoa", "medium", "Fresh or nearly unused EOA", "The address has one or fewer transactions on Base. Fresh wallets are not automatically malicious, but they provide little reputation history.", evidenceLinks);
    }
    return score;
  }

  if (signals.targetType === "transaction" && signals.txFound === false) {
    return addFlag(flags, "transaction_not_found_on_base", "medium", "Transaction not found on Base", "Base RPC did not find this transaction hash. The buyer may have supplied the wrong chain or an invalid hash.", evidenceLinks);
  }

  if (signals.targetType === "transaction" && signals.txStatus === "failed") {
    return addFlag(flags, "transaction_failed", "high", "Transaction failed", "Base RPC receipt status indicates this transaction reverted or failed. Review logs and called contract before repeating this action.", evidenceLinks);
  }

  return 0;
}

function buildRecommendations(targetType: TargetType, riskLevel: RiskLevel, signals?: BaseSignals): string[] {
  const recommendations = [
    "Open the evidence links and verify the target directly in the relevant explorer.",
    "Check deployer/funder history, recent counterparties, token approvals, and privileged admin methods before transacting.",
  ];

  if (targetType === "project_url") {
    recommendations.push("Cross-check the project URL against official social profiles, docs, GitHub, and known contract addresses.");
  }

  if (signals?.targetType === "address" && signals.isContract) {
    recommendations.push("Confirm source-code verification, proxy/admin ownership, pause/upgrade controls, and external call surfaces.");
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    recommendations.push("Do not send funds or sign approvals until the flagged issues are resolved by independent evidence.");
  }

  return recommendations;
}

function makeSummary(
  target: string,
  targetType: TargetType,
  chain: string,
  riskScore: number,
  riskLevel: RiskLevel,
  flags: RiskFlag[],
  signals?: BaseSignals,
): string {
  const topFlags = flags.filter((flag) => flag.severity !== "info").map((flag) => flag.title);
  const signalText = signals?.lookupStatus === "success"
    ? "Live Base RPC checks completed."
    : signals?.lookupStatus === "failed"
      ? "Live Base RPC checks failed, so explorer review is required."
      : "No live RPC signal was applicable.";

  const flagText = topFlags.length ? `Main flags: ${topFlags.join("; ")}.` : "No high-confidence danger flag was found from the available automated checks.";
  return `${riskLevel.toUpperCase()} risk (${riskScore}/100) for ${targetType} on ${chain}: ${target}. ${signalText} ${flagText}`;
}

function addFlag(
  flags: RiskFlag[],
  code: string,
  severity: FlagSeverity,
  title: string,
  detail: string,
  evidence?: EvidenceLink[],
): number {
  flags.push({ code, severity, title, detail, ...(evidence?.length ? { evidence } : {}) });
  switch (severity) {
    case "critical":
      return 45;
    case "high":
      return 30;
    case "medium":
      return 18;
    case "low":
      return 8;
    case "info":
      return 0;
  }
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

function evmExplorerUrl(chain: string, kind: "address" | "tx", target: string): string {
  const normalized = chain.toLowerCase();
  if (normalized.includes("ethereum") || normalized === "eth") {
    return `https://etherscan.io/${kind}/${target}`;
  }
  if (normalized.includes("arbitrum")) {
    return `https://arbiscan.io/${kind}/${target}`;
  }
  if (normalized.includes("optimism")) {
    return `https://optimistic.etherscan.io/${kind}/${target}`;
  }
  if (normalized.includes("polygon")) {
    return `https://polygonscan.com/${kind}/${target}`;
  }
  return `https://basescan.org/${kind}/${target}`;
}

function isLikelyUrl(target: string): boolean {
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(target);
}

function detectChainHint(text: string): string | undefined {
  if (/\bbase(?:\s+mainnet)?\b/i.test(text)) return "base";
  if (/\b(?:ethereum|eth mainnet|mainnet)\b/i.test(text)) return "ethereum";
  if (/\barbitrum\b/i.test(text)) return "arbitrum";
  if (/\boptimism\b|\bop mainnet\b/i.test(text)) return "optimism";
  if (/\bpolygon\b|\bmatic\b/i.test(text)) return "polygon";
  if (/\bsolana\b|\bsol\b/i.test(text)) return "solana";
  return undefined;
}

function ensureUrl(target: string): string {
  return /^https?:\/\//i.test(target) ? target : `https://${target}`;
}

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[),.;:!?]+$/g, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

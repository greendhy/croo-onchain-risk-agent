export type TargetType =
  | "evm_address"
  | "evm_transaction"
  | "solana_address"
  | "project_url"
  | "plain_text";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type FlagSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface ReportRequest {
  target: string;
  chain?: string;
  focus?: string;
}

export interface EvidenceLink {
  label: string;
  url: string;
  source: string;
}

export interface RiskFlag {
  code: string;
  severity: FlagSeverity;
  title: string;
  detail: string;
  evidence?: EvidenceLink[];
}

export interface BaseSignals {
  chain: "base";
  lookupStatus: "success" | "skipped" | "failed";
  targetType: "address" | "transaction";
  isContract?: boolean;
  codeSizeBytes?: number;
  balanceEth?: string;
  transactionCount?: number;
  txFound?: boolean;
  txFrom?: string;
  txTo?: string | null;
  txValueEth?: string;
  txReceiptFound?: boolean;
  txStatus?: "success" | "failed" | "unknown";
  txBlockNumber?: number;
  txContractAddress?: string | null;
  error?: string;
}

export interface RiskReport {
  schemaVersion: "2026-06-12";
  agent: {
    name: "Onchain Risk Intel Agent";
    version: string;
  };
  generatedAt: string;
  input: ReportRequest;
  normalizedTarget: string;
  targetType: TargetType;
  chain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  flags: RiskFlag[];
  evidenceLinks: EvidenceLink[];
  onchainSignals?: BaseSignals;
  recommendations: string[];
  limitations: string[];
}

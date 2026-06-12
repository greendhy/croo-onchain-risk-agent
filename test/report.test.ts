import assert from "node:assert/strict";
import test from "node:test";
import { classifyTarget, extractAnalyzableTarget, generateRiskReport } from "../src/report.js";

test("classifies common target types", () => {
  assert.equal(classifyTarget("0x4200000000000000000000000000000000000006"), "evm_address");
  assert.equal(classifyTarget(`0x${"a".repeat(64)}`), "evm_transaction");
  assert.equal(classifyTarget("https://croo.network"), "project_url");
});

test("generates structured report with summary and recommendations", async () => {
  const report = await generateRiskReport(
    { target: "0x4200000000000000000000000000000000000006", chain: "base" },
    { includeLiveData: false },
  );

  assert.equal(report.schemaVersion, "2026-06-12");
  assert.equal(report.agent.name, "Onchain Risk Intel Agent");
  assert.equal(report.targetType, "evm_address");
  assert.ok(report.summary.includes("risk"));
  assert.ok(report.recommendations.length >= 2);
  assert.ok(report.evidenceLinks[0].url.includes("basescan.org/address/"));
});

test("extracts an EVM address and chain from natural-language buyer text", async () => {
  const input = "Base WETH contract risk review: 0x4200000000000000000000000000000000000006 on Base";
  const extracted = extractAnalyzableTarget(input);
  assert.equal(extracted.target, "0x4200000000000000000000000000000000000006");
  assert.equal(extracted.chainHint, "base");
  assert.equal(extracted.extractedFromText, true);

  const report = await generateRiskReport({ target: input }, { includeLiveData: false });
  assert.equal(report.normalizedTarget, "0x4200000000000000000000000000000000000006");
  assert.equal(report.targetType, "evm_address");
  assert.equal(report.chain, "base");
  assert.ok(report.evidenceLinks[0].url.includes("basescan.org/address/"));
  assert.ok(report.flags.some((flag) => flag.code === "target_extracted_from_text"));
});

test("flags non-https project URLs", async () => {
  const report = await generateRiskReport({ target: "http://example.org" }, { includeLiveData: false });
  assert.equal(report.targetType, "project_url");
  assert.ok(report.flags.some((flag) => flag.code === "non_https_project_url"));
});

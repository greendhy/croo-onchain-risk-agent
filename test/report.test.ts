import assert from "node:assert/strict";
import test from "node:test";
import { classifyTarget, generateRiskReport } from "../src/report.js";

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

test("flags non-https project URLs", async () => {
  const report = await generateRiskReport({ target: "http://example.org" }, { includeLiveData: false });
  assert.equal(report.targetType, "project_url");
  assert.ok(report.flags.some((flag) => flag.code === "non_https_project_url"));
});

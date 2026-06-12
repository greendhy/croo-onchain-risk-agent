import assert from "node:assert/strict";
import test from "node:test";
import { parseRequirements } from "../src/requirements.js";

test("parses schema-style CROO requirements", () => {
  const parsed = parseRequirements(JSON.stringify({
    target: "0x4200000000000000000000000000000000000006",
    chain: "base",
    focus: "contract review",
  }));

  assert.equal(parsed.target, "0x4200000000000000000000000000000000000006");
  assert.equal(parsed.chain, "base");
  assert.equal(parsed.focus, "contract review");
});

test("accepts plain text target requirements", () => {
  const parsed = parseRequirements("https://example.org/project");
  assert.equal(parsed.target, "https://example.org/project");
});

test("rejects empty requirements", () => {
  assert.throws(() => parseRequirements(""), /empty/i);
});

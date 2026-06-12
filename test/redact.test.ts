import assert from "node:assert/strict";
import test from "node:test";
import { redactSecrets } from "../src/redact.js";

test("redacts CROO SDK keys from strings and nested objects", () => {
  const prefix = ["croo", "sk"].join("_");
  const redacted = redactSecrets({
    url: `wss://api.croo.network/ws?key=${prefix}_abcdef1234567890`,
    nested: [`token ${prefix}_xyz987654321`],
  });

  assert.deepEqual(redacted, {
    url: `wss://api.croo.network/ws?key=${prefix}_****REDACTED`,
    nested: [`token ${prefix}_****REDACTED`],
  });
});

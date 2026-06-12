import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { providerConfigFromEnv, startCrooProvider } from "./croo-provider.js";
import { generateRiskReport } from "./report.js";
import { parseRequirements } from "./requirements.js";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));

  if (args.has("--mock")) {
    await runMock();
    return;
  }

  const runtime = await startCrooProvider(providerConfigFromEnv(process.env));
  process.on("SIGINT", () => {
    runtime.close();
    process.exit(0);
  });
}

async function runMock(): Promise<void> {
  const rawRequirement = process.argv.find((arg) => arg.startsWith("--requirements="))?.replace("--requirements=", "")
    ?? JSON.stringify({
      target: "0x4200000000000000000000000000000000000006",
      chain: "base",
      focus: "contract safety triage",
    });

  const request = parseRequirements(rawRequirement);
  const report = await generateRiskReport(request);
  const outputPath = resolve(rootDir, "outputs", "mock-report.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Mock CROO deliverable written to ${outputPath}`);
  console.log(report.summary);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});

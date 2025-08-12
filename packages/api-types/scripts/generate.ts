import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS from "openapi-typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const root = resolve(__dirname, "../../..");
  const specPath = resolve(
    root,
    "packages/api-spec/tsp-output/@typespec/openapi3/openapi.yaml"
  );
  const specUrl = pathToFileURL(specPath).href;
  const out = resolve(__dirname, "../src/index.ts");
  const dts = await openapiTS(specUrl, {
    exportType: true,
  });
  const content = Array.isArray(dts)
    ? dts.join("\n")
    : typeof dts === "string"
    ? dts
    : typeof dts === "object" && dts !== null
    ? Object.values(dts).join("\n")
    : String(dts);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
  console.log(`Generated types from ${specPath} -> ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

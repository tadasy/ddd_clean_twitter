import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import openapiTS from "openapi-typescript";

async function main() {
  const root = resolve(__dirname, "../../..");
  const spec = resolve(
    root,
    "packages/api-spec/tsp-output/@typespec/openapi3/openapi.yaml"
  );
  const out = resolve(__dirname, "../src/index.ts");
  const dts = await openapiTS(spec, {
    exportType: true,
  });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, dts);
  console.log(`Generated types from ${spec} -> ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * `oxlint --fix` applies one fix per class string on each pass (e.g. it makes a
 * class canonical but leaves the extra whitespace for the next run). This runs
 * it until nothing else can be fixed and fails only if unfixable issues remain.
 *
 * Usage: node scripts/oxlint-fix.mjs [files...]   (no files = whole project)
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const MAX_PASSES = 10;
const files = process.argv.slice(2);
const oxlintBin = join(
  dirname(createRequire(import.meta.url).resolve("oxlint/package.json")),
  "bin/oxlint",
);

const runFixPass = () => {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [oxlintBin, "--fix", ...files],
    { encoding: "utf8" },
  );
  return { passed: status === 0, report: stdout + stderr };
};

let previousReport = "";
for (let pass = 1; pass <= MAX_PASSES; pass++) {
  const { passed, report } = runFixPass();
  if (passed) process.exit(0);
  // Same remaining issues as the previous pass: nothing else is auto-fixable
  if (report === previousReport) break;
  previousReport = report;
}

process.stderr.write(previousReport);
process.exit(1);

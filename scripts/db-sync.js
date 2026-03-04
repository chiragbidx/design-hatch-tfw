import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

// Require local Prisma binary from devDependencies to avoid network fetches
const LOCAL_PRISMA = path.join(process.cwd(), "node_modules", ".bin", "prisma");
if (!fs.existsSync(LOCAL_PRISMA)) {
  console.error("❌ prisma CLI not found at node_modules/.bin/prisma. Run `npm ci` first.");
  process.exit(1);
}
const PRISMA_CLI = `"${LOCAL_PRISMA}"`;
const SCHEMA_ARG = "--schema prisma/schema.prisma";

function run(cmd, { capture = false } = {}) {
  console.log(`→ ${cmd}`);
  const opts = capture
    ? { stdio: "pipe", encoding: "utf8" }
    : { stdio: "inherit" };
  const out = execSync(cmd, opts);
  if (capture && out) process.stdout.write(out);
  return out;
}

function main() {
  console.log("🚀 Running Prisma migration sync…");

  try {
    run(`${PRISMA_CLI} migrate deploy ${SCHEMA_ARG}`, { capture: true });
    console.log("🎉 Migrations deployed.");
    return;
  } catch (err) {
    const msgParts = [err?.message];
    if (err?.stdout) msgParts.push(err.stdout.toString());
    if (err?.stderr) msgParts.push(err.stderr.toString());
    const msg = msgParts.filter(Boolean).join("\n");
    const needsBaseline = msg.includes("P3005");
    if (!needsBaseline) throw err;

    console.log("⚠️  P3005: database not empty and no migration history. Baselining existing state…");

    const migrationDirs = fs
      .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const dir of migrationDirs) {
      run(`${PRISMA_CLI} migrate resolve --applied ${dir} ${SCHEMA_ARG}`);
    }

    run(`${PRISMA_CLI} migrate deploy ${SCHEMA_ARG}`);
    console.log("🎉 Baselined and deployed migrations.");
  }
}

main();

import { exec } from "child_process";

const BRANCH = process.env.PREVIEW_BRANCH || "preview";
const INTERVAL = Number(process.env.GIT_POLL_INTERVAL || 2000);

let lastSha = null;
let pulling = false;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}

async function poll() {
  if (pulling) return;

  try {
    pulling = true;

    await run("git fetch origin");
    const sha = await run(`git rev-parse origin/${BRANCH}`);

    if (sha !== lastSha) {
      console.log(`[git-poll] update detected → ${sha}`);
      await run(`git pull origin ${BRANCH}`);
      lastSha = sha;
    }
  } catch (err) {
    console.error("[git-poll] error:", err);
  } finally {
    pulling = false;
  }
}

console.log("[git-poll] started");
setInterval(poll, INTERVAL);

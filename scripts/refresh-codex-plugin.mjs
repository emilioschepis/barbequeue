import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginName = "barbequeue";
const marketplaceName = "barbequeue-local";
const pluginRoot = join(repoRoot, "plugins", pluginName);
const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const dryRun = process.argv.includes("--dry-run");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const previousVersion = readVersion(manifest);
manifest.version = withCachebuster(previousVersion, timestamp());

if (!dryRun) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Plugin version: ${previousVersion} -> ${manifest.version}`);

run("codex", ["plugin", "marketplace", "add", repoRoot]);
run("codex", ["plugin", "add", `${pluginName}@${marketplaceName}`]);

console.log("Open a new Codex thread, or restart the app if the plugin card is still cached.");

function readVersion(payload) {
  if (typeof payload.version !== "string" || payload.version.trim() === "") {
    throw new Error(`${manifestPath} must contain a non-empty string version.`);
  }
  return payload.version;
}

function withCachebuster(version, cachebuster) {
  return `${version.split("+", 1)[0]}+codex.${cachebuster}`;
}

function timestamp() {
  return new Date()
    .toISOString()
    .replaceAll(/[-:TZ.]/g, "")
    .slice(0, 14);
}

function run(command, args) {
  console.log(`$ ${[command, ...args].join(" ")}`);
  if (dryRun) {
    return;
  }
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit"
  });
}

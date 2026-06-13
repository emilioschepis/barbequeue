import { createRequire } from "node:module";
import { access, mkdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "landing-pitch", "dist");
const outputPath = path.join(outputDir, "barbequeue-90s.webm");
const previewPath = path.join(outputDir, "barbequeue-90s-preview.png");
const runtimeNodeModules =
  process.env.CODEX_NODE_MODULES ||
  "/Users/ivano/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const require = createRequire(import.meta.url);

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    return require(path.join(runtimeNodeModules, "playwright"));
  }
}

async function optionalExecutablePath() {
  try {
    await access(chromePath);
    return chromePath;
  } catch {
    return undefined;
  }
}

function startStaticServer() {
  const contentTypes = new Map([
    [".html", "text/html; charset=utf-8"],
    [".svg", "image/svg+xml"],
    [".ttf", "font/ttf"],
    [".woff2", "font/woff2"],
    [".png", "image/png"],
  ]);

  const server = http.createServer((request, response) => {
    const rawUrl = new URL(request.url || "/", "http://127.0.0.1");
    const safePath = path
      .normalize(decodeURIComponent(rawUrl.pathname))
      .replace(/^(\.\.[/\\])+/, "")
      .replace(/^[/\\]/, "");
    const filePath = path.join(repoRoot, safePath || "landing-pitch/video/barbequeue-90s.html");

    if (!filePath.startsWith(repoRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    response.setHeader("Content-Type", contentTypes.get(path.extname(filePath)) || "application/octet-stream");
    const stream = createReadStream(filePath);
    stream.on("error", () => {
      response.writeHead(404);
      response.end("Not found");
    });
    stream.pipe(response);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

await mkdir(outputDir, { recursive: true });

const { chromium } = loadPlaywright();
const { server, port } = await startStaticServer();
const browser = await chromium.launch({
  headless: false,
  executablePath: await optionalExecutablePath(),
  args: ["--autoplay-policy=no-user-gesture-required"],
});

try {
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    const text = message.text();
    if (text) console.log(`[browser] ${text}`);
  });
  page.on("pageerror", (error) => console.error(`[pageerror] ${error.message}`));
  page.on("crash", () => console.error("[browser] page crashed"));

  await page.goto(`http://127.0.0.1:${port}/landing-pitch/video/barbequeue-90s.html`, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => window.renderFrame(6));
  await page.screenshot({ path: previewPath, fullPage: false });

  const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
  await page.evaluate(() => window.startRenderAndDownload());
  const download = await downloadPromise;
  await download.saveAs(outputPath);
  console.log(`Rendered ${outputPath}`);
  console.log(`Preview ${previewPath}`);
} finally {
  await browser.close();
  server.close();
}

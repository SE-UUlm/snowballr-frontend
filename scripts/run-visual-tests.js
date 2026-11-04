/*
Runs the visual regression tests in `tests/visual/` against a browser inside the official
Playwright Docker image, so that screenshots are rendered identically on every machine and in CI.

Usage:
    node scripts/run-visual-tests.js [--update] [...additional playwright arguments]

With `--update`, baselines that differ (or are missing) are rewritten and afterwards losslessly
compressed with oxipng. Playwright compares decoded pixels, so compression doesn't affect matching.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import optimise, { init as initOxipng } from "@jsquash/oxipng/optimise.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const VISUAL_TEST_DIR = join(ROOT, "tests", "visual");
const CONTAINER_PORT = 3000;

/** Runs a docker command and returns its trimmed stdout. */
function docker(...args) {
    return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

function assertDockerAvailable() {
    try {
        docker("version", "--format", "{{.Server.Version}}");
    } catch {
        console.error(
            "Visual tests need Docker: the browser runs inside the Playwright Docker image so that " +
                "screenshots are identical everywhere. Please install and start Docker, then try again.",
        );
        process.exit(1);
    }
}

/** The exact installed @playwright/test version; client and server versions must match. */
function getPlaywrightVersion() {
    const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));
    return lock.packages["node_modules/@playwright/test"].version;
}

/** Starts `playwright run-server` in Docker and returns the container id and WebSocket endpoint. */
async function startBrowserServer(version) {
    const image = `mcr.microsoft.com/playwright:v${version}-noble`;
    const containerId = docker(
        "run",
        "--pull=missing",
        "--rm",
        "--init",
        "--detach",
        "--user=pwuser",
        "--workdir=/home/pwuser",
        // Ephemeral host port, bound to loopback only.
        `--publish=127.0.0.1::${CONTAINER_PORT}`,
        image,
        "/bin/sh",
        "-c",
        `npx -y playwright@${version} run-server --port ${CONTAINER_PORT} --host 0.0.0.0`,
    );

    const hostPort = docker("port", containerId, `${CONTAINER_PORT}`).split(":").pop();

    // Wait until the server announces that it is listening.
    const deadline = Date.now() + 120_000;
    while (!docker("logs", containerId).includes("Listening on")) {
        if (Date.now() > deadline) {
            stopContainer(containerId);
            throw new Error("Timed out waiting for the Playwright browser server in Docker.");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return { containerId, wsEndpoint: `ws://127.0.0.1:${hostPort}/` };
}

function stopContainer(containerId) {
    try {
        docker("stop", containerId);
    } catch {
        // already stopped
    }
}

/** Returns all PNG files below `dir` that were modified after `since` (ms timestamp). */
function findPngsModifiedSince(dir, since) {
    return readdirSync(dir, { recursive: true })
        .filter((file) => file.endsWith(".png"))
        .map((file) => join(dir, file))
        .filter((file) => statSync(file).mtimeMs >= since);
}

async function compressPngs(files) {
    if (files.length === 0) return;
    const wasmPath = fileURLToPath(
        import.meta.resolve("@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm"),
    );
    await initOxipng(await WebAssembly.compile(readFileSync(wasmPath)));

    for (const file of files) {
        const before = readFileSync(file);
        const after = Buffer.from(await optimise(before, { level: 3, optimiseAlpha: true }));
        if (after.length < before.length) writeFileSync(file, after);
        console.log(
            `oxipng: ${file.replace(ROOT, "")} ${Math.round(before.length / 1024)} KB -> ${Math.round(Math.min(after.length, before.length) / 1024)} KB`,
        );
    }
}

async function main() {
    const args = process.argv.slice(2);
    const update = args.includes("--update");
    const playwrightArgs = args.filter((arg) => arg !== "--update");
    if (update) playwrightArgs.push("--update-snapshots=changed");

    assertDockerAvailable();
    const { containerId, wsEndpoint } = await startBrowserServer(getPlaywrightVersion());

    const stop = () => stopContainer(containerId);
    process.on("SIGINT", () => {
        stop();
        process.exit(130);
    });

    const startedAt = Date.now();
    let status;
    try {
        status = spawnSync(
            "node",
            [
                join(ROOT, "scripts", "run-playwright.js"),
                "test",
                "--config",
                "playwright.visual.config.ts",
                ...playwrightArgs,
            ],
            {
                cwd: ROOT,
                stdio: "inherit",
                env: { ...process.env, PW_VISUAL_WS_ENDPOINT: wsEndpoint },
            },
        ).status;
    } finally {
        stop();
    }

    if (update) await compressPngs(findPngsModifiedSince(VISUAL_TEST_DIR, startedAt));

    process.exit(status ?? 1);
}

await main();

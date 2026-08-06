// Credits to https://github.com/GreenAsJade/online-go.com/commit/0d24569d4d6f6187838c686a6fc7f3ee05657471#diff-8cf79278a8f33c5b40ee4195627e110f7fc7946a7aaaea7286ebcdae6195f9d3
import { execSync, spawnSync } from "node:child_process";
import { MOCK_BACKEND_IMAGE } from "../tests/e2e/utils/helper/mock-backend-version.js";

execSync(`docker pull ${MOCK_BACKEND_IMAGE}`, {
    stdio: "inherit",
});

/*
Node strips types from .ts files by default since v22.18 and v23.6, so the flag below is needed on
every runtime we support. Stripping is only erasure, and the generated gRPC client contains enums,
which it cannot erase - deactivating it lets Playwright transform those files instead.
 */

const NO_TYPE_STRIPPING_FLAG = "--no-experimental-strip-types";

// At the moment, this workaround only needs to be applied when running playwright.
const BASE_COMMAND = "node_modules/playwright/cli.js";

/**
 * Runs playwright with the "--no-experimental-strip-types" flag.
 *
 * @param args (optional) additional arguments for playwright, e.g. "test"
 */
function runPlaywright(args = []) {
    const result = spawnSync("node", [NO_TYPE_STRIPPING_FLAG, BASE_COMMAND, ...args], {
        shell: true,
        stdio: "inherit",
    });

    // Propagate the exit code from the spawned process
    if (result.status !== 0) {
        process.exit(result.status);
    }
}

/**
 * Skip the first two parameters from the argv array as these
 * are the path to the node executable and this script which should
 * not be added as arguments to the playwright command.
 */
runPlaywright(process.argv.slice(2));

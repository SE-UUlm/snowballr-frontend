// Credits to https://github.com/GreenAsJade/online-go.com/commit/0d24569d4d6f6187838c686a6fc7f3ee05657471#diff-8cf79278a8f33c5b40ee4195627e110f7fc7946a7aaaea7286ebcdae6195f9d3
import { spawnSync } from "node:child_process";
import { isNode23, NO_TYPE_STRIPPING_FLAG } from "./run-node.js";

// At the moment, this workaround only needs to be applied when running playwright.
const BASE_COMMAND = "node_modules/playwright/cli.js";

function runPlaywright(args = []) {
    const nodeArgs = isNode23 ? [NO_TYPE_STRIPPING_FLAG] : [];
    spawnSync("node", [...nodeArgs, BASE_COMMAND, ...args], {
        shell: true,
        stdio: "inherit",
    });
}

runPlaywright(process.argv.slice(2));

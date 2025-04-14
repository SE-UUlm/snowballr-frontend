// Credits to https://github.com/GreenAsJade/online-go.com/commit/0d24569d4d6f6187838c686a6fc7f3ee05657471#diff-8cf79278a8f33c5b40ee4195627e110f7fc7946a7aaaea7286ebcdae6195f9d3
import { spawnSync } from "node:child_process";

// Since with Node 23 type stripping no longer has to be explicitly activated,
// but is standard and must be explicitly deactivated,
// this script checks whether node is running in version 23 and if so,
// type stripping is deactivated, since the generated GRPC client does not work with type stripping.

const isNode23 = process.version.startsWith("v23");
const NO_TYPE_STRIPPING_FLAG = "--no-experimental-strip-types";

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

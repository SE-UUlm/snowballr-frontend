import { execSync } from "child_process";
import { basename } from "path";
const { argv, exit } = process;

/**
 * Displays help information about the script
 */
function help() {
    console.log(`usage: node ${basename(__filename)} [-c] [-s] [-o] \n`);
    console.log(`Start a single or multiple frontend and mock backend setups. \n`);
    console.log("Options:");
    console.log("  -c      Whether to stop and delete all currently running containers.");
    console.log("  -s      Whether to skip building the frontend image.");
    console.log(
        "  -o      Whether to only stop and delete all currently running containers. No containers are started.",
    );
    exit(1);
}

/**
 * Stops and deletes all currently running containers
 */
function cleanUpRunningServices() {
    try {
        console.log("Cleaning up running services...");
        execSync(
            "docker compose -f compose.e2e.yaml down frontend-chromium mock-backend-chromium",
            { stdio: "inherit" },
        );
        execSync("docker compose -f compose.e2e.yaml down frontend-firefox mock-backend-firefox", {
            stdio: "inherit",
        });
        execSync("docker compose -f compose.e2e.yaml down frontend-webkit mock-backend-webkit", {
            stdio: "inherit",
        });
        console.log("Cleanup completed successfully.");
    } catch (error) {
        console.error("Error during cleanup:", error.message);
        exit(1);
    }
}

// Parse command line arguments
let doCleanUp = false;
let skipBuild = false;
let onlyCleanUp = false;

// Starting from index 2 to skip 'node' and script name
for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
        case "-c":
            doCleanUp = true;
            break;
        case "-s":
            skipBuild = true;
            break;
        case "-o":
            onlyCleanUp = true;
            break;
        case "-h":
            help();
            break;
        default:
            console.error(`Unknown option: ${arg}`);
            help();
    }
}

// Main execution logic
try {
    if (doCleanUp || onlyCleanUp) {
        cleanUpRunningServices();
        if (onlyCleanUp) {
            console.log("Exiting after cleanup...");
            exit(0);
        }
    }

    // We build the image for the first profile, the subsequent profiles can reuse the image
    console.log("Starting containers...");

    if (skipBuild) {
        console.log("Skipping build step...");
        execSync("docker compose -f compose.e2e.yaml --profile chromium up -d --wait", {
            stdio: "inherit",
        });
    } else {
        console.log("Building images and starting Chromium containers...");
        execSync("docker compose -f compose.e2e.yaml --profile chromium up --build -d --wait", {
            stdio: "inherit",
        });
    }

    console.log("Starting Firefox containers...");
    execSync("docker compose -f compose.e2e.yaml --profile firefox up -d --wait", {
        stdio: "inherit",
    });

    console.log("Starting WebKit containers...");
    execSync("docker compose -f compose.e2e.yaml --profile webkit up -d --wait", {
        stdio: "inherit",
    });

    execSync("docker compose -f compose.e2e.yaml ps", { stdio: "inherit" });

    console.log("All containers started successfully.");
} catch (error) {
    console.error("Error:", error.message);
    exit(1);
}

/**
 * Node.js script to start (multiple) mock backend(s)
 */

import { exec } from "child_process";
import { promisify } from "util";
import process from "process";

const execAsync = promisify(exec);

// Configuration
const IMAGE = "ghcr.io/se-uulm/snowballr-mock-backend:main";
const CONTAINER_PREFIX = "snowballr-mock-backend";

/**
 * Display help information and exit
 */
function showHelp() {
    console.log(
        `usage: node ${process.argv[1].split("/").pop()} [-c] [-e] port1 [port2 ... portN] \n`,
    );
    console.log(`Start a single or multiple mock backends. \n`);
    console.log(`Options:`);
    console.log(
        `  port               The port on which the web proxy of the mock backend should listen (must be 3000-3999).`,
    );
    console.log(
        `  -c                 Whether to delete all currently running mock backend containers (where names start with ${CONTAINER_PREFIX}).`,
    );
    console.log(
        `  -e                 Whether to start the mock backend with the standard example data.`,
    );
    process.exit(1);
}

/**
 * Validate that the port is within the allowed range (3000-3999)
 *
 * @param {number} port - Port number to validate
 * @returns {boolean} - True if valid
 */
function validatePort(port) {
    if (port < 3000 || port > 3999) {
        console.error(`Error: Port ${port} is out of the allowed range (3000-3999)`);
        showHelp();
        return false;
    }
    return true;
}

/**
 * Stop and remove all containers with the specified prefix
 */
async function cleanupRunningMockBackends() {
    console.log(`Stopping and removing all containers with the prefix '${CONTAINER_PREFIX}' ...`);
    try {
        const { stdout } = await execAsync(
            `docker container ls -qa --filter "name=${CONTAINER_PREFIX}"`,
        );
        const runningContainers = stdout.trim();

        if (runningContainers) {
            // Split containers by newline or space and process them one by one
            const containerIds = runningContainers.split(/[\n\s]+/);
            for (const containerId of containerIds) {
                if (containerId) {
                    console.log(`Stopping and removing container ${containerId}...`);
                    await execAsync(`docker stop ${containerId}`);
                    await execAsync(`docker rm ${containerId}`);
                }
            }
        } else {
            console.log(`Warn: No container with the prefix '${CONTAINER_PREFIX}' are running!`);
        }
    } catch (error) {
        console.error(`Error during cleanup: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Pull the latest docker image
 */
async function pullDockerImage() {
    try {
        console.log(`Pulling image ${IMAGE}...`);
        await execAsync(`docker pull ${IMAGE}`);
    } catch {
        console.error(`Error: Failed to pull image ${IMAGE}`);
        process.exit(1);
    }
}

/**
 * Start a mock backend container
 *
 * @param {number} port - Web proxy port
 * @param {number} index - Container index
 * @param {boolean} loadWithExampleData - Whether to load with example data
 */
async function startMockBackend(port, index, loadWithExampleData) {
    try {
        validatePort(port);
        const nativeServerPort = port + 1000;
        const containerName = `${CONTAINER_PREFIX}-${index}`;

        console.log(
            `Starting mock backend ${containerName} on ports ${port} (web proxy) and ${nativeServerPort} (native server) ...`,
        );

        let runCommand = `docker run -d -q `;

        if (loadWithExampleData) {
            runCommand += `-e EXAMPLE_DATA_FILE=standardData.ts `;
        }

        runCommand +=
            `-e ENABLE_DUMMY_ADMIN=true ` +
            `-e GRPC_PORT="${nativeServerPort}" ` +
            `-e GRPC_WEB_PORT="${port}" ` +
            `--name "${containerName}" ` +
            `-p "${port}:${port}" -p "${nativeServerPort}:${nativeServerPort}" ` +
            `"${IMAGE}"`;

        await execAsync(runCommand);
    } catch (error) {
        console.error(`Error: Failed to start mock backend for port ${port}: ${error.message}`);
        showHelp();
    }
}

/**
 * Main function to parse arguments and start containers
 */
async function main() {
    // Parse command line arguments
    let doCleanup = false;
    let loadWithExampleData = false;
    const ports = [];

    // Process arguments
    const args = process.argv.slice(2);
    let i = 0;

    while (i < args.length) {
        const arg = args[i];

        if (arg === "-c") {
            doCleanup = true;
        } else if (arg === "-e") {
            loadWithExampleData = true;
        } else if (arg === "-h" || arg === "--help") {
            showHelp();
        } else if (!arg.startsWith("-")) {
            // This is a port
            const port = parseInt(arg, 10);
            if (isNaN(port)) {
                console.error(`Error: Invalid port number: ${arg}`);
                showHelp();
            }
            ports.push(port);
        } else {
            console.error(`Error: Unknown option: ${arg}`);
            showHelp();
        }

        i++;
    }

    // Check for ports
    if (ports.length < 1) {
        console.error("Error: Please provide at least one port to start a mock backend.");
        showHelp();
    }

    // Pull the docker image
    await pullDockerImage();

    // Clean up existing containers if requested
    if (doCleanup) {
        await cleanupRunningMockBackends();
    }

    // Start the containers
    for (let i = 0; i < ports.length; i++) {
        await startMockBackend(ports[i], i + 1, loadWithExampleData);
    }
}

// Execute the main function
main().catch((error) => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});

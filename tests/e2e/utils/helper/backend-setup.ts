import { SnowballRClient } from "$api/main.client";
import type { Browser, Page } from "@playwright/test";
import { GrpcStatusCode, GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { exec, execSync } from "node:child_process";
import { CookieJar, Cookie } from "tough-cookie";
import crossFetch from "cross-fetch";
import cookieFetch from "fetch-cookie";
import { Nothing } from "$api/base";
import { BACKEND_IMAGE } from "./backend-version";

/**
 * Checks if the docker daemon is running.
 *
 * Docker is considered to be running if the docker version can be retrieved without any errors.
 */
async function isDockerInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        exec("docker version", (error) => {
            if (error === null) resolve(true);
            else resolve(false);
        });
    });
}

if (!(await isDockerInstalled())) {
    console.error("Docker does not seem to be installed or running.");
    process.exit(1);
}

export type User = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

/**
 * A wrapper around SnowballRClient which retains authentication cookies.
 *
 * SnowballRClient in node uses the default node-provided fetch which doesn't
 * keep track of cookies and is thus unable to authenticate properly.
 */
export class AuthSnowballRClient extends SnowballRClient {
    readonly endpoint: string;
    private get cookieEndpoint() {
        return `${this.endpoint}/snowballr.SnowballR`;
    }
    private cookieJar;

    constructor(backend: DockerBackend) {
        const cookieJar = new CookieJar();
        const transport = new GrpcWebFetchTransport({
            baseUrl: backend.endpoint,
            fetch: cookieFetch(crossFetch, cookieJar),
            fetchInit: { credentials: "include" },
        });
        super(transport);

        this.cookieJar = cookieJar;
        this.endpoint = backend.endpoint;
    }

    /**
     * Injects the authentication cookies into a playwright page. This way, the
     * page does not need to go through the sign-in process.
     */
    async injectCredentials(page: Page) {
        const cookies = (await this.cookieJar.getCookies(this.cookieEndpoint)).map((c) => {
            const expires = c.expiryTime() ?? 0;
            return {
                name: c.key,
                value: c.value,
                domain: c.domain ?? "",
                path: c.path ?? "",
                expires: expires === Infinity ? -1 : expires,
                httpOnly: c.httpOnly,
                secure: c.secure,
                sameSite: (c.sameSite as "Strict" | "Lax" | "None") ?? "Lax",
            };
        });
        await page.context().addCookies(cookies);
    }

    /**
     * Use the authentication cookies from a playwright page. If the page
     * is already authenticated as a user, this api client will then also be
     * authenticated as that user.
     */
    async useCredentials(page: Page) {
        const cookies = await page.context().cookies(this.cookieEndpoint);
        cookies.forEach((c) =>
            this.cookieJar.setCookie(
                new Cookie({
                    key: c.name,
                    value: c.value,
                    domain: c.domain,
                    path: c.path,
                    expires: new Date(c.expires),
                    httpOnly: c.httpOnly,
                    secure: c.secure,
                    sameSite: c.sameSite,
                }),
                this.cookieEndpoint,
            ),
        );
    }
}

/**
 * Manages a docker-backed backend.
 * Use `DockerBackend.create()` instead of trying to construct a new
 * instance using `new`.
 * Remember to call `dispose` after you are finished using this instance
 * to stop the container and free up resources.
 *
 * The port is chosen automatically and may be accessed using the `port`
 * attribute. Use `endpoint` to connect to this instance or make use of
 * `AuthSnowballRClient` instead.
 */
export class DockerBackend {
    get endpoint() {
        return `http://localhost:${this.port}`;
    }

    private constructor(
        readonly containerId: string,
        readonly port: number,
    ) {}

    /**
     * Stop the docker instance of the backend and free up resources.
     */
    dispose() {
        execSync(`docker stop ${this.containerId}`);
    }

    /**
     * The backend url of the frontend is difficult to adjust within a test.
     * This function reroutes every api call of the frontend to this backend.
     * It does so by intercepting every call to '.../snowballr.SnowballR/...'
     * and rewriting the URL to target this backend instead.
     */
    async setupRouting(page: Page) {
        await page.route("**/snowballr.SnowballR/**", (route, request) => {
            route.continue({
                url: `${this.endpoint}/${request.url().substring(request.url().indexOf("snowballr.SnowballR"))}`,
            });
        });
    }

    /**
     * Create a new `DockerBackend` listening on a random port.
     *
     * Remember to call `dispose` after you are finished using this instance
     * to stop the container and free up resources.
     */
    static async create() {
        // Use ephemeral syntax that doesn't provide a host port, as that is
        // also supported by podman, unlike `0`.
        const containerId = execSync(`docker run --rm --pull=never -d -p 3001 ${BACKEND_IMAGE}`)
            .toString()
            .trim();
        const port = parseInt(
            execSync(`docker port ${containerId}`).toString().trim().split(":")[1].trim(),
        );

        const backend = new DockerBackend(containerId, port);

        while (true) {
            try {
                const client = new AuthSnowballRClient(backend);
                const response = await client.getAuthenticationStatus(Nothing);
                const errorCodeValue =
                    GrpcStatusCode[response.status.code as keyof typeof GrpcStatusCode];
                if (errorCodeValue === GrpcStatusCode.OK) {
                    break;
                } else {
                    process.exit(
                        "unexpected result from backend, 'getAuthenticationStatus' should always return OK",
                    );
                }
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        return backend;
    }

    /**
     * Create a new `DockerBackend` listening on a random port and a new
     * playwright driver page targeting the newly created backend instance.
     * This automatically sets up routing of api calls.
     *
     * Remember to call `dispose` after you are finished using this instance
     * to stop the container and free up resources.
     */
    static async createWithPage(
        browser: Browser,
        baseURL: string = "http://localhost:4173",
    ): Promise<[Page, DockerBackend]> {
        const page = await browser.newPage({
            baseURL,
        });
        const dockerBackend = await DockerBackend.create();
        await dockerBackend.setupRouting(page);
        return [page, dockerBackend];
    }
}

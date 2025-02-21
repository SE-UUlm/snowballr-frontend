import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { SnowballRClient } from "./model/api/main.client";
import { env } from "$env/dynamic/public";

// If no PUBLIC_API_BASE_URL is defined, log an error and exit.
// Without the base URL, we cannot make any API calls.
if (!env.PUBLIC_API_BASE_URL) {
    console.error("PUBLIC_API_BASE_URL is not defined");
    process.exit(1);
}

let fetch = globalThis.fetch;
const customFetch = (input: URL | RequestInfo, init?: RequestInit | undefined): Promise<Response> =>
    fetch(input, init);

export function setFetch(newFetch: typeof fetch) {
    fetch = newFetch;
}

const transport = new GrpcWebFetchTransport({
    baseUrl: env.PUBLIC_API_BASE_URL,
    fetchInit: {
        credentials: "include", // same-origin?
        // DO NOT SET: mode: "no-cors"
        // It'll break things with @grpc-web/proxy in the backend and will
        // not work. 404 and 500 errors will be thrown without proper reason.
    },
    fetch: customFetch,
});

export const backendService = new SnowballRClient(transport);

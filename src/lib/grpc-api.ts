import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { SnowballRClient } from "./model/api/main.client";
import { env } from "$env/dynamic/public";

// If no PUBLIC_API_BASE_URL is defined, log an error and exit.
// Without the base URL, we cannot make any API calls.
if (!env.PUBLIC_API_BASE_URL) {
    console.error("PUBLIC_API_BASE_URL is not defined");
    process.exit(1);
}

const transport = new GrpcWebFetchTransport({
    baseUrl: env.PUBLIC_API_BASE_URL,
});

export const backendService = new SnowballRClient(transport);

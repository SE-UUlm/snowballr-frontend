import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { SnowballRClient } from "./model/api/main.client";
import { PUBLIC_API_BASE_URL } from "$env/static/public";

const transport = new GrpcWebFetchTransport({
    baseUrl: PUBLIC_API_BASE_URL,
});

export const backendService = new SnowballRClient(transport);

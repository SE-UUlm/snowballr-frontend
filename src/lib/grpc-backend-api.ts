import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { SnowballRClient } from "./grpc-gen/main.client";
import { PUBLIC_API_BASE_URL } from "$env/static/public";

let transport = new GrpcWebFetchTransport({
    baseUrl: PUBLIC_API_BASE_URL,
});

export let backend = new SnowballRClient(transport);


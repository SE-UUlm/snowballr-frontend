import { GrpcStatusCode, GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { RpcError } from "@protobuf-ts/runtime-rpc";
import { SnowballRClient } from "snowballr-api/main.client";
import { env } from "$env/dynamic/public";
import { getFetch } from "./fetch";
import { grpcWebDevToolsInterceptor } from "./grpc-devtools";
import { IS_IN_DEV_MODE } from "$lib/constants";

// Without the base URL, we cannot make any API calls. This module runs in the browser and during the
// build, so it throws instead of calling `process.exit`, which does not exist in the browser.
if (!env.PUBLIC_API_BASE_URL) {
    throw new Error("PUBLIC_API_BASE_URL is not defined. Set it to the URL of the backend API.");
}

const credentials: RequestCredentials =
    (env.PUBLIC_CREDENTIAL_POLICY as RequestCredentials) ?? "same-origin";

/**
 * Calls the current `fetch` and reports a request that could not be sent as gRPC `UNAVAILABLE`.
 *
 * `fetch` rejects with a `TypeError` when it cannot send the request at all, e.g. when offline, when
 * the proxy is down or when CORS blocks it. The transport would turn that into `INTERNAL`, which it
 * also uses for server errors, but it passes an `RpcError` through as it is. Other rejections stay
 * unchanged, so the transport still reports an `AbortError` as `CANCELLED`.
 */
const customFetch = (input: URL | RequestInfo, init?: RequestInit | undefined): Promise<Response> =>
    getFetch()(input, init).catch((error: unknown) => {
        if (error instanceof TypeError) {
            throw new RpcError(error.message, GrpcStatusCode[GrpcStatusCode.UNAVAILABLE]);
        }
        throw error;
    });

const transport = new GrpcWebFetchTransport({
    baseUrl: env.PUBLIC_API_BASE_URL,
    fetchInit: {
        credentials,
        // DO NOT SET: mode: "no-cors"
        // It'll break things with @grpc-web/proxy in the backend and will
        // not work. 404 and 500 errors will be thrown without proper reason.
    },
    fetch: customFetch,
    interceptors: IS_IN_DEV_MODE ? [grpcWebDevToolsInterceptor] : [],
});

/**
 * The generated gRPC-Web client.
 *
 * Only the modules in `src/lib/api/` use it. Everything else calls their domain functions, so that
 * the transport can change without touching routes and components.
 */
export const client = new SnowballRClient(transport);

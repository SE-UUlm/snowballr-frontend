import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
import { AuthenticationStatus, AuthenticationStatusResponse } from "snowballr-api/authentication";
import { Nothing } from "snowballr-api/base";
import { call } from "$lib/api/grpc";
import type * as ClientModule from "$lib/api/client";

// setupTest.ts mocks the client for all other tests. These tests send real calls through the
// grpc-web transport and only replace `fetch`.
vi.unmock("$lib/api/client");

let api: typeof ClientModule;

beforeAll(async () => {
    // client.ts reads the base URL when it is loaded, and setupTest.ts mocks the env as empty.
    const { env } = await import("$env/dynamic/public");
    env.PUBLIC_API_BASE_URL = "http://backend.test";
    api = await import("$lib/api/client");
});

afterEach(() => {
    api.setFetch(globalThis.fetch);
});

const DATA_FRAME = 0x00;
const TRAILER_FRAME = 0x80;

function frame(type: number, data: Uint8Array): number[] {
    const header = new Uint8Array(5);
    header[0] = type;
    new DataView(header.buffer).setUint32(1, data.length);
    return [...header, ...data];
}

/**
 * Builds the grpc-web response of a server that sends a message and then the given status.
 *
 * @param message - The message the server sends
 * @param status - The status in the trailers
 * @param detail - The status message in the trailers
 * @returns The response for `fetch` to resolve with
 */
function messageThenStatus(
    message: AuthenticationStatusResponse,
    status: GrpcStatusCode,
    detail = "",
): Response {
    const trailers = new TextEncoder().encode(
        `grpc-status: ${status}\r\ngrpc-message: ${detail}\r\n`,
    );
    const body = new Uint8Array([
        ...frame(DATA_FRAME, AuthenticationStatusResponse.toBinary(message)),
        ...frame(TRAILER_FRAME, trailers),
    ]);
    return new Response(body, { headers: { "content-type": "application/grpc-web+proto" } });
}

describe("client", () => {
    const authenticated = { authenticationStatus: AuthenticationStatus.AUTHENTICATED };

    test("When the server sends a message and status OK, then the call returns the message", async () => {
        api.setFetch(() => Promise.resolve(messageThenStatus(authenticated, GrpcStatusCode.OK)));

        const result = call(api.client.getAuthenticationStatus(Nothing));

        await expect(result).resolves.toEqual(authenticated);
    });

    test("When the server sends a message and then a failing status, then the call rejects with that status", async () => {
        api.setFetch(() =>
            Promise.resolve(
                messageThenStatus(authenticated, GrpcStatusCode.PERMISSION_DENIED, "denied"),
            ),
        );

        const result = call(api.client.getAuthenticationStatus(Nothing));

        await expect(result).rejects.toMatchObject({
            kind: "permission-denied",
            message: "denied",
        });
    });

    test("When the request cannot be sent, then the call rejects as unavailable", async () => {
        api.setFetch(() => Promise.reject(new TypeError("Failed to fetch")));

        const result = call(api.client.getAuthenticationStatus(Nothing));

        await expect(result).rejects.toMatchObject({
            kind: "unavailable",
            message: "Failed to fetch",
        });
    });

    test("When the request is aborted, then the call rejects as cancelled", async () => {
        api.setFetch(() =>
            Promise.reject(new DOMException("The request was aborted", "AbortError")),
        );

        const result = call(api.client.getAuthenticationStatus(Nothing));

        await expect(result).rejects.toMatchObject({ kind: "cancelled" });
    });

    test("When PUBLIC_API_BASE_URL is not set, then loading the client fails with a clear error", async () => {
        vi.resetModules();
        const { env } = await import("$env/dynamic/public");
        // What compose.yaml passes when the variable is unset
        env.PUBLIC_API_BASE_URL = "";

        await expect(import("$lib/api/client")).rejects.toThrow(
            "PUBLIC_API_BASE_URL is not defined",
        );
    });
});

import { describe, expect, test } from "vitest";
import { RpcError } from "@protobuf-ts/runtime-rpc";
import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
import { ApiError, type ApiErrorKind } from "$lib/api/errors";
import { call, toApiError } from "$lib/api/grpc";

function codedError(code: unknown, message = "rpc failed") {
    return Object.assign(new Error(message), { code });
}

describe("toApiError", () => {
    test.each<[string, ApiErrorKind]>([
        ["UNAUTHENTICATED", "unauthenticated"],
        ["PERMISSION_DENIED", "permission-denied"],
        ["NOT_FOUND", "not-found"],
        ["ALREADY_EXISTS", "already-exists"],
        ["FAILED_PRECONDITION", "failed-precondition"],
        ["INVALID_ARGUMENT", "invalid-argument"],
        ["UNAVAILABLE", "unavailable"],
        ["DEADLINE_EXCEEDED", "unavailable"],
        ["CANCELLED", "cancelled"],
    ])("When the error has the gRPC code %s, then the kind is %s", (code, kind) => {
        expect(toApiError(new RpcError("rpc failed", code)).kind).toBe(kind);
    });

    test("When the gRPC code has no matching kind, then the kind is unknown", () => {
        expect(toApiError(new RpcError("rpc failed", "INTERNAL")).kind).toBe("unknown");
    });

    test("When the gRPC code is given as a number, then it is mapped like its name", () => {
        expect(toApiError(codedError(GrpcStatusCode.NOT_FOUND)).kind).toBe("not-found");
    });

    test("When a plain error carries a gRPC code, then it is mapped like an RpcError", () => {
        expect(toApiError(codedError("ALREADY_EXISTS")).kind).toBe("already-exists");
    });

    test.each<[string, unknown]>([
        ["a plain error without code", new Error("boom")],
        ["an unknown code name", codedError("NOT_A_CODE")],
        ["an unknown code number", codedError(42)],
        ["a string", "boom"],
        ["undefined", undefined],
    ])("When the error is %s, then the kind is unknown", (_, error) => {
        expect(toApiError(error).kind).toBe("unknown");
    });

    test("When the error is converted, then message and cause are kept", () => {
        const rpcError = new RpcError("project not found", "NOT_FOUND");

        const apiError = toApiError(rpcError);

        expect(apiError).toBeInstanceOf(ApiError);
        expect(apiError.message).toBe("project not found");
        expect(apiError.cause).toBe(rpcError);
    });

    test("When the error is already an ApiError, then it is returned unchanged", () => {
        const apiError = new ApiError("not-found", "gone");

        expect(toApiError(apiError)).toBe(apiError);
    });
});

describe("call", () => {
    const OK_STATUS = { code: "OK", detail: "OK" };

    test("When response and status resolve, then the response is returned", async () => {
        const result = call({
            response: Promise.resolve({ id: "1" }),
            status: Promise.resolve(OK_STATUS),
        });

        await expect(result).resolves.toEqual({ id: "1" });
    });

    test("When the response rejects, then it rejects with the corresponding ApiError", async () => {
        const rpcError = new RpcError("already there", "ALREADY_EXISTS");

        const result = call({
            response: Promise.reject(rpcError),
            status: Promise.reject(rpcError),
        });

        await expect(result).rejects.toBeInstanceOf(ApiError);
        await expect(result).rejects.toMatchObject({ kind: "already-exists", cause: rpcError });
    });

    test("When the response resolves but the status rejects, then it rejects with the corresponding ApiError", async () => {
        const rpcError = new RpcError("not allowed", "PERMISSION_DENIED");

        const result = call({
            response: Promise.resolve({ id: "1" }),
            status: Promise.reject(rpcError),
        });

        await expect(result).rejects.toBeInstanceOf(ApiError);
        await expect(result).rejects.toMatchObject({ kind: "permission-denied", cause: rpcError });
    });
});

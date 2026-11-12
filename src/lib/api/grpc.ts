// The gRPC side of the API layer, used only by the modules in src/lib/api/. Domain modules wrap each
// call of the generated client in `call`, which turns a gRPC failure into an ApiError. The REST
// client replaces this file, while errors.ts stays as it is.
import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
import { ApiError, type ApiErrorKind } from "./errors";

const KIND_BY_GRPC_STATUS: Partial<Record<GrpcStatusCode, ApiErrorKind>> = {
    [GrpcStatusCode.UNAUTHENTICATED]: "unauthenticated",
    [GrpcStatusCode.PERMISSION_DENIED]: "permission-denied",
    [GrpcStatusCode.NOT_FOUND]: "not-found",
    [GrpcStatusCode.ALREADY_EXISTS]: "already-exists",
    [GrpcStatusCode.FAILED_PRECONDITION]: "failed-precondition",
    [GrpcStatusCode.INVALID_ARGUMENT]: "invalid-argument",
    [GrpcStatusCode.UNAVAILABLE]: "unavailable",
    // A timeout leaves the caller where an unreachable backend does: try again later.
    [GrpcStatusCode.DEADLINE_EXCEEDED]: "unavailable",
    [GrpcStatusCode.CANCELLED]: "cancelled",
};

/**
 * Resolves a gRPC status code given by name (as `RpcError.code` does) or by number.
 *
 * @param code - The code to resolve
 * @returns The status code, or `undefined` if the value is not a known gRPC status code
 */
function toGrpcStatus(code: unknown): GrpcStatusCode | undefined {
    if (typeof code === "number") {
        return code in GrpcStatusCode ? code : undefined;
    }
    if (typeof code === "string") {
        const status = GrpcStatusCode[code as keyof typeof GrpcStatusCode];
        return typeof status === "number" ? status : undefined;
    }
    return undefined;
}

/**
 * Converts anything a gRPC call rejects with into an {@link ApiError}.
 *
 * The kind is derived from a `code` property holding a gRPC status code. `RpcError` has one, and
 * tests use plain errors with one. Anything else becomes `"unknown"`. An {@link ApiError} is
 * returned unchanged.
 *
 * @param error - The value the call rejected with
 * @returns The corresponding {@link ApiError}, with `error` as its cause
 */
export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    const code =
        typeof error === "object" && error !== null ? Reflect.get(error, "code") : undefined;
    const status = toGrpcStatus(code);
    const kind = (status !== undefined && KIND_BY_GRPC_STATUS[status]) || "unknown";
    const message = error instanceof Error ? error.message : String(error);

    return new ApiError(kind, message, { cause: error });
}

/**
 * Awaits the response of a generated client call and rejects with an {@link ApiError} on failure.
 *
 * It also awaits `status`, because `response` alone can hide a failure: the grpc-web transport
 * resolves `response` as soon as the message arrives and only then checks the status in the
 * trailers. A call that delivers a message and then fails rejects only `status`, which resolves
 * once the call has succeeded. The call object itself is not awaited, because it also waits for
 * headers and trailers, which the test mocks do not provide.
 *
 * @example
 * ```ts
 * export async function getProject(projectId: string): Promise<Project> {
 *     return call(client.getProjectById({ id: projectId }));
 * }
 * ```
 *
 * @param unaryCall - The call returned by a method of the generated client
 * @returns The response message
 */
export async function call<T>(unaryCall: {
    response: Promise<T>;
    status: Promise<unknown>;
}): Promise<T> {
    try {
        const [response] = await Promise.all([unaryCall.response, unaryCall.status]);
        return response;
    } catch (error) {
        throw toApiError(error);
    }
}

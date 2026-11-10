/**
 * What went wrong in a backend call, independent of the transport.
 *
 * Callers branch on the kind instead of on gRPC status codes, so that the same checks keep working
 * once the backend speaks REST.
 */
export type ApiErrorKind =
    | "unauthenticated"
    | "permission-denied"
    | "not-found"
    | "already-exists"
    | "failed-precondition"
    | "invalid-argument"
    | "unavailable"
    // The request was aborted on purpose, e.g. because the user navigated away. Callers usually
    // show no error for it.
    | "cancelled"
    | "unknown";

/** The error every function in `$lib/api/` rejects with. The transport's error is kept as `cause`. */
export class ApiError extends Error {
    readonly kind: ApiErrorKind;

    constructor(kind: ApiErrorKind, message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "ApiError";
        this.kind = kind;
    }
}

/**
 * Checks whether a value is an {@link ApiError}, optionally of a specific kind.
 *
 * @param error - The value to check, typically a caught error
 * @param kind - The kind the error must have. If omitted, any kind matches.
 * @returns True if `error` is an {@link ApiError} of the given kind
 */
export function isApiError(error: unknown, kind?: ApiErrorKind): error is ApiError {
    return error instanceof ApiError && (kind === undefined || error.kind === kind);
}

import { describe, expect, test } from "vitest";
import { Nothing } from "snowballr-api/base";
import { AuthenticationStatus } from "snowballr-api/authentication";
import {
    getAuthenticationStatus,
    login,
    logout,
    register,
    renewSession,
    verifyEmail,
} from "$lib/api/auth";
import { ApiError } from "$lib/api/errors";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getAuthenticationStatus", () => {
    test("When the status is loaded, then it is returned", async () => {
        const getStatusCall = mockApiCall("getAuthenticationStatus", {
            authenticationStatus: AuthenticationStatus.ACCESS_TOKEN_EXPIRED,
        });

        await expect(getAuthenticationStatus()).resolves.toBe(
            AuthenticationStatus.ACCESS_TOKEN_EXPIRED,
        );
        expect(getStatusCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("renewSession", () => {
    test("When the session is renewed, then the renewal is requested", async () => {
        const renewCall = mockApiCall("renewSession", {});

        await expect(renewSession()).resolves.toBeUndefined();
        expect(renewCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("login", () => {
    test("When the user signs in, then the credentials are sent", async () => {
        const loginCall = mockApiCall("login", {});
        const credentials = { email: "jane@example.com", password: "secret" };

        await expect(login(credentials)).resolves.toBeUndefined();
        expect(loginCall).toHaveBeenCalledWith(credentials);
    });

    test("When the credentials are wrong, then it rejects with kind unauthenticated", async () => {
        mockFailedApiCall("login", "wrong password", "UNAUTHENTICATED");

        await expect(login({ email: "jane@example.com", password: "wrong" })).rejects.toMatchObject(
            { kind: "unauthenticated" },
        );
    });
});

describe("logout", () => {
    test("When the user signs out, then the logout is requested", async () => {
        const logoutCall = mockApiCall("logout", {});

        await expect(logout()).resolves.toBeUndefined();
        expect(logoutCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("register", () => {
    const registration = {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "secret",
    };

    test("When a user registers, then the registration is sent", async () => {
        const registerCall = mockApiCall("register", {});

        await expect(register(registration)).resolves.toBeUndefined();
        expect(registerCall).toHaveBeenCalledWith(registration);
    });

    test("When the email address is taken, then it rejects with kind already-exists", async () => {
        mockFailedApiCall("register", "email already in use", "ALREADY_EXISTS");

        await expect(register(registration)).rejects.toMatchObject({ kind: "already-exists" });
    });
});

describe("verifyEmail", () => {
    test("When an email address is verified, then the token is sent", async () => {
        const verifyCall = mockApiCall("verifyEmail", {});

        await expect(verifyEmail("token-1")).resolves.toBeUndefined();
        expect(verifyCall).toHaveBeenCalledWith({ token: "token-1" });
    });

    test.each([
        ["INVALID_ARGUMENT", "invalid-argument"],
        ["NOT_FOUND", "not-found"],
    ] as const)(
        "When the backend fails with %s, then it rejects with kind %s",
        async (code, kind) => {
            mockFailedApiCall("verifyEmail", "verification failed", code);

            await expect(verifyEmail("token-1")).rejects.toMatchObject({ kind });
        },
    );
});

describe("authentication calls", () => {
    test.each([
        ["getAuthenticationStatus", () => getAuthenticationStatus()],
        ["renewSession", () => renewSession()],
        ["logout", () => logout()],
    ] as const)("When %s fails, then it rejects with an ApiError", async (method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});

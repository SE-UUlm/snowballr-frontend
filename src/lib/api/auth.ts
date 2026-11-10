import type {
    AuthenticationStatus,
    LoginRequest,
    RegisterRequest,
} from "snowballr-api/authentication";
import { Nothing } from "snowballr-api/base";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Asks the backend whether the session cookies authenticate the current user.
 *
 * @returns The authentication status of the current session
 */
export async function getAuthenticationStatus(): Promise<AuthenticationStatus> {
    const { authenticationStatus } = await call(client.getAuthenticationStatus(Nothing));
    return authenticationStatus;
}

/** Renews the session after its access token expired. */
export async function renewSession(): Promise<void> {
    await call(client.renewSession(Nothing));
}

/**
 * Signs the user in. The backend sets the session cookies.
 *
 * @param credentials - The email address and password of the user
 */
export async function login(credentials: LoginRequest): Promise<void> {
    await call(client.login(credentials));
}

/** Signs the current user out. The backend clears the session cookies. */
export async function logout(): Promise<void> {
    await call(client.logout(Nothing));
}

/**
 * Registers a new user. The backend then sends a verification email.
 *
 * @param registration - The name, email address and password of the new user
 */
export async function register(registration: RegisterRequest): Promise<void> {
    await call(client.register(registration));
}

/**
 * Verifies the email address of a registered user.
 *
 * @param token - The token from the verification link
 */
export async function verifyEmail(token: string): Promise<void> {
    await call(client.verifyEmail({ token }));
}

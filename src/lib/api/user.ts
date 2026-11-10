import { Nothing } from "snowballr-api/base";
import type { User } from "snowballr-api/user";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads the user that the session belongs to.
 *
 * @returns The current user
 */
export async function getCurrentUser(): Promise<User> {
    return call(client.getCurrentUser(Nothing));
}

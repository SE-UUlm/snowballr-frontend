import { Nothing } from "snowballr-api/base";
import type { FetcherOptions } from "snowballr-api/fetcher";
import { Project_Settings } from "snowballr-api/project";
import { User } from "snowballr-api/user";
import { UserSettings } from "snowballr-api/user_settings";
import { client } from "./client";
import { buildFieldMask } from "./fieldmask";
import { call } from "./grpc";

/**
 * Loads the user that the session belongs to.
 *
 * @returns The current user
 */
export async function getCurrentUser(): Promise<User> {
    return call(client.getCurrentUser(Nothing));
}

/**
 * Loads a user by ID.
 *
 * @param userId - The ID of the user
 * @returns The user
 */
export async function getUserById(userId: string): Promise<User> {
    return call(client.getUserById({ id: userId }));
}

/**
 * Changes the first and last name of a user.
 *
 * @param userId - The ID of the user
 * @param name - The new first and last name
 * @returns The updated user
 */
export async function updateUserName(
    userId: string,
    name: { firstName: string; lastName: string },
): Promise<User> {
    const patch = { id: userId, firstName: name.firstName, lastName: name.lastName };
    return call(
        client.updateUser({
            user: User.create(patch),
            mask: buildFieldMask(patch, "user"),
        }),
    );
}

/**
 * Loads the settings of the current user.
 *
 * @returns The user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
    return call(client.getUserSettings(Nothing));
}

/**
 * Sets the fetchers that new projects of the current user use by default.
 *
 * @param fetchers - The options of each default fetcher, keyed by fetcher ID
 * @returns The updated user settings
 */
export async function setDefaultFetchers(
    fetchers: Record<string, FetcherOptions>,
): Promise<UserSettings> {
    return call(
        client.updateUserSettings({
            userSettings: UserSettings.create({
                defaultProjectSettings: Project_Settings.create({ fetchers }),
            }),
            // buildFieldMask doesn't detect that the fetchers map is set, so the path is written
            // by hand.
            mask: { paths: ["user_settings.default_project_settings.fetchers"] },
        }),
    );
}

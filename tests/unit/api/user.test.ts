import { describe, expect, test } from "vitest";
import { Nothing } from "snowballr-api/base";
import { User } from "snowballr-api/user";
import { UserSettings } from "snowballr-api/user_settings";
import { ApiError } from "$lib/api/errors";
import {
    getCurrentUser,
    getUserById,
    getUserSettings,
    setDefaultFetchers,
    updateUserName,
} from "$lib/api/user";
import { createUser, createUserSettings } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getCurrentUser", () => {
    test("When the current user is loaded, then it is returned", async () => {
        const user = createUser({ id: "1" });
        const getCurrentUserCall = mockApiCall("getCurrentUser", user);

        await expect(getCurrentUser()).resolves.toEqual(user);
        expect(getCurrentUserCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("getUserById", () => {
    test("When a user is loaded, then the user with that ID is requested and returned", async () => {
        const user = createUser({ id: "7" });
        const getUserByIdCall = mockApiCall("getUserById", user);

        await expect(getUserById("7")).resolves.toEqual(user);
        expect(getUserByIdCall).toHaveBeenCalledWith({ id: "7" });
    });
});

describe("updateUserName", () => {
    test("When a user is renamed, then only the first and last name are masked", async () => {
        const renamedUser = createUser({ id: "7", firstName: "Peter", lastName: "Fox" });
        const updateUserCall = mockApiCall("updateUser", renamedUser);

        await expect(updateUserName("7", { firstName: "Peter", lastName: "Fox" })).resolves.toEqual(
            renamedUser,
        );
        expect(updateUserCall).toHaveBeenCalledExactlyOnceWith({
            user: User.create({ id: "7", firstName: "Peter", lastName: "Fox" }),
            mask: { paths: ["user.first_name", "user.last_name"] },
        });
    });
});

describe("getUserSettings", () => {
    test("When the user settings are loaded, then they are returned", async () => {
        const userSettings = createUserSettings();
        const getUserSettingsCall = mockApiCall("getUserSettings", userSettings);

        await expect(getUserSettings()).resolves.toEqual(userSettings);
        expect(getUserSettingsCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("setDefaultFetchers", () => {
    test("When the default fetchers are set, then only the fetchers map is masked", async () => {
        const fetchers = { test: { options: {} } };
        const updatedSettings = UserSettings.create({
            defaultProjectSettings: { fetchers },
        });
        const updateUserSettingsCall = mockApiCall("updateUserSettings", updatedSettings);

        await expect(setDefaultFetchers(fetchers)).resolves.toEqual(updatedSettings);
        expect(updateUserSettingsCall).toHaveBeenCalledExactlyOnceWith({
            userSettings: UserSettings.create({
                defaultProjectSettings: { fetchers },
            }),
            mask: { paths: ["user_settings.default_project_settings.fetchers"] },
        });
    });
});

describe("user calls", () => {
    test.each([
        ["getCurrentUser", () => getCurrentUser()],
        ["getUserById", () => getUserById("7")],
        ["updateUser", () => updateUserName("7", { firstName: "Peter", lastName: "Fox" })],
        ["getUserSettings", () => getUserSettings()],
        ["updateUserSettings", () => setDefaultFetchers({})],
    ] as const)("When %s fails, then it rejects with an ApiError", async (method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});

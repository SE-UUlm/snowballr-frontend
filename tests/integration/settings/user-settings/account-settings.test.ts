import { render, screen } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";
import ChangeNameSettings from "$lib/components/composites/settings/user-settings/ChangeNameSettings.svelte";
import { Users } from "$tests/example-data";
import { backendService } from "$lib/grpc-api";
import userEvent from "@testing-library/user-event";
import type { User } from "$lib/model/api/user";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("ChangeNameSettings", () => {
    test("When the component is rendered, some text, two input fields and a button are shown in order to change the name", () => {
        render(ChangeNameSettings, {
            props: {
                user: Users.johnDoe,
            },
        });

        const changeNameSection = screen.getByTestId("settings-section-change-name");
        expect(changeNameSection).toBeInTheDocument();

        expect(screen.queryByText("Change Name")).toBeInTheDocument();

        expect(screen.getByLabelText("First Name")).toBeInTheDocument();
        expect(screen.getByLabelText("First Name")).toHaveValue("John");
        expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
        expect(screen.getByRole("button", { name: "Rename" })).toBeInTheDocument();
    });

    test("When one of the input fields is empty, then the button should not change the name", async () => {
        const mockCall = vi.spyOn(backendService, "updateUser");

        render(ChangeNameSettings, {
            props: {
                user: Users.johnDoe,
            },
        });

        const firstNameInput = screen.getByLabelText("First Name");
        const lastNameInput = screen.getByLabelText("Last Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });

        await userEvent.clear(firstNameInput);
        await userEvent.type(firstNameInput, " ");
        await userEvent.clear(lastNameInput);
        await userEvent.type(lastNameInput, "Fox");
        await userEvent.click(renameButton);
        expect(mockCall).not.toHaveBeenCalled();

        await userEvent.clear(firstNameInput);
        await userEvent.type(firstNameInput, "Peter");
        await userEvent.clear(lastNameInput);
        await userEvent.type(lastNameInput, " ");
        await userEvent.click(renameButton);
        expect(mockCall).not.toHaveBeenCalled();
    });

    test("When both input fields are filled, then the button should change the name", async () => {
        const mockCall = mockApiCall("updateUser", {
            firstName: "Peter",
            lastName: "Fox",
        } as User);

        render(ChangeNameSettings, {
            props: {
                user: Users.johnDoe,
            },
        });

        const firstNameInput = screen.getByLabelText("First Name");
        const lastNameInput = screen.getByLabelText("Last Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });

        await userEvent.clear(firstNameInput);
        await userEvent.type(firstNameInput, "Peter");
        await userEvent.clear(lastNameInput);
        await userEvent.type(lastNameInput, "Fox");
        await userEvent.click(renameButton);
        expect(mockCall).toHaveBeenCalled();
    });

    test("When a failed API call is made, then an error message should be shown", async () => {
        mockFailedApiCall("updateUser");
        render(ChangeNameSettings, {
            props: {
                user: Users.johnDoe,
            },
        });

        const firstNameInput = screen.getByLabelText("First Name");
        const lastNameInput = screen.getByLabelText("Last Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });

        await userEvent.clear(firstNameInput);
        await userEvent.type(firstNameInput, "Peter");
        await userEvent.clear(lastNameInput);
        await userEvent.type(lastNameInput, "Fox");
        await userEvent.click(renameButton);
        expect(
            screen.getByRole("heading", { name: "Something went wrong while updating user." }),
        ).toBeInTheDocument();
    });
});

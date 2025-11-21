import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Users } from "$tests/example-data";
import { render, screen } from "@testing-library/svelte";
import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
import userEvent from "@testing-library/user-event";
import { getName } from "$lib/utils/common-helper";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("InviteUsersInput", () => {
    beforeEach(() => {
        mockApiCall("getInviteCandidates", {
            users: [Users.johnDoe, Users.janeDoe, Users.henryMoore],
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided, then it should render correctly", () => {
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const label = screen.getByText("Members");
        expect(label).toBeInTheDocument();
    });

    test("When name of the current user is typed, then it is not displayed as suggestion", async () => {
        const user = userEvent.setup();
        const currentUser = Users.johnDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, currentUser.firstName);
        const suggestion = screen.queryByText(currentUser.firstName);
        expect(suggestion).not.toBeInTheDocument();
    });

    test("When name of a user other than the current user is typed, then it is displayed as suggestion", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.firstName);

        const suggestion = await screen.findByText(getName(newUser), { exact: false });
        expect(suggestion).toBeInTheDocument();
    });

    test("When name of a user that is already in the invitee chips list is typed, then it is not displayed as suggestion", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [Users.janeDoe.email],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.firstName);

        const suggestion = screen.queryByText(getName(newUser), { exact: false });
        expect(suggestion).not.toBeInTheDocument();
    });

    test("When valid user is selected from the suggestion list, then it is added to the invitee list", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.firstName);
        const suggestion = await screen.findByText(getName(newUser), { exact: false });
        await user.click(suggestion);

        const chips = screen.getAllByTestId("chip-", { exact: false });
        expect(chips).toHaveLength(1);
        const chip = chips[0];
        expect(chip).toHaveTextContent(getName(newUser));
    });

    test("When valid user email is typed and 'Tab' pressed, then it is added to the invitee list", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.email);
        expect(await screen.findByText("Jane Doe", { exact: false })).toBeInTheDocument();
        await user.tab();

        await user.type(input, "jane2.doe@example.com");
        await user.tab();

        const chips = screen.getAllByTestId("chip-", { exact: false });
        expect(chips).toHaveLength(2);
        expect(chips[0]).toHaveTextContent(getName(newUser));
        expect(chips[1]).toHaveTextContent("jane2.doe@example.com");
    });

    test("When invalid user email is typed and for example 'Tab' pressed, then error message is shown", async () => {
        const user = userEvent.setup();
        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, "invalid-email");
        await user.tab();

        const chips = screen.queryAllByTestId("chip-", { exact: false });
        expect(chips).toHaveLength(0);

        const errorMessage = screen.getByText("Please enter a valid name or email.", {
            exact: false,
        });
        expect(errorMessage).toBeInTheDocument();
    });

    test("When invite candidates loading fails, then error message is shown", async () => {
        mockFailedApiCall("getInviteCandidates");
        const user = userEvent.setup();
        const newUser = Users.janeDoe;

        render(InviteUsersInput, {
            target: document.body,
            props: {
                invitees: [],
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.email);

        expect(
            await screen.findByRole("alert", { name: "Failed to Load Invitee Candidates" }),
        ).toBeInTheDocument();
    });
});

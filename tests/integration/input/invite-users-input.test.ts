import { describe, expect, test } from "vitest";
import { Users } from "$tests/example-data";
import { render, screen } from "@testing-library/svelte";
import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
import userEvent from "@testing-library/user-event";
import { getName } from "$lib/utils/common-helper";

describe("InviteUsersInput", () => {
    const users = [Users.janeDoe, Users.henryMoore];

    test("When all props are provided, then it should render correctly", () => {
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const label = screen.getByText("Members");
        expect(label).toBeInTheDocument();
    });

    test("When input text is passed, then it's inserted into the input component", () => {
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [Users.janeDoe.email],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const userName = screen.getByText(getName(Users.janeDoe));
        expect(userName).toBeInTheDocument();
    });

    test("When name of current user is typed, then it is not displayed as suggestion", async () => {
        const user = userEvent.setup();
        const currentUser = Users.johnDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, currentUser.firstName);
        const suggestion = screen.queryByText(currentUser.firstName);
        expect(suggestion).not.toBeInTheDocument();
    });

    test("When name of user is typed, then it is displayed as suggestion", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.firstName);
        const suggestion = screen.getByText(getName(newUser), { exact: false });
        expect(suggestion).toBeInTheDocument();
    });

    test("When email of user is typed, then it is displayed as first suggestion", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, "e@example.com");

        const allSuggestions = screen.queryAllByTestId("suggestion-", { exact: false });
        expect(allSuggestions).toHaveLength(2);

        const firstSuggestion = allSuggestions[0];
        expect(firstSuggestion).toHaveTextContent(newUser.email);

        const secondSuggestion = allSuggestions[1];
        expect(secondSuggestion).toHaveTextContent(Users.henryMoore.email);
    });

    test("When user is selected from suggestion, then it is added to the list", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.firstName);
        const suggestion = screen.getByText(getName(newUser), { exact: false });
        await user.click(suggestion);

        const chips = screen.getAllByTestId("chip-", { exact: false });
        expect(chips).toHaveLength(1);
        const chip = chips[0];
        expect(chip).toHaveTextContent(getName(newUser));
    });

    test("When valid user email is typed and Tab is pressed, then user is added to the list", async () => {
        const user = userEvent.setup();
        const newUser = Users.janeDoe;
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, newUser.email);
        await user.tab();

        const chips = screen.getAllByTestId("chip-", { exact: false });
        expect(chips).toHaveLength(1);
        const chip = chips[0];
        expect(chip).toHaveTextContent(getName(newUser));
    });

    test("When invalid user email is typed and Tab is pressed, then error message is shown", async () => {
        const user = userEvent.setup();
        render(InviteUsersInput, {
            target: document.body,
            props: {
                membersInput: [],
                initialPossibleMembers: users,
                isErrorOnUsersLoading: false,
            },
        });

        const input = screen.getByRole("textbox");
        await user.type(input, "invalid-email");
        await user.tab();

        const chips = screen.queryAllByTestId("chip-", { exact: false });
        expect(chips).toHaveLength(0);

        const errorMessage = screen.getByText("Please enter a valid name or email.");
        expect(errorMessage).toBeInTheDocument();
    });
});

import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
import { UserRole, UserStatus } from "$lib/model/api/user";
import { ReviewDecision } from "$lib/model/api/review";
import { unmount } from "svelte";

describe("User avatar", () => {
    test("When no props are provided, then user avatar is added as an empty circle", () => {
        render(UserAvatar);

        const userAvatar = screen.getByTestId("user-avatar");
        expect(userAvatar).toBeInTheDocument();
        expect(userAvatar).not.toHaveTextContent("JD");
    });

    test("When a user is provided, then the initials of this user are shown", () => {
        render(UserAvatar, {
            props: {
                user: {
                    id: "1",
                    email: "john@doe.com",
                    firstName: "John",
                    lastName: "Doe",
                    role: UserRole.DEFAULT,
                    status: UserStatus.ACTIVE,
                },
                showUsernameOnHover: false,
            },
        });

        const userAvatar = screen.getByTestId("user-avatar");
        expect(userAvatar).toBeInTheDocument();
        expect(userAvatar).toHaveTextContent("JD");
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    test("When a user and review decision are provided, then the initials and the decision are shown", () => {
        render(UserAvatar, {
            props: {
                user: {
                    id: "1",
                    email: "john@doe.com",
                    firstName: "John",
                    lastName: "Doe",
                    role: UserRole.DEFAULT,
                    status: UserStatus.ACTIVE,
                },
                reviewDecision: ReviewDecision.DECLINED,
                showUsernameOnHover: false,
            },
        });

        const userAvatar = screen.getByTestId("user-avatar");
        expect(userAvatar).toBeInTheDocument();
        expect(userAvatar).toHaveTextContent("JD");
        expect(userAvatar.childElementCount).toBe(2);
        expect(userAvatar.children[1]).toHaveClass("bg-decline-red");
    });

    test(
        "When the username should be shown on hover, then full name of the provided user " +
            "is displayed as tooltip when the avatar is hovered",
        async () => {
            const { component } = render(UserAvatar, {
                props: {
                    user: {
                        id: "1",
                        email: "john@doe.com",
                        firstName: "John",
                        lastName: "Doe",
                        role: UserRole.DEFAULT,
                        status: UserStatus.ACTIVE,
                    },
                    showUsernameOnHover: true,
                },
            });

            const userAvatar = screen.getByTestId("user-avatar");
            expect(userAvatar).toBeInTheDocument();
            expect(userAvatar).toHaveTextContent("JD");

            const tooltip = screen.getByRole("button", { name: "JD" });
            await userEvent.hover(tooltip);
            await waitFor(() => expect(tooltip).toHaveAttribute("data-state", "delayed-open"));
            const fullNameHint = screen.getByText("John Doe");
            expect(fullNameHint).toBeInTheDocument();

            unmount(component);

            render(UserAvatar, {
                props: {
                    showUsernameOnHover: true,
                },
            });

            const userAvatarNoName = screen.getByTestId("user-avatar");
            expect(userAvatarNoName).toBeInTheDocument();
            expect(userAvatarNoName).toHaveTextContent("");

            const tooltip2 = screen.getByRole("button", { name: "" });
            await userEvent.hover(tooltip2);
            await waitFor(() => expect(tooltip2).toHaveAttribute("data-state", "delayed-open"));
            expect(userAvatarNoName.childElementCount).toBe(2);
            expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        },
    );
});

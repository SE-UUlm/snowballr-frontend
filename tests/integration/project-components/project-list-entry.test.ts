import { expect, test, describe } from "vitest";
import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import { Projects, Users } from "../../example-data";
import { MemberRole } from "$lib/model/api/project";

describe("ProjectListEntryComponent", () => {
    test("When all required props are provided, then the project list entry is completely shown.", () => {
        render(ProjectListEntry, {
            props: {
                project: Projects.demoProject,
                membersList: {
                    members: [
                        { user: Users.johnDoe, role: MemberRole.ADMIN },
                        { user: Users.janeDoe, role: MemberRole.DEFAULT },
                    ],
                },
                information: { projectProgress: 0.2 },
            },
        });

        // Project information are shown directly
        expect(screen.getByText("Demo Project")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("Stage 0")).toBeInTheDocument();

        // Project (stage) progress is visualized using a progress bar
        expect(screen.queryByText("20")).not.toBeInTheDocument();
        expect(screen.queryByTestId("stage-progress-bar")).toHaveValue(20);
    });

    test("When no members are provided, then the list entry shows a hint.", () => {
        render(ProjectListEntry, {
            props: {
                project: Projects.demoProject,
                membersList: {
                    members: [],
                },
                information: { projectProgress: 20 },
            },
        });

        expect(screen.getByText("Demo Project")).toBeInTheDocument();
        expect(screen.getByText("no members")).toBeInTheDocument();
        expect(screen.getByText("Stage 0")).toBeInTheDocument();
        expect(screen.queryByText("20")).not.toBeInTheDocument();
    });

    test("When project is archived, then the list entry is opaque.", () => {
        render(ProjectListEntry, {
            props: {
                project: Projects.demoProjectArchived,
                membersList: {
                    members: [],
                },
                information: { projectProgress: 20 },
            },
        });

        expect(screen.getByText("Demo Project (archived)")).toBeInTheDocument();
        expect(screen.getByText("no members")).toBeInTheDocument();
        expect(screen.getByText("Stage 3")).toBeInTheDocument();

        expect(screen.getByRole("link")).toHaveClass("opacity-25");
    });
});

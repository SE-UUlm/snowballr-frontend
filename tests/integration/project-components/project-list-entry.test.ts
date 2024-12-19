import { expect, test, describe } from "vitest";
import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import { createProject, Users } from "../../model-builder";

describe("ProjectListEntryComponent", () => {
    test("When all required props are provided, then the project list entry is completely shown.", () => {
        render(ProjectListEntry, {
            props: {
                project: createProject({
                    name: "Demo Project",
                }),
                members: [Users.johnDoe, Users.janeDoe],
                stage: 1,
                stageProgress: 60,
            },
        });

        // Project information are shown directly
        expect(screen.getByText("Demo Project")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("Stage 1")).toBeInTheDocument();

        // Project (stage) progress is visualized using a progress bar
        expect(screen.queryByText("60")).not.toBeInTheDocument();
        expect(screen.queryByTestId("stage-progress-bar")).toHaveValue(60);
    });

    test("When no members are provided, then the list entry shows a hint.", () => {
        render(ProjectListEntry, {
            props: {
                project: createProject({
                    name: "Demo Project",
                }),
                members: [],
                stage: 1,
                stageProgress: 60,
            },
        });

        expect(screen.getByText("Demo Project")).toBeInTheDocument();
        expect(screen.getByText("no members")).toBeInTheDocument();
        expect(screen.getByText("Stage 1")).toBeInTheDocument();
        expect(screen.queryByText("60")).not.toBeInTheDocument();
    });

    test("When project is archived, then the list entry is opaque.", () => {
        render(ProjectListEntry, {
            props: {
                project: createProject({
                    name: "Demo Project",
                    archived: true,
                }),
                members: [],
                stage: 1,
                stageProgress: 60,
            },
        });

        expect(screen.getByText("Demo Project")).toBeInTheDocument();
        expect(screen.getByText("no members")).toBeInTheDocument();
        expect(screen.getByText("Stage 1")).toBeInTheDocument();

        expect(screen.getByRole("link")).toHaveClass("opacity-25");
    });
});

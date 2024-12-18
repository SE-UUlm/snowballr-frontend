import { expect, test, describe } from "vitest";
import ProjectListEntrySkeleton from "$lib/components/composites/project-components/ProjectListEntrySkeleton.svelte";
import { render, screen } from "@testing-library/svelte";

describe("ProjectListEntrySkeletonComponent", () => {
    test("When project list entry skeleton is rendered, then no data are displayed but only skeletons.", () => {
        render(ProjectListEntrySkeleton);

        // expect skeleton for project name, members and stage, but not progress
        expect(screen.getAllByTestId("skeleton", { exact: false }).length).toBe(3);

        expect(screen.getByTestId("project-stage-progress")).toBeInTheDocument();
        expect(screen.getByTestId("project-stage-progress")).toHaveValue(0);
    });

    test("When project list entry skeleton is rendered, then the project list entry has no behavior.", () => {
        render(ProjectListEntrySkeleton);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});

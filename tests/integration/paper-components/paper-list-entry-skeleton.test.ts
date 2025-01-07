import { expect, test, describe } from "vitest";
import ProjectListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
import { render, screen } from "@testing-library/svelte";

describe("PaperListEntrySkeletonComponent", () => {
    test("When paper list entry skeleton is rendered, then no data are displayed but only skeletons.", () => {
        const { unmount } = render(ProjectListEntrySkeleton);

        // expect skeleton for paper id, paper title, authors
        expect(screen.getAllByTestId("skeleton", { exact: false }).length).toBeGreaterThan(3);
        unmount();

        // enforce rendering with user avatar skeleton
        render(ProjectListEntrySkeleton, { isSkeletonWithReview: true });

        // expect skeleton for paper id, paper title, authors and one user avatar showing a review decision
        expect(screen.getAllByTestId("skeleton", { exact: false }).length).toBe(4);
    });

    test("When paper list entry skeleton is rendered, then the project list entry has no behavior.", () => {
        render(ProjectListEntrySkeleton);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});

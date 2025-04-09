import ProjectMemberListEntrySkeleton from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntrySkeleton.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

describe("ProjectMembersListEntrySkeleton", () => {
    test("When all props are provided, then component is rendered correctly", () => {
        render(ProjectMemberListEntrySkeleton);

        const skeletons = screen.queryAllByTestId("skeleton");
        expect(skeletons).toHaveLength(3);
    });
});

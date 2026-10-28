import { beforeEach, describe, expect, test, vi } from "vitest";
import { invalidate } from "$app/navigation";
import {
    PROJECT_DEPENDENCY_KEY,
    refreshProject,
    takePrimedProject,
} from "$lib/model/project-cache";
import { createProject } from "$tests/model-builder";

vi.mock("$app/navigation", () => ({
    invalidate: vi.fn(() => Promise.resolve()),
}));

describe("project cache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear any project primed by a previous test
        takePrimedProject("");
    });

    test("When no project was primed, then no project is taken", () => {
        expect(takePrimedProject("project-1")).toBeUndefined();
    });

    test("When a project is refreshed, then the project layout is invalidated", async () => {
        await refreshProject(createProject({ id: "project-1" }));

        expect(invalidate).toHaveBeenCalledWith(PROJECT_DEPENDENCY_KEY);
    });

    test("When a project is refreshed, then it is taken by the next load of that project", async () => {
        const project = createProject({ id: "project-1" });

        await refreshProject(project);

        expect(takePrimedProject("project-1")).toBe(project);
    });

    test("When the primed project was taken, then it is not taken a second time", async () => {
        await refreshProject(createProject({ id: "project-1" }));

        takePrimedProject("project-1");

        expect(takePrimedProject("project-1")).toBeUndefined();
    });

    test("When another project is loaded, then the primed project is not taken and discarded", async () => {
        await refreshProject(createProject({ id: "project-1" }));

        expect(takePrimedProject("project-2")).toBeUndefined();
        expect(takePrimedProject("project-1")).toBeUndefined();
    });
});

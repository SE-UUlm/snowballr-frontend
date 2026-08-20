import { beforeEach, describe, expect, test, vi } from "vitest";
import { Project } from "$api/project";
import type { ProjectSettingDescriptor } from "$lib/model/project-setting";
import { projectSetting } from "$lib/model/project-setting.svelte";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { backendService } from "$lib/grpc-api";
import type { Mock } from "vitest";

vi.mock("svelte-sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), promise: vi.fn() },
}));

const similarityThreshold: ProjectSettingDescriptor<number> = {
    read: (project) => project.settings?.similarityThreshold ?? 0.5,
    toPatch: (value) => ({ settings: { similarityThreshold: value } }),
    action: "updating the similarity threshold",
};

const PROJECT_ID = "project-1";

function loadedProject(similarity = 0.6): Promise<Project> {
    return Promise.resolve(
        createProject({ settings: createProjectSettings({ similarityThreshold: similarity }) }),
    );
}

/** Creates a setting state and waits until the initial load has settled. */
async function loadedSetting(options: Partial<Parameters<typeof projectSetting<number>>[1]> = {}) {
    const setting = projectSetting(similarityThreshold, {
        projectId: PROJECT_ID,
        loadingProject: loadedProject(),
        ...options,
    });
    await vi.waitFor(() => expect(setting.loading).toBe(false));
    return setting;
}

describe("projectSetting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Loading", () => {
        test("When the project has not loaded yet, then the descriptor's default is shown and the setting is loading", () => {
            const setting = projectSetting(similarityThreshold, {
                projectId: PROJECT_ID,
                loadingProject: loadedProject(),
            });

            expect(setting.value).toBe(0.5);
            expect(setting.loading).toBe(true);
            expect(setting.disabled).toBe(true);
        });

        test("When the project has loaded, then the stored value is shown", async () => {
            const setting = await loadedSetting();

            expect(setting.value).toBe(0.6);
            expect(setting.disabled).toBe(false);
        });

        test("When the project fails to load, then a load error is surfaced", async () => {
            const setting = projectSetting(similarityThreshold, {
                projectId: PROJECT_ID,
                loadingProject: Promise.reject(new Error("Failed to load project")),
            });

            await vi.waitFor(() => expect(setting.loading).toBe(false));
            expect(setting.error?.errorTitle).toBe("Failed to Load Project Settings");
        });
    });

    describe("Locking", () => {
        test("When the settings section is locked, then the setting is locked and disabled", async () => {
            const setting = await loadedSetting({ settingsLocked: () => true });

            expect(setting.locked).toBe(true);
            expect(setting.disabled).toBe(true);
        });

        test("When the project is archived, then the setting is locked and disabled", async () => {
            const setting = await loadedSetting({ isArchived: () => true });

            expect(setting.locked).toBe(true);
            expect(setting.disabled).toBe(true);
        });

        test("When neither lock applies, then the setting is unlocked", async () => {
            const setting = await loadedSetting({
                settingsLocked: () => false,
                isArchived: () => false,
            });

            expect(setting.locked).toBe(false);
            expect(setting.disabled).toBe(false);
        });
    });

    describe("Committing", () => {
        test("When a value is committed, then updateProject is called with the new value", async () => {
            const updateProject = mockApiCall("updateProject", createProject());
            const setting = await loadedSetting();

            await setting.commit(0.65);

            expect(updateProject).toHaveBeenCalledTimes(1);
            expect(updateProject).toHaveBeenCalledWith(
                expect.objectContaining({
                    mask: { paths: ["project.settings.similarity_threshold"] },
                }),
            );
            expect(setting.value).toBe(0.65);
        });

        test("When the update fails, then an error is surfaced and the value reverts", async () => {
            mockFailedApiCall("updateProject");
            const setting = await loadedSetting();

            await setting.commit(0.65);

            expect(setting.error?.errorTitle).toBe("Failed to Update Project Settings");
            expect(setting.value).toBe(0.6);
            expect(setting.loading).toBe(false);
        });

        test("When the committed value equals the stored value, then no update is sent", async () => {
            const updateProject = mockApiCall("updateProject", createProject());
            const setting = await loadedSetting();

            await setting.commit(0.6);

            expect(updateProject).not.toHaveBeenCalled();
        });

        test("When a commit follows a failed one, then the stale error is cleared", async () => {
            mockFailedApiCall("updateProject");
            const setting = await loadedSetting();
            await setting.commit(0.65);
            expect(setting.error).toBeDefined();

            mockApiCall("updateProject", createProject());
            await setting.commit(0.7);

            expect(setting.error).toBeUndefined();
            expect(setting.value).toBe(0.7);
        });

        test("When a commit arrives while another is in flight, then it is dropped", async () => {
            let resolveUpdate: (project: Project) => void = () => {};
            (backendService.updateProject as unknown as Mock)
                .mockClear()
                .mockImplementation(() => ({
                    response: new Promise<Project>((resolve) => {
                        resolveUpdate = resolve;
                    }),
                }));
            const setting = await loadedSetting();

            const firstCommit = setting.commit(0.65);
            await setting.commit(0.7);

            expect(backendService.updateProject).toHaveBeenCalledTimes(1);

            resolveUpdate(createProject());
            await firstCommit;
            expect(setting.value).toBe(0.65);
        });

        test("When a commit arrives while the project is still loading, then it is dropped", async () => {
            const updateProject = mockApiCall("updateProject", createProject());
            const setting = projectSetting(similarityThreshold, {
                projectId: PROJECT_ID,
                loadingProject: loadedProject(),
            });

            await setting.commit(0.65);

            expect(updateProject).not.toHaveBeenCalled();
        });
    });
});

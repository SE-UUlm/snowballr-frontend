import { beforeEach, describe, expect, test, vi } from "vitest";
import { Project, SnowballingType } from "$api/project";
import {
    buildProjectSettingUpdate,
    commitProjectSetting,
    loadProjectSetting,
    PROJECT_SETTING_SUCCESS_MESSAGE,
    type ProjectSettingDescriptor,
} from "$lib/model/project-setting";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { toast } from "svelte-sonner";
import { similarityThresholdSetting } from "$lib/components/composites/settings/project-settings/slr/SimilarityThresholdSetting.svelte";
import { numberOfReviewersSetting } from "$lib/components/composites/settings/project-settings/review/NumberOfReviewersSettings.svelte";
import { snowballingTypeSetting } from "$lib/components/composites/settings/project-settings/slr/SnowballingTypeSettings.svelte";
import { maybeAsDecisionSetting } from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";

vi.mock("svelte-sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), promise: vi.fn() },
}));

/** A setting stored directly on the project settings. */
const similarityThreshold: ProjectSettingDescriptor<number> = {
    read: (project) => project.settings?.similarityThreshold ?? 0.5,
    toPatch: (value) => ({ settings: { similarityThreshold: value } }),
    action: "updating the similarity threshold",
};

/** A setting stored one level deeper, inside the decision matrix. */
const numberOfReviewers: ProjectSettingDescriptor<number> = {
    read: (project) => project.settings?.decisionMatrix?.numberOfReviewers ?? 2,
    toPatch: (value) => ({ settings: { decisionMatrix: { numberOfReviewers: value } } }),
    action: "updating the number of required reviewers",
};

const PROJECT_ID = "project-1";

describe("buildProjectSettingUpdate", () => {
    test("When a setting is updated, then the mask names only that field", () => {
        const { mask } = buildProjectSettingUpdate(similarityThreshold, 0.65, PROJECT_ID);

        expect(mask.paths).toEqual(["project.settings.similarity_threshold"]);
    });

    test("When a nested setting is updated, then the nested path is converted to snake_case", () => {
        const { mask } = buildProjectSettingUpdate(numberOfReviewers, 3, PROJECT_ID);

        expect(mask.paths).toEqual(["project.settings.decision_matrix.number_of_reviewers"]);
    });

    test("When a setting is updated, then the mask does not name any sibling setting", () => {
        const { mask } = buildProjectSettingUpdate(similarityThreshold, 0.65, PROJECT_ID);

        expect(mask.paths).not.toContain("project.settings.review_maybe_allowed");
        expect(mask.paths).not.toContain("project.settings.snowballing_type");
        expect(mask.paths).not.toContain("project.settings.fetchers");
        expect(mask.paths).toHaveLength(1);
    });

    test("When a setting is updated, then the project id is sent but not part of the mask", () => {
        const { project, mask } = buildProjectSettingUpdate(similarityThreshold, 0.65, PROJECT_ID);

        expect(project.id).toBe(PROJECT_ID);
        expect(mask.paths).not.toContain("project.id");
    });

    test("When a setting is updated, then the value is carried into the project message", () => {
        const { project } = buildProjectSettingUpdate(similarityThreshold, 0.65, PROJECT_ID);

        expect(project.settings?.similarityThreshold).toBe(0.65);
    });

    test("When a nested setting is updated, then the value is carried into the nested message", () => {
        const { project } = buildProjectSettingUpdate(numberOfReviewers, 3, PROJECT_ID);

        expect(project.settings?.decisionMatrix?.numberOfReviewers).toBe(3);
    });
});

describe("loadProjectSetting", () => {
    test("When the project resolves, then the setting is read from it", async () => {
        const project = createProject({
            settings: createProjectSettings({ similarityThreshold: 0.6 }),
        });

        const result = await loadProjectSetting(similarityThreshold, Promise.resolve(project));

        expect(result).toEqual({ loaded: true, value: 0.6 });
    });

    test("When the project has no settings, then the descriptor's default is used", async () => {
        const result = await loadProjectSetting(
            similarityThreshold,
            Promise.resolve(Project.create()),
        );

        expect(result).toEqual({ loaded: true, value: 0.5 });
    });

    test("When the project fails to load, then a load error is returned", async () => {
        const result = await loadProjectSetting(
            similarityThreshold,
            Promise.reject(new Error("Failed to load project")),
        );

        expect(result).toEqual({
            loaded: false,
            error: expect.objectContaining({ errorTitle: "Failed to Load Project Settings" }),
        });
    });
});

describe("commitProjectSetting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("When a setting is committed, then updateProject is called with the value and the mask", async () => {
        const updateProject = mockApiCall("updateProject", createProject());

        await commitProjectSetting(similarityThreshold, 0.65, PROJECT_ID);

        expect(updateProject).toHaveBeenCalledTimes(1);
        expect(updateProject).toHaveBeenCalledWith(
            expect.objectContaining({
                mask: { paths: ["project.settings.similarity_threshold"] },
            }),
        );
    });

    test("When a setting is committed successfully, then no error is returned", async () => {
        mockApiCall("updateProject", createProject());

        const error = await commitProjectSetting(similarityThreshold, 0.65, PROJECT_ID);

        expect(error).toBeUndefined();
    });

    test("When a setting is committed successfully, then a success toast is shown", async () => {
        mockApiCall("updateProject", createProject());

        await commitProjectSetting(similarityThreshold, 0.65, PROJECT_ID);

        expect(toast.success).toHaveBeenCalledWith(PROJECT_SETTING_SUCCESS_MESSAGE);
    });

    test("When the descriptor overrides the success message, then that message is shown", async () => {
        mockApiCall("updateProject", createProject());

        await commitProjectSetting(
            { ...similarityThreshold, successMessage: "Threshold saved." },
            0.65,
            PROJECT_ID,
        );

        expect(toast.success).toHaveBeenCalledWith("Threshold saved.");
    });

    test("When the success toast is disabled, then no toast is shown", async () => {
        mockApiCall("updateProject", createProject());

        await commitProjectSetting(similarityThreshold, 0.65, PROJECT_ID, { toastSuccess: false });

        expect(toast.success).not.toHaveBeenCalled();
    });

    test("When the update fails, then an action error naming the action is returned", async () => {
        mockFailedApiCall("updateProject");

        const error = await commitProjectSetting(similarityThreshold, 0.65, PROJECT_ID);

        expect(error?.errorTitle).toBe("Failed to Update Project Settings");
        expect(error?.errorDetails).toContain("updating the similarity threshold");
    });

    test("When the update fails, then no success toast is shown", async () => {
        mockFailedApiCall("updateProject");

        await commitProjectSetting(similarityThreshold, 0.65, PROJECT_ID);

        expect(toast.success).not.toHaveBeenCalled();
    });

    test("When an enum setting is committed, then it is sent as its numeric value", async () => {
        const updateProject = mockApiCall("updateProject", createProject());
        const snowballingType: ProjectSettingDescriptor<SnowballingType> = {
            read: (project) => project.settings?.snowballingType ?? SnowballingType.UNSPECIFIED,
            toPatch: (value) => ({ settings: { snowballingType: value } }),
            action: "updating the Snowballing Type",
        };

        await commitProjectSetting(snowballingType, SnowballingType.FORWARD, PROJECT_ID);

        expect(updateProject).toHaveBeenCalledWith(
            expect.objectContaining({
                mask: { paths: ["project.settings.snowballing_type"] },
            }),
        );
    });
});

describe("Descriptors", () => {
    // The descriptors above are fixtures that mirror the real ones. These tests use the descriptors
    // the settings sections actually ship, and pin for each of them: which mask path it sends, that
    // `read` and `toPatch` agree on the same field (by reading the value back out of the message
    // that would go on the wire), and what it falls back to when the project defines nothing.

    test("When the similarity threshold is committed, then it targets similarity_threshold", () => {
        const { project, mask } = buildProjectSettingUpdate(
            similarityThresholdSetting,
            0.8,
            PROJECT_ID,
        );

        expect(mask.paths).toEqual(["project.settings.similarity_threshold"]);
        expect(similarityThresholdSetting.read(project)).toBe(0.8);
    });

    test("When a project defines no similarity threshold, then it falls back to 0.5", () => {
        expect(similarityThresholdSetting.read(Project.create())).toBe(0.5);
    });

    test("When the number of reviewers is committed, then it targets number_of_reviewers", () => {
        const { project, mask } = buildProjectSettingUpdate(
            numberOfReviewersSetting,
            4,
            PROJECT_ID,
        );

        expect(mask.paths).toEqual(["project.settings.decision_matrix.number_of_reviewers"]);
        expect(numberOfReviewersSetting.read(project)).toBe(4);
    });

    test("When a project defines no number of reviewers, then it falls back to 2", () => {
        expect(numberOfReviewersSetting.read(Project.create())).toBe(2);
    });

    test("When the snowballing type is committed, then it targets snowballing_type", () => {
        const { project, mask } = buildProjectSettingUpdate(
            snowballingTypeSetting,
            String(SnowballingType.FORWARD),
            PROJECT_ID,
        );

        expect(mask.paths).toEqual(["project.settings.snowballing_type"]);
        expect(snowballingTypeSetting.read(project)).toBe(String(SnowballingType.FORWARD));
    });

    test("When a project defines no snowballing type, then it falls back to unspecified", () => {
        expect(snowballingTypeSetting.read(Project.create())).toBe(
            String(SnowballingType.UNSPECIFIED),
        );
    });

    test("When maybe as decision is committed, then it targets review_maybe_allowed", () => {
        const { project, mask } = buildProjectSettingUpdate(
            maybeAsDecisionSetting,
            true,
            PROJECT_ID,
        );

        expect(mask.paths).toEqual(["project.settings.review_maybe_allowed"]);
        expect(maybeAsDecisionSetting.read(project)).toBe(true);
    });

    test("When a project defines no maybe as decision, then it falls back to false", () => {
        expect(maybeAsDecisionSetting.read(Project.create())).toBe(false);
    });
});

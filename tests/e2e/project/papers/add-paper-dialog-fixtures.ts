import { test as base } from "../../utils/fixtures/isolated-fixture";
import { expect } from "@playwright/test";
import { Project, SnowballingType, type Project_Settings } from "$api/project";
import type { Paper } from "$api/paper";
import { createPaper } from "$tests/model-builder";
import { AddPaperDialogModel } from "./add-paper-dialog-model";

/**
 * Search query used by the add paper dialog tests.
 *
 * It appears in none of the mock backend's example papers, so the only local candidates are the
 * ones created below and the fetcher results are fully determined by the query.
 */
export const SEARCH_QUERY = "Snowballology";

/** Titles of the papers that are put into the local database but not into the project. */
export const LOCAL_CANDIDATE_TITLES = [
    `${SEARCH_QUERY} in the Small`,
    `${SEARCH_QUERY} in the Large`,
];

type AddPaperDialogFixtures = {
    addPaperDialog: AddPaperDialogModel;
    projectId: string;
};

/**
 * Provides a project whose stage 0 is open and ready for the "Search & Add" dialog.
 *
 * The project has exactly one fetcher configured, so the dialog offers the fetcher source, and the
 * mock backend generates one set of fetcher-only papers rather than one per available fetcher. A
 * couple of papers matching {@link SEARCH_QUERY} exist in the local database but are deliberately
 * *not* part of the project, which is what makes them local candidates.
 */
export const test = base.extend<AddPaperDialogFixtures>({
    projectId: async ({ apiClient, page }, use) => {
        let projectId = "";
        try {
            const project: Project = await apiClient.createProject({ name: "Intake Project" })
                .response;
            projectId = project.id;

            // Exactly one fetcher is configured, so the backend generates one set of fetcher-only
            // papers rather than one per available fetcher. Which one it is does not matter, so it
            // is taken from the backend instead of being hard-coded.
            const { fetchers } = await apiClient.getAvailableFetchers({}).response;
            expect(fetchers.length).toBeGreaterThan(0);

            const settings: Project_Settings = {
                reviewMaybeAllowed: false,
                similarityThreshold: 0.5,
                fetchers: { [fetchers[0].id]: { options: {} } },
                snowballingType: SnowballingType.BOTH,
            };
            await apiClient.updateProject({
                project: Project.create({ id: projectId, settings }),
                // The fetchers are a map whose keys are fetcher ids, and those contain spaces, so
                // the mask names the map as a whole rather than being derived from its entries.
                mask: { paths: ["project.settings.fetchers"] },
            }).response;

            const localCandidates: Paper[] = await Promise.all(
                LOCAL_CANDIDATE_TITLES.map(
                    (title) => apiClient.createPaper(createPaper({ title })).response,
                ),
            );
            expect(localCandidates).toHaveLength(LOCAL_CANDIDATE_TITLES.length);

            await page.goto(`project/${projectId}/papers`);
            // Wait for the papers page itself before any test touches the stage accordion.
            await expect(page.getByRole("button", { name: "Filter", exact: false })).toBeVisible();

            await use(projectId);
        } finally {
            if (projectId !== "") await apiClient.softDeleteProject({ id: projectId });
        }
    },

    addPaperDialog: async ({ page, projectId }, use) => {
        expect(projectId).not.toBe("");

        const addPaperDialog = new AddPaperDialogModel(page);
        await addPaperDialog.openStage();

        await use(addPaperDialog);
    },
});

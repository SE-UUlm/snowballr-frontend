import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import SimilarityThresholdSetting from "$lib/components/composites/settings/project-settings/slr/SimilarityThresholdSetting.svelte";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { mockIsProjectArchivedContext } from "$tests/integration/test-helper";

describe("SimilarityThresholdSetting", () => {
    const projectData = createProject();

    beforeEach(() => {
        projectData.settings = createProjectSettings({ similarityThreshold: 0.6 });

        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided and the settings are not locked, then the component renders correctly with title, description, and slider", async () => {
        render(SimilarityThresholdSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitFor(() => expect(screen.getByRole("slider")).toBeEnabled());
        const slider = screen.getByRole("slider");

        expect(screen.getByText("Similarity Threshold")).toBeInTheDocument();
        expect(
            screen.getByText(/Set the similarity threshold used to consider two papers as equal/),
        ).toBeInTheDocument();
        expect(slider).toBeInTheDocument();
    });

    test("When the project has similarityThreshold set, then the slider reflects that value", async () => {
        render(SimilarityThresholdSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitFor(() => {
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("aria-valuenow", "0.6");
            expect(slider).toHaveAttribute("data-value", "0.6");
        });
    });

    test("When the project has no similarityThreshold set, then the slider defaults to 0.5", async () => {
        const projectWithoutThreshold = createProject({
            settings: createProjectSettings(),
        });

        render(SimilarityThresholdSetting, {
            target: document.body,
            props: {
                projectId: projectWithoutThreshold.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectWithoutThreshold),
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitFor(() => {
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("aria-valuenow", "0.5");
            expect(slider).toHaveAttribute("data-value", "0.5");
        });
    });

    test("When slrSettingsLocked is true, then the slider is disabled", async () => {
        render(SimilarityThresholdSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: true,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitFor(() => {
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("aria-disabled", "true");
            expect(slider).toHaveAttribute("data-disabled", "");
        });
    });

    test("When the project is archived, then the slider is disabled", async () => {
        render(SimilarityThresholdSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(true),
        });

        await waitFor(() => {
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("aria-disabled", "true");
            expect(slider).toHaveAttribute("data-disabled", "");
        });
    });

    // test("When the slider value is committed, then updateProject is called with the new value", async () => {
    //     const user = userEvent.setup();
    //     const mockUpdateCall = mockApiCall("updateProject", projectData);

    //     render(SimilarityThresholdSetting, {
    //         target: document.body,
    //         props: {
    //             projectId: projectData.id,
    //             slrSettingsLocked: false,
    //             loadingProject: Promise.resolve(projectData),
    //         },
    //         context: mockIsProjectArchivedContext(),
    //     });

    //     const slider = screen.getByRole("slider");
    //     await waitFor(() => expect(slider).toBeEnabled());

    //     await user.click(slider);
    //     await user.keyboard("{ArrowRight}");

    //     await waitFor(() => {
    //         const slider = screen.getByRole("slider");
    //         expect(slider).toHaveAttribute("aria-valuenow", "0.65");
    //         expect(slider).toHaveAttribute("data-value", "0.65");
    //     });

    //     await waitFor(() => expect(mockUpdateCall).toHaveBeenCalledTimes(1));
    //     await waitFor(() => expect(slider).toBeEnabled());
    // });

    // test("When the API call fails, then an error is displayed and the value reverts", async () => {
    //     const user = userEvent.setup();
    //     mockFailedApiCall("updateProject");

    //     render(SimilarityThresholdSetting, {
    //         target: document.body,
    //         props: {
    //             projectId: projectData.id,
    //             slrSettingsLocked: false,
    //             loadingProject: Promise.resolve(projectData),
    //         },
    //         context: mockIsProjectArchivedContext(),
    //     });

    //     const slider = screen.getByRole("slider");
    //     await waitFor(() => expect(slider).toBeEnabled());

    //     await user.click(slider);
    //     await user.keyboard("{ArrowRight}");

    //     await waitFor(() => {
    //         expect(
    //             screen.getByRole("alert", { name: "Failed to Update Project Settings" }),
    //         ).toBeInTheDocument();
    //     });
    //     await waitFor(() => expect(slider).toBeEnabled());
    //     expect(slider).toHaveAttribute("aria-valuenow", "0.6");
    // });

    test("When loadingProject rejects, then a load error is displayed", async () => {
        render(SimilarityThresholdSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.reject(new Error("Failed to load project")),
            },
            context: mockIsProjectArchivedContext(),
        });

        const alert = await screen.findByRole("alert", { name: "Failed to Load Project Settings" });
        expect(alert).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while loading the project settings. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();
    });
});

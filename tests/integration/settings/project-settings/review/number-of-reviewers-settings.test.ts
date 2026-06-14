import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import NumberOfReviewersSettings from "$lib/components/composites/settings/project-settings/review/NumberOfReviewersSettings.svelte";
import { ReviewDecisionMatrix } from "$api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { mockIsProjectArchivedContext } from "$tests/integration/test-helper";

describe("NumberOfReviewersSettings", () => {
    const projectData = createProject();

    beforeEach(() => {
        projectData.settings = createProjectSettings({
            decisionMatrix: ReviewDecisionMatrix.create({ numberOfReviewers: 3 }),
        });

        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided and the settings are not locked, then the component renders correctly with title, description, and slider", async () => {
        render(NumberOfReviewersSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                settingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const slider = screen.getByRole("slider");
        await waitFor(() => expect(slider).toBeEnabled());

        expect(screen.getByText("Number of Required Reviewers")).toBeInTheDocument();
        expect(
            screen.getByText(/Set the number of required reviewers per paper/),
        ).toBeInTheDocument();
        expect(slider).toBeInTheDocument();
    });

    test("When the project has numberOfReviewers set, then the slider reflects that value", async () => {
        render(NumberOfReviewersSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                settingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitFor(() => {
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("aria-valuenow", "3");
            expect(slider).toHaveAttribute("data-value", "3");
        });
    });

    test("When the project has no numberOfReviewers set, then the slider defaults to 2", async () => {
        const projectWithoutReviewers = createProject({
            settings: createProjectSettings(),
        });

        render(NumberOfReviewersSettings, {
            target: document.body,
            props: {
                projectId: projectWithoutReviewers.id,
                settingsLocked: false,
                loadingProject: Promise.resolve(projectWithoutReviewers),
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitFor(() => {
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("aria-valuenow", "2");
            expect(slider).toHaveAttribute("data-value", "2");
        });
    });

    test("When settingsLocked is true, then the slider is disabled", async () => {
        render(NumberOfReviewersSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                settingsLocked: true,
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
        render(NumberOfReviewersSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                settingsLocked: false,
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

    //     render(NumberOfReviewersSettings, {
    //         target: document.body,
    //         props: {
    //             projectId: projectData.id,
    //             settingsLocked: false,
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
    //         expect(slider).toHaveAttribute("aria-valuenow", "4");
    //         expect(slider).toHaveAttribute("data-value", "4");
    //     });

    //     await waitFor(() => expect(mockUpdateCall).toHaveBeenCalledTimes(1));
    //     await waitFor(() => expect(slider).toBeEnabled());
    // });

    // test("When the API call fails, then an error is displayed and the value reverts", async () => {
    //     const user = userEvent.setup();
    //     mockFailedApiCall("updateProject");

    //     render(NumberOfReviewersSettings, {
    //         target: document.body,
    //         props: {
    //             projectId: projectData.id,
    //             settingsLocked: false,
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
    //     expect(slider).toHaveAttribute("aria-valuenow", "3");
    // });

    test("When loadingProject rejects, then a load error is displayed", async () => {
        render(NumberOfReviewersSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                settingsLocked: false,
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

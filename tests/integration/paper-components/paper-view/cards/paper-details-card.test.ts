import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { loading, createPaper, createProjectPaper } from "../../../../model-builder";
import { mockIsProjectArchivedContext, waitForComponentLoading } from "../../../test-helper";
import userEvent from "@testing-library/user-event";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { type ISnowballRClient } from "$lib/model/api/main.client";

describe("PaperDetailsCard", () => {
    test("When props are provided, then component is shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: false,
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitForComponentLoading();

        const card = screen.getByTestId("paper-details-card");
        expect(card).toBeInTheDocument();

        const toggleEditModeButtons = screen.queryAllByTestId("toggle-edit-paper-mode-btn");
        expect(toggleEditModeButtons).toHaveLength(1);

        const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(0);

        // paper details are in read-only mode
        const toggleableInputs = screen.queryAllByTestId("toggleable-input", { exact: false });
        expect(toggleableInputs).toHaveLength(4);
        for (const input of toggleableInputs) {
            expect(input).toBeInTheDocument();
            expect(input.tagName).toBe("DIV");
        }
        const toggleableTextareas = screen.queryAllByTestId("toggleable-textarea", {
            exact: false,
        });
        expect(toggleableTextareas).toHaveLength(1);
        expect(toggleableTextareas[0]).toBeInTheDocument();

        // additional details are not shown by default
        const showMoreButton = screen.queryByTestId("toggle-additional-infos-btn");
        expect(showMoreButton).toBeInTheDocument();
    });

    test("When show more information button is pressed, then additional details are shown", async () => {
        const user = userEvent.setup();
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: false,
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitForComponentLoading();

        const showMoreButton = screen.queryByTestId("toggle-additional-infos-btn");
        expect(showMoreButton).not.toBeNull();
        expect(showMoreButton).toBeInTheDocument();

        await user.click(showMoreButton!);

        await waitFor(() => {
            const paperDetails = screen.queryAllByTestId("paper-detail");
            expect(paperDetails).toHaveLength(7);
        });

        expect(showMoreButton).toHaveTextContent("Show less information");

        await user.click(showMoreButton!);

        await waitFor(() => {
            const paperDetails = screen.queryAllByTestId("paper-detail");
            expect(paperDetails).toHaveLength(4);
        });

        expect(showMoreButton).toHaveTextContent("Show more information");
    });

    test("When edit mode is toggled, then paper details are in edit mode", async () => {
        const user = userEvent.setup();
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: false,
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitForComponentLoading();

        const toggleEditModeButtons = screen.queryAllByTestId("toggle-edit-paper-mode-btn");
        expect(toggleEditModeButtons).toHaveLength(1);

        let savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(0);

        await user.click(toggleEditModeButtons[0]);

        await waitFor(() => {
            const toggleableInputs = screen.queryAllByTestId("toggleable-input", { exact: false });
            expect(toggleableInputs).toHaveLength(4);
            for (const input of toggleableInputs) {
                expect(input).toBeInTheDocument();
                expect(input.tagName).toBe("INPUT");
            }
            const toggleableTextareas = screen.queryAllByTestId("toggleable-textarea", {
                exact: false,
            });
            expect(toggleableTextareas).toHaveLength(1);
            expect(toggleableTextareas[0]).toBeInTheDocument();
        });

        savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(1);

        await user.click(toggleEditModeButtons[0]);

        await waitFor(() => {
            const toggleableInputs = screen.queryAllByTestId("toggleable-input", { exact: false });
            expect(toggleableInputs).toHaveLength(4);
            for (const input of toggleableInputs) {
                expect(input).toBeInTheDocument();
                expect(input.tagName).toBe("DIV");
            }
            const toggleableTextareas = screen.queryAllByTestId("toggleable-textarea", {
                exact: false,
            });
            expect(toggleableTextareas).toHaveLength(1);
            expect(toggleableTextareas[0]).toBeInTheDocument();
        });

        savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(0);
    });

    test("When editMode is not allowed, then edit buttons are not shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: false,
                loadingPaper: loading(paper),
                allowEditModeToggle: false,
                startInEditMode: false,
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitForComponentLoading();

        const toggleEditModeButtons = screen.queryAllByTestId("toggle-edit-paper-mode-btn");
        expect(toggleEditModeButtons).toHaveLength(0);

        const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(0);
    });

    test("When paper is loading, then skeletons are shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: false,
                loadingPaper: loading(paper, 1000),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
            context: mockIsProjectArchivedContext(),
        });

        const skeletons = screen.queryAllByTestId("skeleton");
        expect(skeletons).toHaveLength(11);
    });

    describe.each([
        { isInCreationMode: false, apiMethod: "updatePaper" as keyof ISnowballRClient },
        { isInCreationMode: true, apiMethod: "createPaper" as keyof ISnowballRClient },
    ])("Save paper changes using $apiMethod API call", ({ isInCreationMode, apiMethod }) => {
        Object.defineProperty(window, "location", {
            value: {
                ...window.location,
                pathname: isInCreationMode ? "/project/1/paper/new" : "/project/1/paper/2",
            },
        });

        test("When paper is changed, then the API call is invoked", async () => {
            const user = userEvent.setup();
            const paper = createPaper();
            const mockCall = mockApiCall(apiMethod, paper);
            const mockSecondCall = mockApiCall("addPaperToProject", createProjectPaper());

            render(PaperDetailsCard, {
                target: document.body,
                props: {
                    isInCreationMode,
                    loadingPaper: loading(paper),
                    allowEditModeToggle: true,
                    startInEditMode: true,
                },
                context: mockIsProjectArchivedContext(),
            });

            await waitForComponentLoading();

            const titleInput = screen.getByTestId("toggleable-input-title");
            expect(titleInput).toBeInTheDocument();
            await user.type(titleInput, " - Changed");

            const abstractInput = screen.getByTestId("toggleable-textarea-abstract");
            expect(abstractInput).toBeInTheDocument();
            await user.type(abstractInput, " - Changed");

            const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
            expect(savePaperChangesButtons).toHaveLength(1);

            await user.click(savePaperChangesButtons[0]);

            expect(mockCall).toHaveBeenCalledTimes(1);
            if (isInCreationMode) {
                expect(mockSecondCall).toHaveBeenCalledTimes(1);
            }
        });

        test("When save paper changes button is clicked without changes present, then the API call isn't invoked", async () => {
            const user = userEvent.setup();
            const paper = createPaper();
            const mockCall = mockApiCall(apiMethod, paper);
            const mockSecondCall = mockApiCall("addPaperToProject", createProjectPaper());

            render(PaperDetailsCard, {
                target: document.body,
                props: {
                    isInCreationMode,
                    loadingPaper: loading(paper),
                    allowEditModeToggle: true,
                    startInEditMode: true,
                },
                context: mockIsProjectArchivedContext(),
            });

            await waitForComponentLoading();

            const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
            expect(savePaperChangesButtons).toHaveLength(1);

            await user.click(savePaperChangesButtons[0]);

            expect(mockCall).toHaveBeenCalledTimes(0);
            if (isInCreationMode) {
                expect(mockSecondCall).toHaveBeenCalledTimes(0);
            }
        });

        test("When the paper is changed with an invalid year value, then the API call isn't invoked", async () => {
            const user = userEvent.setup();
            const paper = createPaper();
            const mockCall = mockApiCall(apiMethod, paper);
            const mockSecondCall = mockApiCall("addPaperToProject", createProjectPaper());

            render(PaperDetailsCard, {
                target: document.body,
                props: {
                    isInCreationMode,
                    loadingPaper: loading(paper),
                    allowEditModeToggle: true,
                    startInEditMode: true,
                },
                context: mockIsProjectArchivedContext(),
            });

            await waitForComponentLoading();

            const yearInput = screen.getByTestId("toggleable-input-year");
            expect(yearInput).toBeInTheDocument();

            await user.type(yearInput, "foobar123");

            const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
            expect(savePaperChangesButtons).toHaveLength(1);

            await user.click(savePaperChangesButtons[0]);

            expect(mockCall).toHaveBeenCalledTimes(0);
            if (isInCreationMode) {
                expect(mockSecondCall).toHaveBeenCalledTimes(0);
            }
        });

        test("When the API method call fails, then the save button is not disabled", async () => {
            const user = userEvent.setup();
            const paper = createPaper();
            const mockCall = mockFailedApiCall(apiMethod);

            render(PaperDetailsCard, {
                target: document.body,
                props: {
                    isInCreationMode,
                    loadingPaper: loading(paper),
                    allowEditModeToggle: true,
                    startInEditMode: true,
                },
                context: mockIsProjectArchivedContext(),
            });

            await waitForComponentLoading();

            const titleInput = screen.getByTestId("toggleable-input-title");
            expect(titleInput).toBeInTheDocument();
            await user.type(titleInput, " - Changed");

            const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
            expect(savePaperChangesButtons).toHaveLength(1);

            await user.click(savePaperChangesButtons[0]);

            expect(mockCall).toHaveBeenCalledTimes(1);

            await waitFor(() => {
                expect(savePaperChangesButtons[0]).not.toBeDisabled();
            });
        });
    });

    test("When the addPaperToProject API call fails in creation mode, then the save button is not disabled", async () => {
        const user = userEvent.setup();
        const paper = createPaper();
        const mockCall = mockApiCall("createPaper", paper);
        const mockSecondCall = mockFailedApiCall("addPaperToProject");

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: true,
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: true,
            },
            context: mockIsProjectArchivedContext(),
        });

        await waitForComponentLoading();

        const titleInput = screen.getByTestId("toggleable-input-title");
        expect(titleInput).toBeInTheDocument();
        await user.type(titleInput, " - Changed");

        const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(1);

        await user.click(savePaperChangesButtons[0]);

        expect(mockCall).toHaveBeenCalledTimes(1);
        expect(mockSecondCall).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(savePaperChangesButtons[0]).not.toBeDisabled();
        });
    });

    test("When the component is in creation mode, then the edit button is not shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: true,
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: true,
            },
            context: mockIsProjectArchivedContext(),
        });

        expect(screen.queryByTestId("toggle-edit-paper-mode-btn")).toBeNull();
    });

    test("When the project of the project paper is archived, then the edit button is not shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                isInCreationMode: false,
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
            context: mockIsProjectArchivedContext(true),
        });

        await waitForComponentLoading();

        const toggleEditModeButtons = screen.queryByTestId("toggle-edit-paper-mode-btn");
        expect(toggleEditModeButtons).not.toBeInTheDocument();
    });
});

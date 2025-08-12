import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { loading, createPaper } from "../../../../model-builder";
import { waitForComponentLoading } from "../../../test-helper";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";

describe("PaperDetailsCard", () => {
    test("When props are provided, then component is shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
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
        expect(toggleableInputs).toHaveLength(5);
        for (const input of toggleableInputs) {
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("readonly");
        }

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
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
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
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const toggleEditModeButtons = screen.queryAllByTestId("toggle-edit-paper-mode-btn");
        expect(toggleEditModeButtons).toHaveLength(1);

        let savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(0);

        await user.click(toggleEditModeButtons[0]);

        await waitFor(() => {
            const toggleableInputs = screen.queryAllByTestId("toggleable-input", { exact: false });
            expect(toggleableInputs).toHaveLength(5);
            for (const input of toggleableInputs) {
                expect(input).toBeInTheDocument();
                expect(input).not.toHaveAttribute("readonly");
            }
        });

        savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(1);

        await user.click(toggleEditModeButtons[0]);

        await waitFor(() => {
            const toggleableInputs = screen.queryAllByTestId("toggleable-input", { exact: false });
            expect(toggleableInputs).toHaveLength(5);
            for (const input of toggleableInputs) {
                expect(input).toBeInTheDocument();
                expect(input).toHaveAttribute("readonly");
            }
        });

        savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(0);
    });

    test("When editMode is not allowed, then edit buttons are not shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                allowEditModeToggle: false,
                startInEditMode: false,
            },
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
                loadingPaper: loading(paper, 1000),
                allowEditModeToggle: true,
                startInEditMode: false,
            },
        });

        const skeletons = screen.queryAllByTestId("skeleton");
        expect(skeletons).toHaveLength(11);
    });

    test("When paper is updated, then the API call is invoked", async () => {
        const user = userEvent.setup();
        const paper = createPaper();
        const mockCall = mockApiCall("updatePaper", paper);

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const titleInput = screen.getByTestId("toggleable-input-title");
        expect(titleInput).toBeInTheDocument();
        await user.type(titleInput, " - Updated");

        const abstractInput = screen.getByTestId("toggleable-input-abstract");
        expect(abstractInput).toBeInTheDocument();
        await user.type(abstractInput, " - Updated");

        const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(1);

        await user.click(savePaperChangesButtons[0]);

        expect(mockCall).toHaveBeenCalledTimes(1);
    });

    test("When save paper changes button is clicked without changes present, then the API call isn't invoked", async () => {
        const user = userEvent.setup();
        const paper = createPaper();
        const mockCall = mockApiCall("updatePaper", paper);

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(1);

        await user.click(savePaperChangesButtons[0]);

        expect(mockCall).toHaveBeenCalledTimes(0);
    });

    test("When the paper is updated with an invalid year value, then the API call isn't invoked", async () => {
        const user = userEvent.setup();
        const paper = createPaper();
        const mockCall = mockApiCall("updatePaper", paper);

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                allowEditModeToggle: true,
                startInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const yearInput = screen.getByTestId("toggleable-input-year");
        expect(yearInput).toBeInTheDocument();

        await user.type(yearInput, "foobar123");

        const savePaperChangesButtons = screen.queryAllByTestId("save-paper-changes-btn");
        expect(savePaperChangesButtons).toHaveLength(1);

        await user.click(savePaperChangesButtons[0]);

        expect(mockCall).toHaveBeenCalledTimes(0);
    });
});

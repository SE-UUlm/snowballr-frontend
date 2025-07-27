import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { loading, createPaper } from "../../../../model-builder";
import { waitForComponentLoading } from "../../../test-helper";
import userEvent from "@testing-library/user-event";

describe("PaperDetailsCard", () => {
    test("When props are provided, then component is shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: paper,
                allowEditModeToggle: true,
                startInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const card = screen.getByTestId("paper-details-card");
        expect(card).toBeInTheDocument();

        // edit mode can be toggled
        const editButtons = document.getElementsByTagName("svg");
        let editButtonCount = 0;
        for (const editButton of editButtons) {
            if (!editButton.classList.contains("lucide-pencil")) {
                continue;
            }

            expect(editButton).toBeInTheDocument();
            editButtonCount++;
        }
        expect(editButtonCount).toBe(1);

        // paper details are in read-only mode
        const toggleableInputs = screen.queryAllByTestId("toggleable-input");
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
                paper: paper,
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
                paper: paper,
                allowEditModeToggle: true,
                startInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const svgs = document.getElementsByTagName("svg");
        const editButtons: SVGSVGElement[] = [];
        for (const svg of svgs) {
            if (svg.classList.contains("lucide-pencil")) {
                editButtons.push(svg);
            }
        }
        expect(editButtons.length).toBe(1);

        const [editButton] = editButtons;

        await user.click(editButton);

        await waitFor(() => {
            const toggleableInputs = screen.queryAllByTestId("toggleable-input");
            expect(toggleableInputs).toHaveLength(5);
            for (const input of toggleableInputs) {
                expect(input).toBeInTheDocument();
                expect(input).not.toHaveAttribute("readonly");
            }
        });

        await user.click(editButton);

        await waitFor(() => {
            const toggleableInputs = screen.queryAllByTestId("toggleable-input");
            expect(toggleableInputs).toHaveLength(5);
            for (const input of toggleableInputs) {
                expect(input).toBeInTheDocument();
                expect(input).toHaveAttribute("readonly");
            }
        });
    });

    test("When editMode is not allowed, then edit buttons are not shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: paper,
                allowEditModeToggle: false,
                startInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const editButtons = document.getElementsByTagName("svg");
        let editButtonCount = 0;
        for (const editButton of editButtons) {
            if (!editButton.classList.contains("lucide-pencil")) {
                continue;
            }

            expect(editButton).toBeInTheDocument();
            editButtonCount++;
        }
        expect(editButtonCount).toBe(0);
    });

    test("When paper is loading, then skeletons are shown", async () => {
        const paper = createPaper();

        render(PaperDetailsCard, {
            target: document.body,
            props: {
                loadingPaper: loading(paper, 1000),
                paper: paper,
                allowEditModeToggle: true,
                startInEditMode: false,
            },
        });

        const skeletons = screen.queryAllByTestId("skeleton");
        expect(skeletons).toHaveLength(11);
    });
});

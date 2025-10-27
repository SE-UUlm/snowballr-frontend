import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import ButtonBar from "$lib/components/composites/paper-components/paper-view/ButtonBar.svelte";
import {
    createProject,
    createProjectPaper,
    createProjectSettings,
    loading,
    createButtonBarProps,
} from "$tests/model-builder";
import { mockUserContext } from "$tests/integration/test-helper";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";

describe("ButtonBar", () => {
    test("When the user is not in the review mode, then no decision buttons are shown", async () => {
        reviewMode.isActivated = false;

        render(ButtonBar, {
            target: document.body,
            props: createButtonBarProps(),
        });

        const navigationButtons = screen.getAllByTestId("navigation-button");
        expect(navigationButtons).toHaveLength(2);

        const decisionButtons = screen.queryAllByTestId("decision-button", { exact: false });
        expect(decisionButtons).toHaveLength(0);
    });

    test("When the user is in the review mode, then the decision buttons are shown", async () => {
        reviewMode.isActivated = true;

        const project = createProject({
            settings: createProjectSettings({
                reviewMaybeAllowed: true,
            }),
        });

        render(ButtonBar, {
            target: document.body,
            props: createButtonBarProps({
                loadingProjectPaper: loading(createProjectPaper()),
                loadingProject: loading(project),
            }),
            context: mockUserContext,
        });

        const decisionButtons = await screen.findAllByTestId("decision-button", { exact: false });
        expect(decisionButtons).toHaveLength(3);
        expect(decisionButtons[0]).toHaveTextContent("Decline");
        expect(decisionButtons[1]).toHaveTextContent("Maybe");
        expect(decisionButtons[2]).toHaveTextContent("Accept");

        const navigationButtons = screen.queryAllByTestId("navigation-button");
        expect(navigationButtons).toHaveLength(2);
    });

    test("When the maybe decision is not allowed, then the maybe button is not shown", async () => {
        reviewMode.isActivated = true;

        const project = createProject({
            settings: createProjectSettings({
                reviewMaybeAllowed: false,
            }),
        });

        render(ButtonBar, {
            target: document.body,
            props: createButtonBarProps({
                loadingProjectPaper: loading(createProjectPaper()),
                loadingProject: loading(project),
            }),
            context: mockUserContext,
        });

        const decisionButtons = await screen.findAllByTestId("decision-button", { exact: false });
        expect(decisionButtons).toHaveLength(2);
        expect(decisionButtons[0]).toHaveTextContent("Decline");
        expect(decisionButtons[1]).toHaveTextContent("Accept");
    });
});

import { render, screen } from "@testing-library/svelte";
import { assert, describe, expect, test } from "vitest";
import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";

describe("PaperView", () => {
    test("When `showButtonBar` is false, then button bar isn't shown", () => {
        render(PaperView, {
            user: {
                firstName: "John",
                lastName: "Doe",
            },
            paper: {
                id: 1,
                title: "Paper Title",
                authors: ["Alice", "Bob"],
                isBookmarked: false,
            },
            showButtonBar: false,
            backRef: "",
            userConfig: {
                isReviewMode: false,
                showMaybeButton: false,
            },
        });

        assert.throws(() => screen.getByTestId("button-bar"));
    });

    test("When `showButtonBar` is true, then navigation buttons are shown", () => {
        render(PaperView, {
            user: {
                firstName: "John",
                lastName: "Doe",
            },
            paper: {
                id: 1,
                title: "Paper Title",
                authors: ["Alice", "Bob"],
                isBookmarked: false,
            },
            showButtonBar: true,
            backRef: "",
            userConfig: {
                isReviewMode: false,
                showMaybeButton: false,
            },
        });

        const navButtons = screen.getAllByTestId("navigation-button");
        expect(navButtons).toHaveLength(2);
    });

    test("When navigation buttons are shown and `isReviewMode` is true, then the decision buttons are shown", () => {
        render(PaperView, {
            user: {
                firstName: "John",
                lastName: "Doe",
            },
            paper: {
                id: 1,
                title: "Paper Title",
                authors: ["Alice", "Bob"],
                isBookmarked: false,
            },
            showButtonBar: true,
            backRef: "",
            userConfig: {
                isReviewMode: true,
                showMaybeButton: true,
            },
        });

        const decisionButtons = screen.getAllByTestId("decision-button");
        expect(decisionButtons).toHaveLength(3);
        expect(decisionButtons[0]).toHaveTextContent("Decline");
        expect(decisionButtons[1]).toHaveTextContent("Maybe");
        expect(decisionButtons[2]).toHaveTextContent("Accept");
    });

    test("When navigation and decision buttons are shown but `showMaybeButton` is false, then only the accept and decline buttons are shown", () => {
        render(PaperView, {
            user: {
                firstName: "John",
                lastName: "Doe",
            },
            paper: {
                id: 1,
                title: "Paper Title",
                authors: ["Alice", "Bob"],
                isBookmarked: false,
            },
            showButtonBar: true,
            backRef: "",
            userConfig: {
                isReviewMode: true,
                showMaybeButton: false,
            },
        });

        const decisionButtons = screen.getAllByTestId("decision-button");
        expect(decisionButtons).toHaveLength(2);
        expect(document.body).not.toHaveTextContent("Maybe");
    });
});

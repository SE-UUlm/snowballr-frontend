import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
import { createNonProjectPaperViewProps, createPaperViewProps } from "$tests/model-builder";
import { mockUserContext } from "$tests/integration/test-helper";

describe("PaperView", () => {
    test("When non-project paper view is shown, then review information tab is not shown", () => {
        render(PaperView, {
            props: createPaperViewProps({}, createNonProjectPaperViewProps()),
            context: mockUserContext,
        });

        const reviewInfoTab = screen.queryByText("Review Information");
        expect(reviewInfoTab).toBeNull();
    });

    test("When the paper view is opened in the creation mode, then the paper bookmark button is not shown", () => {
        render(PaperView, {
            props: createPaperViewProps({ isInCreationMode: true }),
            context: mockUserContext,
        });

        const bookmarkButton = screen.queryByTestId("paper-bookmark-btn");
        expect(bookmarkButton).toBeNull();
    });
});

import PaperDetail from "$lib/components/composites/paper-components/paper-view/PaperDetail.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { loading, createStringifiedPaper, createPaper } from "../../../model-builder";
import { waitForComponentLoading } from "../../test-helper";
import { stringifyPaper } from "$lib/utils/model-helper";

describe("PaperDetail", () => {
    test("When props are provided, then component is shown", async () => {
        const paper = createPaper({ title: "Example Title" });
        const stringifiedPaper = stringifyPaper(paper);

        render(PaperDetail, {
            target: document.body,
            props: {
                prop: {
                    key: "title",
                    label: "Title",
                },
                loadingPaper: loading(paper),
                paper: stringifiedPaper,
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const span = screen.getByTestId("details-label");
        expect(span.textContent).toEqual("Title");

        const textareas = screen.getAllByTestId("toggleable-input-title");
        expect(textareas).toHaveLength(1);
        const input = textareas[0];
        expect(input.textContent).toEqual("Example Title");
    });

    test("When paper is loading, then skeleton is shown", () => {
        const paper = createPaper();
        const stringifiedPaper = stringifyPaper(paper);

        render(PaperDetail, {
            target: document.body,
            props: {
                prop: {
                    key: "title",
                    label: "Title",
                },
                loadingPaper: loading(paper, 1000),
                paper: stringifiedPaper,
                isInEditMode: false,
            },
        });

        const span = screen.getByTestId("details-label");
        expect(span.textContent).toEqual("Title");
        expect(screen.queryByTestId("skeleton")).not.toBeNull();
    });

    test("When paper loading failed, then error text is shown", async () => {
        render(PaperDetail, {
            target: document.body,
            props: {
                prop: {
                    key: "title",
                    label: "Title",
                },
                loadingPaper: Promise.reject(),
                paper: createStringifiedPaper(),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const span = screen.getByTestId("details-label");
        expect(span.textContent).toEqual("Title");

        const errorSpan = screen.getByTestId("error-indicator-label");
        expect(errorSpan.textContent).toEqual("Couldn't load Title");
    });
});

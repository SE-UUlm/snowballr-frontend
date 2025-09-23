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

        const spans = document.getElementsByTagName("span");
        expect(spans).toHaveLength(1);
        const keySpan = spans[0];
        expect(keySpan.textContent).toEqual("Title");

        const textareas = document.getElementsByTagName("textarea");
        expect(textareas).toHaveLength(1);
        const input = textareas[0];
        expect(input.value).toEqual("Example Title");
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

        const spans = document.getElementsByTagName("span");
        expect(spans.length).toEqual(1);
        const keySpan = spans[0];

        expect(keySpan.textContent).toEqual("Title");
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

        const spans = document.getElementsByTagName("span");
        expect(spans).toHaveLength(2);
        const [keySpan, valueSpan] = spans;

        expect(keySpan.textContent).toEqual("Title");
        expect(valueSpan.textContent).toEqual("Couldn't load Title");
    });
});

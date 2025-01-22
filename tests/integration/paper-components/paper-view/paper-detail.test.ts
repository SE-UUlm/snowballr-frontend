import PaperDetail from "$lib/components/composites/paper-components/paper-view/PaperDetail.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { createPaper } from "../../../model-builder";
import type { Paper } from "$lib/model/backend";
import { waitForComponentLoading } from "../../test-helper";

describe("PaperDetail", () => {
    test("When props are provided, then component is shown", async () => {
        render(PaperDetail, {
            target: document.body,
            props: {
                key: "Title",
                value: "Example Title",
                loadingPaper: Promise.resolve(createPaper()),
                areDetailsInEditMode: false,
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
        render(PaperDetail, {
            target: document.body,
            props: {
                key: "Title",
                value: "Example Title",
                loadingPaper: new Promise<Paper>((resolve) => {
                    setTimeout(() => {
                        resolve(createPaper());
                    }, 1000);
                }),
                areDetailsInEditMode: false,
            },
        });

        const spans = document.getElementsByTagName("span");
        expect(spans.length).toEqual(1);
        const keySpan = spans[0];

        expect(keySpan.textContent).toEqual("Title");
        expect(screen.queryByTestId("skeleton")).not.toBeNull();
    });

    test("When paper loading failed without error, then error text is shown", async () => {
        render(PaperDetail, {
            target: document.body,
            props: {
                key: "Title",
                value: "Example Title",
                loadingPaper: Promise.reject(),
                areDetailsInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const spans = document.getElementsByTagName("span");
        expect(spans).toHaveLength(2);
        const keySpan = spans[0];
        const valueSpan = spans[1];

        expect(keySpan.textContent).toEqual("Title");
        expect(valueSpan.textContent).toEqual("Couldn't load Title");
    });

    test("When paper loading failed with error, then error text is shown", async () => {
        render(PaperDetail, {
            target: document.body,
            props: {
                key: "Title",
                value: "Example Title",
                loadingPaper: Promise.reject(new Error("Network Error")),
                areDetailsInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const spans = document.getElementsByTagName("span");
        expect(spans).toHaveLength(2);
        const keySpan = spans[0];
        const valueSpan = spans[1];

        expect(keySpan.textContent).toEqual("Title");
        expect(valueSpan.textContent).toEqual("Couldn't load Title: Error: Network Error");
    });
});

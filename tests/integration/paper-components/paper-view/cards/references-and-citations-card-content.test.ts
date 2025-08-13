import ReferencesCardContent from "$lib/components/composites/paper-components/paper-view/cards/ReferencesCardContent.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { Papers } from "$tests/example-data";
import { waitForComponentLoading } from "$tests/integration/test-helper";
import userEvent from "@testing-library/user-event";

describe("ReferencesAndCitationsCardContent", () => {
    test("When props are provided, then component is shown", async () => {
        render(ReferencesCardContent, {
            target: document.body,
            props: {
                loadingReferencedPapers: Promise.resolve([Papers.demoPaper1]),
                title: "References",
            },
        });

        await waitForComponentLoading();

        const referencesTitle = screen.getByText("References", { exact: false });
        expect(referencesTitle).toBeInTheDocument();

        const paper1 = screen.getByText(Papers.demoPaper1.title, { exact: false });
        expect(paper1).toBeInTheDocument();

        const searchBars = screen.getAllByTestId("search-bar-input");
        expect(searchBars).toHaveLength(1);
    });

    test("When references are searched, then only matching reference papers are shown", async () => {
        const user = userEvent.setup();
        render(ReferencesCardContent, {
            target: document.body,
            props: {
                loadingReferencedPapers: Promise.resolve([Papers.demoPaper1, Papers.demoPaper2]),
                title: "References",
            },
        });

        expect(Papers.demoPaper1.title).not.toEqual(Papers.demoPaper2.title);

        await waitForComponentLoading();

        await user.type(screen.getAllByTestId("search-bar-input")[0], Papers.demoPaper1.title);

        const paper1 = screen.getByText(Papers.demoPaper1.title, { exact: false });
        expect(paper1).toBeInTheDocument();
        const paper2 = screen.queryByText(Papers.demoPaper2.title, { exact: false });
        expect(paper2).not.toBeInTheDocument();
    });

    test("When references are empty, then hint is shown", async () => {
        render(ReferencesCardContent, {
            target: document.body,
            props: {
                loadingReferencedPapers: Promise.resolve([]),
                title: "References",
            },
        });

        await waitForComponentLoading();

        const referencesHint = screen.getByText("No references exist or have been added.");
        expect(referencesHint).toBeInTheDocument();
    });

    test("When loading references failed, then an error hint is shown", async () => {
        render(ReferencesCardContent, {
            target: document.body,
            props: {
                loadingReferencedPapers: Promise.reject(new Error("Failed to load references")),
                title: "References",
            },
        });

        await waitForComponentLoading();

        const referencesHint = screen.getByText("Couldn't load references.");
        expect(referencesHint).toBeInTheDocument();
    });
});

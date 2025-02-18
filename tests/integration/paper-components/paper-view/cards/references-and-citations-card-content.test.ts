import ReferencesAndCitationsCardContent from "$lib/components/composites/paper-components/paper-view/cards/ReferencesAndCitationsCardContent.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { Papers } from "../../../../example-data";
import { waitForComponentLoading } from "../../../test-helper";
import userEvent from "@testing-library/user-event";

describe("ReferencesAndCitationsCardContent", () => {
    test("When props are provided, then component is shown", async () => {
        render(ReferencesAndCitationsCardContent, {
            target: document.body,
            props: {
                backwardReferencedPapers: Promise.resolve([Papers.demoPaper1]),
                forwardReferencedPapers: Promise.resolve([Papers.demoPaper2]),
            },
        });

        await waitForComponentLoading();

        const referencesTitle = screen.getByText("References", { exact: false });
        expect(referencesTitle).toBeInTheDocument();
        const citationsTitle = screen.getByText("Citations", { exact: false });
        expect(citationsTitle).toBeInTheDocument();

        const paper1 = screen.getByText(Papers.demoPaper1.title, { exact: false });
        expect(paper1).toBeInTheDocument();
        const paper2 = screen.getByText(Papers.demoPaper2.title, { exact: false });
        expect(paper2).toBeInTheDocument();

        const searchBars = screen.getAllByTestId("search-bar-input");
        expect(searchBars).toHaveLength(2);
    });

    test("When references are searched, then only matching reference papers are shown", async () => {
        const user = userEvent.setup();
        render(ReferencesAndCitationsCardContent, {
            target: document.body,
            props: {
                backwardReferencedPapers: Promise.resolve([Papers.demoPaper1, Papers.demoPaper2]),
                forwardReferencedPapers: Promise.resolve([]),
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

    test("When citations are searched, then only matching citation papers are shown", async () => {
        const user = userEvent.setup();
        render(ReferencesAndCitationsCardContent, {
            target: document.body,
            props: {
                backwardReferencedPapers: Promise.resolve([]),
                forwardReferencedPapers: Promise.resolve([Papers.demoPaper1, Papers.demoPaper2]),
            },
        });

        expect(Papers.demoPaper1.title).not.toEqual(Papers.demoPaper2.title);

        await waitForComponentLoading();

        await user.type(screen.getAllByTestId("search-bar-input")[1], Papers.demoPaper1.title);

        const paper1 = screen.getByText(Papers.demoPaper1.title, { exact: false });
        expect(paper1).toBeInTheDocument();
        const paper2 = screen.queryByText(Papers.demoPaper2.title, { exact: false });
        expect(paper2).not.toBeInTheDocument();
    });

    test("When references and citations are empty, then hint is shown", async () => {
        render(ReferencesAndCitationsCardContent, {
            target: document.body,
            props: {
                backwardReferencedPapers: Promise.resolve([]),
                forwardReferencedPapers: Promise.resolve([]),
            },
        });

        await waitForComponentLoading();

        const referencesHint = screen.getByText("No references found.");
        expect(referencesHint).toBeInTheDocument();
        const citationsHint = screen.getByText("No citations found.");
        expect(citationsHint).toBeInTheDocument();
    });

    test("When loading references and citations failed, then an error hint is shown", async () => {
        render(ReferencesAndCitationsCardContent, {
            target: document.body,
            props: {
                backwardReferencedPapers: Promise.reject("error"),
                forwardReferencedPapers: Promise.reject("error"),
            },
        });

        await waitForComponentLoading();

        const referencesHint = screen.getByText("Couldn't load references.");
        expect(referencesHint).toBeInTheDocument();
        const citationsHint = screen.getByText("Couldn't load citations.");
        expect(citationsHint).toBeInTheDocument();
    });
});

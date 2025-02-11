import CriteriaList from "$lib/components/composites/criteria/CriteriaList.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { createReviewedCriterion, loading } from "../../model-builder";
import { waitForComponentLoading } from "../test-helper";

describe("CriteriaList", () => {
    test("When props are provided, then component is shown", async () => {
        render(CriteriaList, {
            target: document.body,
            props: {
                listTitle: "Hard Exclusion",
                inReviewMode: true,
                reviewers: loading([]),
                criteria: loading([createReviewedCriterion({ name: "Criterion 1" })]),
                emptyHint: "",
            },
        });

        await waitForComponentLoading();

        const title = screen.getByText("Hard Exclusion");
        expect(title).toBeInTheDocument();

        const criterion = screen.getByText("Criterion 1");
        expect(criterion).toBeInTheDocument();
    });

    test("When no criteria are provided, then empty hint is shown", async () => {
        render(CriteriaList, {
            target: document.body,
            props: {
                listTitle: "Hard Exclusion",
                inReviewMode: true,
                reviewers: loading([]),
                criteria: loading([]),
                emptyHint: "No criteria found",
            },
        });

        await waitForComponentLoading();

        const hint = screen.getByText("No criteria found");
        expect(hint).toBeInTheDocument();
    });

    test("When criteria failed to load, then error message is shown", async () => {
        render(CriteriaList, {
            target: document.body,
            props: {
                listTitle: "Hard Exclusion",
                inReviewMode: true,
                reviewers: loading([]),
                criteria: Promise.reject(),
                emptyHint: "",
            },
        });

        await waitForComponentLoading();

        const error = screen.getByText("Couldn't load Criteria");
        expect(error).toBeInTheDocument();
    });

    test("When criteria are loading, then skeletons are shown", () => {
        render(CriteriaList, {
            target: document.body,
            props: {
                listTitle: "Hard Exclusion",
                inReviewMode: true,
                reviewers: loading([]),
                criteria: loading([]),
                emptyHint: "",
            },
        });

        const skeletons = screen.getAllByTestId("skeleton");
        expect(skeletons.length).toBeGreaterThan(0);
    });
});

import CriterionListEntry from "$lib/components/composites/criteria/CriterionListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { createReviewedCriterion } from "../../model-builder";
import { Reviews, Users } from "../../example-data";

describe("CriterionListEntry", () => {
    test("When props are provided, then component is shown", () => {
        render(CriterionListEntry, {
            target: document.body,
            props: {
                inReviewMode: true,
                reviewers: [],
                criterion: createReviewedCriterion({
                    tag: "C1",
                    name: "Example Criterion",
                }),
            },
        });

        const tag = screen.getByText("C1");
        const name = screen.getByText("Example Criterion");

        expect(tag).toBeInTheDocument();
        expect(name).toBeInTheDocument();
    });

    test("When `isReviewMode` is true, then the checkbox is shown", () => {
        render(CriterionListEntry, {
            target: document.body,
            props: {
                inReviewMode: true,
                reviewers: [],
                criterion: createReviewedCriterion(),
            },
        });

        const checkbox = screen.getByTestId("criterion-checkbox");
        expect(checkbox).toBeInTheDocument();

        const userAvatar = screen.queryByTestId("user-avatar");
        expect(userAvatar).not.toBeInTheDocument();
    });

    test("When `isReviewMode` is false, then the reviews are shown", () => {
        render(CriterionListEntry, {
            target: document.body,
            props: {
                inReviewMode: false,
                reviewers: [Users.johnDoe],
                criterion: createReviewedCriterion({
                    reviews: [Reviews.demoReview1],
                }),
            },
        });

        const checkbox = screen.queryByTestId("criterion-checkbox");
        expect(checkbox).not.toBeInTheDocument();

        const userAvatar = screen.getByTestId("user-avatar");
        expect(userAvatar).toBeInTheDocument();
        const userInitials = screen.getByText("JD");
        expect(userInitials).toBeInTheDocument();

        const reviewDecision = document.querySelector(".review-decision-icon-bg");
        expect(reviewDecision).toHaveClass("bg-decline-red");
    });
});

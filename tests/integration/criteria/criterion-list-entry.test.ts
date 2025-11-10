import CriterionListEntry from "$lib/components/composites/criteria/CriterionListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { createReviewedCriterion } from "../../model-builder";
import { Criteria, Reviews, Users } from "../../example-data";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import { SELECTED_REVIEW_CRITERIA_KEY } from "$lib/custom-context/selected-review-criteria-context";
import userEvent from "@testing-library/user-event";
import { mockSelectedCriteriaContext } from "$tests/integration/test-helper";

describe("CriterionListEntry", () => {
    test("When props are provided, then the component is shown", () => {
        reviewMode.isActivated = true;

        render(CriterionListEntry, {
            target: document.body,
            context: mockSelectedCriteriaContext,
            props: {
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

    test("When `reviewMode.isActivated` is true, then the checkbox is but no user avatars are shown", () => {
        reviewMode.isActivated = true;

        render(CriterionListEntry, {
            target: document.body,
            context: mockSelectedCriteriaContext,
            props: {
                reviewers: [Users.johnDoe],
                criterion: createReviewedCriterion({
                    reviews: [Reviews.demoReview1],
                }),
            },
        });

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeInTheDocument();

        const userAvatar = screen.queryByTestId("user-avatar");
        expect(userAvatar).not.toBeInTheDocument();
    });

    test("When `reviewMode.isActivated` is false, then the reviews are shown", () => {
        reviewMode.isActivated = false;

        render(CriterionListEntry, {
            target: document.body,
            context: mockSelectedCriteriaContext,
            props: {
                reviewers: [Users.johnDoe],
                criterion: createReviewedCriterion({
                    reviews: [Reviews.demoReview1],
                }),
            },
        });

        const checkbox = screen.queryByRole("checkbox");
        expect(checkbox).not.toBeInTheDocument();

        const userAvatar = screen.getByTestId("user-avatar");
        expect(userAvatar).toBeInTheDocument();
        const userInitials = screen.getByText("JD");
        expect(userInitials).toBeInTheDocument();

        const reviewDecision = document.querySelector(".review-decision-icon-bg-small");
        expect(reviewDecision).toHaveClass("bg-decline-red");
    });

    test("When the user is in review mode and toggles the checkbox, then the selected criteria is added or deleted to / from a context", async () => {
        reviewMode.isActivated = true;
        const context = mockSelectedCriteriaContext;

        render(CriterionListEntry, {
            target: document.body,
            context: context,
            props: {
                reviewers: [Users.johnDoe],
                criterion: createReviewedCriterion({
                    reviews: [Reviews.demoReview1],
                }),
            },
        });

        expect(context.get(SELECTED_REVIEW_CRITERIA_KEY)!.criteria!.length).toBe(0);

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeInTheDocument();

        await userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(context.get(SELECTED_REVIEW_CRITERIA_KEY)!.criteria).toContain(
            Criteria.demoCriterion1.id,
        );
        expect(context.get(SELECTED_REVIEW_CRITERIA_KEY)!.criteria!.length).toBe(1);

        await userEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(context.get(SELECTED_REVIEW_CRITERIA_KEY)!.criteria!.length).toBe(0);
    });
});

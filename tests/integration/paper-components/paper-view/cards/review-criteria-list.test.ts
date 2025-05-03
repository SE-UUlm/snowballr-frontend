import ReviewCriteriaList from "$lib/components/composites/paper-components/paper-view/cards/ReviewCriteriaList.svelte";
import { render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, test } from "vitest";
import { createReviewedCriterion, loading } from "../../../../model-builder";
import { CriterionCategory } from "$lib/model/api/criterion";
import { waitForComponentLoading } from "../../../test-helper";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import { SELECTED_REVIEW_CRITERIA_KEY } from "$lib/utils/custom-context";

describe("ReviewCriteriaList", () => {
    beforeEach(() => {
        reviewMode.isActivated = true;
    });

    test("When props are provided, then component is shown", () => {
        render(ReviewCriteriaList, {
            target: document.body,
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: [] }]]),
            props: {
                reviewers: loading([]),
                criteriaWithReviews: loading([]),
            },
        });

        const hardExclusions = screen.getByText("Hard Exclusion");
        expect(hardExclusions).toBeInTheDocument();
        const softExclusions = screen.getByText("Soft Exclusion");
        expect(softExclusions).toBeInTheDocument();
        const inclusions = screen.getByText("Inclusion");
        expect(inclusions).toBeInTheDocument();
    });

    test("When criterion is hard exclusion, then it is shown as hard exclusion", async () => {
        render(ReviewCriteriaList, {
            target: document.body,
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: [] }]]),
            props: {
                reviewers: loading([]),
                criteriaWithReviews: loading([
                    createReviewedCriterion({
                        name: "Criterion 1",
                        category: CriterionCategory.HARD_EXCLUSION,
                    }),
                ]),
            },
        });

        await waitForComponentLoading();

        const criteria = screen.getAllByTestId("criterion-list-entry");
        expect(criteria).toHaveLength(1);

        const hardExclusions = screen.getByText("Hard Exclusion");
        expect(hardExclusions).toBeInTheDocument();
        const hardExclusionCriteria = hardExclusions.parentElement?.getElementsByTagName("li");
        expect(hardExclusionCriteria).toHaveLength(1);

        const softExclusions = screen.getByText("Soft Exclusion");
        expect(softExclusions).toBeInTheDocument();
        const softExclusionCriteria = softExclusions.parentElement?.getElementsByTagName("li");
        expect(softExclusionCriteria).toHaveLength(0);

        const inclusions = screen.getByText("Inclusion");
        expect(inclusions).toBeInTheDocument();
        const inclusionCriteria = inclusions.parentElement?.getElementsByTagName("li");
        expect(inclusionCriteria).toHaveLength(0);
    });

    test("When criterion is soft exclusion, then it is shown as soft exclusion", async () => {
        render(ReviewCriteriaList, {
            target: document.body,
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: [] }]]),
            props: {
                reviewers: loading([]),
                criteriaWithReviews: loading([
                    createReviewedCriterion({
                        name: "Criterion 1",
                        category: CriterionCategory.EXCLUSION,
                    }),
                ]),
            },
        });

        await waitForComponentLoading();

        const criteria = screen.getAllByTestId("criterion-list-entry");
        expect(criteria).toHaveLength(1);

        const hardExclusions = screen.getByText("Hard Exclusion");
        expect(hardExclusions).toBeInTheDocument();
        const hardExclusionCriteria = hardExclusions.parentElement?.getElementsByTagName("li");
        expect(hardExclusionCriteria).toHaveLength(0);

        const softExclusions = screen.getByText("Soft Exclusion");
        expect(softExclusions).toBeInTheDocument();
        const softExclusionCriteria = softExclusions.parentElement?.getElementsByTagName("li");
        expect(softExclusionCriteria).toHaveLength(1);

        const inclusions = screen.getByText("Inclusion");
        expect(inclusions).toBeInTheDocument();
        const inclusionCriteria = inclusions.parentElement?.getElementsByTagName("li");
        expect(inclusionCriteria).toHaveLength(0);
    });

    test("When criterion is inclusion, then it is shown as inclusion", async () => {
        render(ReviewCriteriaList, {
            target: document.body,
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: [] }]]),
            props: {
                reviewers: loading([]),
                criteriaWithReviews: loading([
                    createReviewedCriterion({
                        name: "Criterion 1",
                        category: CriterionCategory.INCLUSION,
                    }),
                ]),
            },
        });

        await waitForComponentLoading();

        const criteria = screen.getAllByTestId("criterion-list-entry");
        expect(criteria).toHaveLength(1);

        const hardExclusions = screen.getByText("Hard Exclusion");
        expect(hardExclusions).toBeInTheDocument();
        const hardExclusionCriteria = hardExclusions.parentElement?.getElementsByTagName("li");
        expect(hardExclusionCriteria).toHaveLength(0);

        const softExclusions = screen.getByText("Soft Exclusion");
        expect(softExclusions).toBeInTheDocument();
        const softExclusionCriteria = softExclusions.parentElement?.getElementsByTagName("li");
        expect(softExclusionCriteria).toHaveLength(0);

        const inclusions = screen.getByText("Inclusion");
        expect(inclusions).toBeInTheDocument();
        const inclusionCriteria = inclusions.parentElement?.getElementsByTagName("li");
        expect(inclusionCriteria).toHaveLength(1);
    });

    test("When criterion is unspecified, then it isn't shown", async () => {
        render(ReviewCriteriaList, {
            target: document.body,
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: [] }]]),
            props: {
                reviewers: loading([]),
                criteriaWithReviews: loading([
                    createReviewedCriterion({
                        name: "Criterion 1",
                        category: CriterionCategory.UNSPECIFIED,
                    }),
                ]),
            },
        });

        await waitForComponentLoading();

        const criteria = screen.queryAllByTestId("criterion-list-entry");
        expect(criteria).toHaveLength(0);

        const hardExclusions = screen.getByText("Hard Exclusion");
        expect(hardExclusions).toBeInTheDocument();
        const hardExclusionCriteria = hardExclusions.parentElement?.getElementsByTagName("li");
        expect(hardExclusionCriteria).toHaveLength(0);

        const softExclusions = screen.getByText("Soft Exclusion");
        expect(softExclusions).toBeInTheDocument();
        const softExclusionCriteria = softExclusions.parentElement?.getElementsByTagName("li");
        expect(softExclusionCriteria).toHaveLength(0);

        const inclusions = screen.getByText("Inclusion");
        expect(inclusions).toBeInTheDocument();
        const inclusionCriteria = inclusions.parentElement?.getElementsByTagName("li");
        expect(inclusionCriteria).toHaveLength(0);
    });
});

import PaperDecisionBanner from "$lib/components/composites/criteria/PaperDecisionBanner.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { createProjectPaper, loading } from "../../model-builder";
import { PaperDecision } from "$lib/model/api/project";
import { waitForComponentLoading } from "../test-helper";
import { Reviews, Users } from "../../example-data";

describe("PaperDecisionBanner", () => {
    test("When the paper is accepted, it should display the accepted banner", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([]),
                loadingProjectPaper: loading(
                    createProjectPaper({
                        decision: PaperDecision.ACCEPTED,
                    }),
                ),
            },
        });

        const label = await screen.findByText("Accepted");
        expect(label).toBeInTheDocument();
    });

    test("When the paper is declined, it should display the declined banner", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([]),
                loadingProjectPaper: loading(
                    createProjectPaper({
                        decision: PaperDecision.DECLINED,
                    }),
                ),
            },
        });

        const label = await screen.findByText("Declined");
        expect(label).toBeInTheDocument();
    });

    test("When the paper is undecided and has reviews, it should display the undecided banner", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([]),
                loadingProjectPaper: loading(
                    createProjectPaper({
                        decision: PaperDecision.IN_REVIEW,
                        reviews: [Reviews.demoReview1],
                    }),
                ),
            },
        });

        const label = await screen.findByText("Undecided");
        expect(label).toBeInTheDocument();
    });

    test("When the paper is undecided and has no reviews, it should display the unreviewed banner", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([]),
                loadingProjectPaper: loading(
                    createProjectPaper({
                        decision: PaperDecision.UNREVIEWED,
                        reviews: [],
                    }),
                ),
            },
        });

        const label = await screen.findByText("Not reviewed");
        expect(label).toBeInTheDocument();
    });

    test("When the paper is unspecified, it should display the unreviewed banner", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([]),
                loadingProjectPaper: loading(
                    createProjectPaper({
                        decision: PaperDecision.UNSPECIFIED,
                        reviews: [],
                    }),
                ),
            },
        });

        const label = await screen.findByText("Not reviewed");
        expect(label).toBeInTheDocument();
    });

    test("When the banner is loading, then skeletons are shown", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([]),
                loadingProjectPaper: loading(createProjectPaper()),
            },
        });

        const skeletons = screen.queryAllByTestId("skeleton");
        expect(skeletons.length).toBeGreaterThan(0);
    });

    test("When paper has reviewers, then the reviewers are shown in the banner", async () => {
        render(PaperDecisionBanner, {
            target: document.body,
            props: {
                reviewers: loading([Users.johnDoe]),
                loadingProjectPaper: loading(
                    createProjectPaper({
                        reviews: [Reviews.demoReview1],
                        decision: PaperDecision.ACCEPTED,
                    }),
                ),
            },
        });

        await waitForComponentLoading();

        const userAvatar = screen.getByTestId("user-avatar");
        expect(userAvatar).toBeInTheDocument();
        const userInitials = screen.getByText("JD");
        expect(userInitials).toBeInTheDocument();
    });
});

import { describe, it, expect } from "vitest";
import { calculateStageProgress } from "$lib/utils/statistics-helper";
import { type Paper, ReviewDecision } from "$lib/model/backend";
import { createPaper } from "../../model-builder";

describe("StageProgressCalculator", () => {
    it("When no paper are provided, then the progress is zero", () => {
        const papers: Paper[] = [];

        expect(calculateStageProgress(papers)).toBe(0);
    });

    it("When all paper are not reviewed yet, then the progress is zero", () => {
        const papers: Paper[] = Array.from({ length: 4 }, (_, i) =>
            createPaper({ id: i, reviewData: undefined }),
        );

        expect(calculateStageProgress(papers)).toBe(0);
    });

    it("When one paper is accepted, one declined, one maybe and one unreviewed, then the progress is 50%", () => {
        const decisions = [
            undefined,
            { finalDecision: ReviewDecision.Maybe, reviews: [] },
            { finalDecision: ReviewDecision.Accepted, reviews: [] },
            { finalDecision: ReviewDecision.Declined, reviews: [] },
        ];

        const papers: Paper[] = Array.from({ length: 4 }, (_, i) =>
            createPaper({ id: i, reviewData: decisions[i] }),
        );

        expect(calculateStageProgress(papers)).toBe(50);
    });

    it("When all papers are decided, then the progress is 100%", () => {
        const decisions = [
            { finalDecision: ReviewDecision.Declined, reviews: [] },
            { finalDecision: ReviewDecision.Accepted, reviews: [] },
            { finalDecision: ReviewDecision.Declined, reviews: [] },
        ];

        const papers: Paper[] = Array.from({ length: 3 }, (_, i) =>
            createPaper({ id: i, reviewData: decisions[i] }),
        );

        expect(calculateStageProgress(papers)).toBe(100);
    });
});

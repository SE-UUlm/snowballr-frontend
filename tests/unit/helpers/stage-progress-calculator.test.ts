import { describe, it, expect } from "vitest";
import { calculateStageProgress, isPaperUndecided } from "$lib/utils/statistics-helper";
import { type Paper, ReviewDecision } from "$lib/model/backend";
import { createPaper } from "../../model-builder";

describe("StageProgressCalculator", () => {
    it("When no paper are provided, then the progress is zero", () => {
        const papers: Paper[] = [];

        expect(calculateStageProgress(papers)).toBe(0);
    });

    it("When the paper is not reviewed, then it is undecided", () => {
        const paper = createPaper({ id: 1, reviewData: undefined });

        expect(isPaperUndecided(paper)).toBe(true);
    });

    it("When all paper are not reviewed yet, then the progress is zero", () => {
        const papers: Paper[] = Array.from({ length: 4 }, (_, i) =>
            createPaper({ id: i, reviewData: undefined }),
        );

        expect(calculateStageProgress(papers)).toBe(0);
    });

    it("When the paper is accepted or declined, then it is decided, else not", () => {
        const decisions = [
            { finalDecision: ReviewDecision.Maybe, reviews: [] },
            { finalDecision: ReviewDecision.Accepted, reviews: [] },
            { finalDecision: ReviewDecision.Declined, reviews: [] },
        ];

        const papers: Paper[] = Array.from({ length: 3 }, (_, i) =>
            createPaper({ id: i, reviewData: decisions[i] }),
        );

        expect(isPaperUndecided(papers[0])).toBe(true);
        expect(isPaperUndecided(papers[1])).toBe(false);
        expect(isPaperUndecided(papers[2])).toBe(false);
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

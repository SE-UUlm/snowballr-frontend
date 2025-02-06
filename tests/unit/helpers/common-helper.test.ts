import { describe, expect, it } from "vitest";
import { doesPaperNeedReview, getNames, isPaperUndecided } from "$lib/utils/common-helper";
import { createProjectPaper } from "../../model-builder";
import { ProjectPapers, Reviews } from "../../example-data";
import { PaperDecision, type Project_Paper } from "$lib/model/api/project";

describe("Extract names from persons", () => {
    it("When no person objects are provided, no names are extracted and stringified", () => {
        const persons: { firstName: string; lastName: string }[] = [];

        expect(getNames(persons)).toBe("");
    });

    it("When one person is provided, only the person's name is extracted", () => {
        const persons: { firstName: string; lastName: string }[] = [
            { firstName: "John", lastName: "Doe" },
        ];

        expect(getNames(persons)).toBe("John Doe");
    });

    it("When multiple persons are provided, the names are extracted and concatenated, separated by an ','", () => {
        const persons: { firstName: string; lastName: string }[] = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" },
        ];

        expect(getNames(persons)).toBe("John Doe, Jane Doe");
    });
});

describe("Check the (review) status of a paper", () => {
    it("When the paper is not reviewed, then it is undecided and need further reviews", () => {
        const paper = ProjectPapers.demoProjectPaper1;

        expect(isPaperUndecided(paper)).toBe(true);
        expect(doesPaperNeedReview(paper, 1)).toBe(true);
    });

    it("When the paper is accepted or declined, then it is decided, else not", () => {
        const decisions = [
            {
                finalDecision: PaperDecision.DECLINED,
                reviews: Reviews.demoReview1,
            },
            {
                finalDecision: PaperDecision.UNDECIDED,
                reviews: Reviews.demoReview2,
            },
            {
                finalDecision: PaperDecision.ACCEPTED,
                reviews: Reviews.demoReview3,
            },
        ];

        const papers: Project_Paper[] = Array.from({ length: 3 }, (_, i) =>
            createProjectPaper({
                id: `${i}`,
                decision: decisions[i].finalDecision,
                reviews: [decisions[i].reviews],
            }),
        );

        expect(isPaperUndecided(papers[0])).toBe(false);
        expect(isPaperUndecided(papers[1])).toBe(true);
        expect(isPaperUndecided(papers[2])).toBe(false);
    });

    it("When the paper has a review, but two are required, then it needs more reviews, i.e. has open reviews", () => {
        const paper = ProjectPapers.demoProjectPaper3;

        expect(doesPaperNeedReview(paper, 1)).toBe(false);
        expect(doesPaperNeedReview(paper, 2)).toBe(true);
    });
});

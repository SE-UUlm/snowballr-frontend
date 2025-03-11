import { describe, expect, it } from "vitest";
import {
    comparePaperId,
    doesPaperNeedReview,
    getNames,
    groupBy,
    isPaperUndecided,
    pluralize,
} from "$lib/utils/common-helper";
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

describe("Pluralize a word based on the count", () => {
    it("When the count is 1, the singular form of the word is returned", () => {
        expect(pluralize(1, "item", "items")).toBe("item");
    });

    it("When the count is greater than 1, the plural form of the word is returned", () => {
        expect(pluralize(2, "item", "items")).toBe("items");
    });

    it("When the count is 0, the plural form of the word is returned", () => {
        expect(pluralize(0, "item", "items")).toBe("items");
    });
});

describe("Group items of a list by a key (function)", () => {
    it("When list is empty, then no items are grouped", () => {
        expect(groupBy([], (i) => i)).toStrictEqual({});
    });

    it("When the key selector function is given, then the items are grouped by their corresponding key determined by the key selector function", () => {
        const list = [
            { type: "a", value: 1 },
            { type: "a", value: 2 },
            { type: "b", value: 3 },
            { type: "a", value: 1 },
        ];
        expect(groupBy(list, (i) => i.type)).toStrictEqual({
            a: [
                { type: "a", value: 1 },
                { type: "a", value: 2 },
                { type: "a", value: 1 },
            ],
            b: [{ type: "b", value: 3 }],
        });
        expect(groupBy(list, (i) => `${i.value}`)).toStrictEqual({
            "1": [
                { type: "a", value: 1 },
                { type: "a", value: 1 },
            ],
            "2": [{ type: "a", value: 2 }],
            "3": [{ type: "b", value: 3 }],
        });
    });

    it("When the key selector function is the identity, then every item has its own key", () => {
        expect(groupBy([1, 2, 3], (i) => "" + i)).toStrictEqual({ "1": [1], "2": [2], "3": [3] });
    });
});

describe("Compare paper ids", () => {
    it("When the paper ids are the same, then they are equal", () => {
        const compare = comparePaperId("#123", "#123");
        expect(compare).toBe(0);
    });

    it("When the first paper id is smaller than the second, then the comparison is negative", () => {
        const compare = comparePaperId("#9", "#10");
        expect(compare).toBeLessThan(0);
    });

    it("When the first paper id is greater than the second, then the comparison is positive", () => {
        const compare = comparePaperId("#42", "#8");
        expect(compare).toBeGreaterThan(0);
    });

    it("When both paper ids are malformed, then the comparison is 0", () => {
        const compare1 = comparePaperId("#", "#");
        expect(compare1).toBe(0);

        const compare2 = comparePaperId("#a", "#b");
        expect(compare2).toBe(0);
    });
});

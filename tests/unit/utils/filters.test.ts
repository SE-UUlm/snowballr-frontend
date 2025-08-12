import { describe, expect, test } from "vitest";
import { Papers, ProjectPapers } from "$tests/example-data";
import { filterPapers, filterProjectPapers } from "$lib/utils/filters";
import { PaperDecision, type Project_Paper } from "$lib/model/api/project";
import { createPaper, createProjectPaper, createReview } from "$tests/model-builder";

describe("Filter papers", () => {
    test(
        "When papers should be filtered, but no search is provided, " +
            "then the same list of papers is returned ",
        async () => {
            const papers = [Papers.demoPaper1, Papers.demoPaper2, Papers.demoPaper3];

            expect(filterPapers(papers, "")).toStrictEqual(papers);
        },
    );

    test(
        "When papers are filtered, then only papers where the id, title or authors match " +
            "the search string - considering the FZF matching - are returned.",
        async () => {
            const papers = [Papers.demoPaper1, Papers.demoPaper2, Papers.demoPaper3];

            expect(filterPapers(papers, "2 J")).toStrictEqual([Papers.demoPaper3]);
        },
    );
});

describe("Filter project papers", () => {
    test(
        "When project papers should be filtered, but neither a filter nor a search text is provided," +
            "then the same list of project papers is returned",
        () => {
            const projectPapers = [
                ProjectPapers.demoProjectPaper1,
                ProjectPapers.demoProjectPaper2,
                ProjectPapers.demoProjectPaper3,
            ];

            expect(filterProjectPapers(projectPapers)).toStrictEqual(projectPapers);
        },
    );

    test(
        "When project papers are filtered by search text, then only papers where the id, title or " +
            "authors match the search string - considering the FZF matching - are returned.",
        () => {
            const projectPapers = [
                ProjectPapers.demoProjectPaper1,
                ProjectPapers.demoProjectPaper2,
                ProjectPapers.demoProjectPaper3,
            ];

            expect(
                filterProjectPapers(projectPapers, undefined, "TypeScript Performance"),
            ).toStrictEqual([ProjectPapers.demoProjectPaper1]);

            // test separate search starting with '#' to search directly by paper id
            expect(filterProjectPapers(projectPapers, undefined, "#0")).toStrictEqual([
                ProjectPapers.demoProjectPaper1,
            ]);
        },
    );

    test(
        "When project papers are filtered by specific filter arrays, then only papers conforming all" +
            "non-empty filter arrays are returned.",
        () => {
            const projectPapers = [
                ProjectPapers.demoProjectPaper1,
                ProjectPapers.demoProjectPaper2,
                ProjectPapers.demoProjectPaper3,
            ];

            const filters = {
                stages: [],
                reviewers: [],
                publishers: [],
                years: [],
                decisions: [String(PaperDecision.UNREVIEWED)],
                criteria: [],
            };

            expect(filterProjectPapers(projectPapers, filters)).toStrictEqual([
                ProjectPapers.demoProjectPaper1,
            ]);
        },
    );

    test.each([
        { stage: 1n },
        { reviews: [createReview({ userId: "0", selectedCriteriaIds: ["2"] })] },
        { paper: createPaper({ publisher: "ACM", year: 2013 }) },
        { paper: createPaper({ publisher: "IEEE Explore", year: 1999 }) },
        { decision: PaperDecision.ACCEPTED },
        { reviews: [createReview({ userId: "1", selectedCriteriaIds: ["0"] })] },
    ])(
        "When a project paper does not match all filters, then it is filtered out " +
            "(failing property: $0)",
        (property: Partial<Project_Paper>) => {
            const filters = {
                stages: ["0"],
                reviewers: ["1"],
                publishers: ["IEEE Explore"],
                years: ["2013"],
                decisions: [String(PaperDecision.UNREVIEWED)],
                criteria: ["2"],
            };

            const projectPaper = createProjectPaper({
                stage: 0n,
                reviews: [createReview({ userId: "1", selectedCriteriaIds: ["2"] })],
                decision: PaperDecision.UNREVIEWED,
                paper: createPaper({ publisher: "IEEE Explore", year: 2013 }),
            });
            expect(filterProjectPapers([{ ...projectPaper, ...property }], filters)).toStrictEqual(
                [],
            );
        },
    );

    test("When a project paper matches all filters, then it is not filtered out", () => {
        const filters = {
            stages: ["0"],
            reviewers: ["1"],
            publishers: ["IEEE Explore"],
            years: ["2013"],
            decisions: [String(PaperDecision.UNREVIEWED)],
            criteria: ["2"],
        };

        const matchingProjectPaper = createProjectPaper({
            stage: 0n,
            reviews: [createReview({ userId: "1", selectedCriteriaIds: ["2"] })],
            decision: PaperDecision.UNREVIEWED,
            paper: createPaper({ publisher: "IEEE Explore", year: 2013 }),
        });

        expect(filterProjectPapers([matchingProjectPaper], filters)).toStrictEqual([
            matchingProjectPaper,
        ]);
    });
});

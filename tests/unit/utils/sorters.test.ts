import { describe, expect, test as baseTest } from "vitest";
import { ProjectPapers } from "$tests/example-data";
import { type Project_Paper } from "$api/project";
import { sortProjectPaper } from "$lib/utils/sorters";
import { SortCriteria, SortDirection } from "$lib/model/sort-criteria";
import { createPaper, createProjectPaper } from "$tests/model-builder";

const test = baseTest.extend<{
    papers: Project_Paper[];
}>({
    // eslint-disable-next-line no-empty-pattern
    papers: async ({}, use) => {
        await use([
            ProjectPapers.demoProjectPaper1,
            ProjectPapers.demoProjectPaper2,
            ProjectPapers.demoProjectPaper3,
        ]);
    },
});

describe("Sort project papers", () => {
    test("When papers are sorted by title, then papers with titles that are lexicographically earlier appear before those with later titles.", async ({
        papers,
    }) => {
        expect(
            sortProjectPaper(papers, {
                criterion: SortCriteria.PAPER_TITLE,
                direction: SortDirection.ASC,
            }),
        ).toStrictEqual([
            ProjectPapers.demoProjectPaper1,
            ProjectPapers.demoProjectPaper3,
            ProjectPapers.demoProjectPaper2,
        ]);
    });

    test("When papers are sorted by paper id, then papers with local ids that are lower appear before those with higher ids.", async ({
        papers,
    }) => {
        expect(
            sortProjectPaper(papers, {
                criterion: SortCriteria.PAPER_ID,
                direction: SortDirection.ASC,
            }),
        ).toStrictEqual(papers);
    });

    test("When papers are sorted by year, then papers with years that are earlier appear before those with more recent years.", async ({
        papers,
    }) => {
        expect(
            sortProjectPaper(papers, {
                criterion: SortCriteria.YEAR,
                direction: SortDirection.ASC,
            }),
        ).toStrictEqual([
            ProjectPapers.demoProjectPaper2,
            ProjectPapers.demoProjectPaper1,
            ProjectPapers.demoProjectPaper3,
        ]);
    });

    test("When papers are sorted by decision, then papers with 'Accepted' appear before 'Maybe' that appear before 'Declined' and 'Unreviewed'.", async ({
        papers,
    }) => {
        expect(
            sortProjectPaper(papers, {
                criterion: SortCriteria.DECISION,
                direction: SortDirection.ASC,
            }),
        ).toStrictEqual([
            ProjectPapers.demoProjectPaper3,
            ProjectPapers.demoProjectPaper2,
            ProjectPapers.demoProjectPaper1,
        ]);
    });

    test("When the value by which the papers should be sorted is not given, then this paper appears at the beginning, if they are sorted ascending.", async ({
        papers,
    }) => {
        const emptyProjectPaper = createProjectPaper({ paper: undefined });
        const partiallyEmptyProjectPaper = createProjectPaper({
            paper: createPaper({ title: undefined, year: undefined }),
        });

        expect(
            sortProjectPaper([...papers, emptyProjectPaper, partiallyEmptyProjectPaper], {
                criterion: SortCriteria.PAPER_TITLE,
                direction: SortDirection.ASC,
            }),
        ).toStrictEqual([
            emptyProjectPaper,
            partiallyEmptyProjectPaper,
            ProjectPapers.demoProjectPaper1,
            ProjectPapers.demoProjectPaper3,
            ProjectPapers.demoProjectPaper2,
        ]);

        expect(
            sortProjectPaper([...papers, emptyProjectPaper, partiallyEmptyProjectPaper], {
                criterion: SortCriteria.YEAR,
                direction: SortDirection.ASC,
            }),
        ).toStrictEqual([
            emptyProjectPaper,
            partiallyEmptyProjectPaper,
            ProjectPapers.demoProjectPaper2,
            ProjectPapers.demoProjectPaper1,
            ProjectPapers.demoProjectPaper3,
        ]);
    });

    test("When the descending sorting option is selected, then the order of the paper is reversed.", async ({
        papers,
    }) => {
        expect(
            sortProjectPaper(papers, {
                criterion: SortCriteria.PAPER_ID,
                direction: SortDirection.DESC,
            }),
        ).toStrictEqual([
            ProjectPapers.demoProjectPaper3,
            ProjectPapers.demoProjectPaper2,
            ProjectPapers.demoProjectPaper1,
        ]);
    });
});

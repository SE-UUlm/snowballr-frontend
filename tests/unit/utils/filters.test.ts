import { describe, expect, test } from "vitest";
import { ProjectPapers } from "$tests/example-data";
import { filterProjectPapers } from "$lib/utils/filters";

describe("Custom filter", () => {
    test(
        "When project papers should be filtered, but neither a filter nor a search text is provided," +
            "then the same list of project papers is returned",
        () => {
            const projectPapers = [
                ProjectPapers.demoProjectPaper1,
                ProjectPapers.demoProjectPaper2,
                ProjectPapers.demoProjectPaper3,
            ];

            expect(filterProjectPapers(projectPapers)).toBe(projectPapers);
        },
    );
});

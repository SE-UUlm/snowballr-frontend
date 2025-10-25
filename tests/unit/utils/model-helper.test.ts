import { stringifyPaper } from "$lib/utils/model-helper";
import { createPaper } from "$tests/model-builder";
import { describe, expect, test } from "vitest";

describe("Stringify a paper", () => {
    test("When the paper has authors, then the authors are converted to names", () => {
        const paper = createPaper({
            authors: [
                { firstName: "John", lastName: "Doe" },
                { firstName: "Jane", lastName: "Doe" },
            ],
        });

        const stringifiedPaper = stringifyPaper(paper);

        expect(stringifiedPaper.authors).toBe("John Doe; Jane Doe");
    });

    test("When the paper has a year, then the year is converted to a string", () => {
        const paper = createPaper({ year: 2020 });

        const stringifiedPaper = stringifyPaper(paper);

        expect(stringifiedPaper.year).toBe("2020");
    });

    test("When the paper has a title, then the title is converted to a string", () => {
        const paper = createPaper({ title: "A great paper" });

        const stringifiedPaper = stringifyPaper(paper);

        expect(stringifiedPaper.title).toBe("A great paper");
    });

    test("When the paper has an abstract, then the abstract is converted to a string", () => {
        const paper = createPaper({ abstrakt: "This is an abstract." });

        const stringifiedPaper = stringifyPaper(paper);

        expect(stringifiedPaper.abstrakt).toBe("This is an abstract.");
    });
});

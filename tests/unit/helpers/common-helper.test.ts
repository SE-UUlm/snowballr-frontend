import { describe, it, expect } from "vitest";
import { getNames } from "$lib/utils/common-helper";

describe("NameExtractor", () => {
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

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    callDebounced,
    comparePaperId,
    debounce,
    doesPaperNeedReview,
    getName,
    getNameOrEmail,
    getNames,
    groupBy,
    isPaperUndecided,
    isStringEqual,
    pluralize,
    stringToAuthors,
    sum,
    sumBy,
    wrapLongWords,
} from "$lib/utils/common-helper";
import { createProjectPaper } from "../../model-builder";
import { ProjectPapers, Reviews } from "../../example-data";
import { PaperDecision, type Project_Paper } from "$api/project";
import type { Person, PersonWithEmail } from "$lib/model/general";

describe("Extract name from a person", () => {
    test("When the person has both first and last name, both are returned", () => {
        const person: Person = { firstName: "John", lastName: "Doe" };

        expect(getName(person)).toBe("John Doe");
    });

    test("When the person has only a first name, only the first name is returned", () => {
        const person: Person = { firstName: "John", lastName: "" };

        expect(getName(person)).toBe("John");
    });

    test("When the person has only a last name, only the last name is returned", () => {
        const person: Person = { firstName: "", lastName: "Doe" };

        expect(getName(person)).toBe("Doe");
    });

    test("When the person has neither a first nor a last name, an empty string is returned", () => {
        const person: Person = { firstName: "", lastName: "" };

        expect(getName(person)).toBe("");
    });
});

describe("Get name or email from person", () => {
    test("When the person has both first and last name, both are returned", () => {
        const person: PersonWithEmail = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
        };

        expect(getNameOrEmail(person)).toBe("John Doe");
    });

    test("When the person has no name, the email is returned", () => {
        const person: PersonWithEmail = {
            firstName: "",
            lastName: "",
            email: "john.doe@example.com",
        };

        expect(getNameOrEmail(person)).toBe("john.doe@example.com");
    });
});

describe("Extract names from persons", () => {
    test("When no person objects are provided, no names are extracted and stringified", () => {
        const persons: Person[] = [];

        expect(getNames(persons)).toBe("");
    });

    test("When one person is provided, only the person's name is extracted", () => {
        const persons: Person[] = [{ firstName: "John", lastName: "Doe" }];

        expect(getNames(persons)).toBe("John Doe");
    });

    test("When multiple persons are provided, the names are extracted and concatenated, separated by an ','", () => {
        const persons: Person[] = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" },
        ];

        expect(getNames(persons)).toBe("John Doe, Jane Doe");
    });
});

describe("Check the (review) status of a paper", () => {
    test("When the paper is not reviewed, then it is undecided and need further reviews", () => {
        const paper = ProjectPapers.demoProjectPaper1;

        expect(isPaperUndecided(paper)).toBe(true);
        expect(doesPaperNeedReview(paper, 1)).toBe(true);
    });

    test("When the paper is accepted or declined, then it is decided, else not", () => {
        const decisions = [
            {
                finalDecision: PaperDecision.DECLINED,
                reviews: Reviews.demoReview1,
            },
            {
                finalDecision: PaperDecision.IN_REVIEW,
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

    test("When the paper has a review, but two are required, then it needs more reviews, i.e. has open reviews", () => {
        const paper = ProjectPapers.demoProjectPaper3;

        expect(doesPaperNeedReview(paper, 1)).toBe(false);
        expect(doesPaperNeedReview(paper, 2)).toBe(true);
    });
});

describe("Pluralize a word based on the count", () => {
    test("When the count is 1, the singular form of the word is returned", () => {
        expect(pluralize(1, "item", "items")).toBe("item");
    });

    test("When the count is greater than 1, the plural form of the word is returned", () => {
        expect(pluralize(2, "item", "items")).toBe("items");
    });

    test("When the count is 0, the plural form of the word is returned", () => {
        expect(pluralize(0, "item", "items")).toBe("items");
    });

    test("When the count is an object with a length property, the plural form of the word is returned based on the length", () => {
        expect(pluralize([1, 2, 3], "item", "items")).toBe("items");
        expect(pluralize([1], "item", "items")).toBe("item");
    });
});

describe("Group items of a list by a key (function)", () => {
    test("When list is empty, then no items are grouped", () => {
        expect(groupBy([], (i) => i)).toStrictEqual({});
    });

    test("When the key selector function is given, then the items are grouped by their corresponding key determined by the key selector function", () => {
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

    test("When the key selector function is the identity, then every item has its own key", () => {
        expect(groupBy([1, 2, 3], (i) => "" + i)).toStrictEqual({ "1": [1], "2": [2], "3": [3] });
    });
});

describe("Compare paper ids", () => {
    test("When the paper ids are the same, then they are equal", () => {
        const compare = comparePaperId("123", "123");
        expect(compare).toBe(0);
    });

    test("When the first paper id is smaller than the second, then the comparison is negative", () => {
        const compare = comparePaperId("9", "10");
        expect(compare).toBeLessThan(0);
    });

    test("When the first paper id is greater than the second, then the comparison is positive", () => {
        const compare = comparePaperId("42", "8");
        expect(compare).toBeGreaterThan(0);
    });

    test("When only one paper ids is numeric, then this id comes before the other one", () => {
        const compare1 = comparePaperId("1", "a");
        expect(compare1).toBeLessThan(0);

        const compare2 = comparePaperId("a", "1");
        expect(compare2).toBeGreaterThan(0);
    });

    test("When both paper ids are not numeric, then the ids are compared lexicographically.", () => {
        const compare = comparePaperId("a", "b");
        expect(compare).toBeLessThan(0);
    });
});

describe("Wrap long words in a text", () => {
    test("When the text is empty, then no words are wrapped", () => {
        const text = "";
        const result = wrapLongWords(text, 10);
        expect(result).toBe("");
    });

    test("When the text contains no long words, then no words are wrapped", () => {
        const text = "This is a test";
        const result = wrapLongWords(text, 10);
        expect(result).toBe("This is a test");
    });

    test("When the text contains long words, then they are wrapped in a span with the class 'break-all'", () => {
        const text = "This is a verylongwordthatneedstobewrapped";
        const result = wrapLongWords(text, 10);
        expect(result).toBe(
            'This is a <span class="break-all">verylongwordthatneedstobewrapped</span>',
        );
    });
});

describe("Debounce a function", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("When a debounced function is called, then the function is called after the given delay", () => {
        const mockFn = vi.fn();
        callDebounced(mockFn, 300, ["test argument"]);

        expect(mockFn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(299);
        expect(mockFn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);

        expect(mockFn).toHaveBeenCalledWith(["test argument"]);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test("When a debounced function is called multiple times (using `callDebounced`), then all function calls are invoked", () => {
        const mockFn = vi.fn();

        callDebounced(mockFn);
        vi.advanceTimersByTime(200);
        callDebounced(mockFn);
        vi.advanceTimersByTime(200);
        callDebounced(mockFn);

        vi.advanceTimersByTime(500);

        expect(mockFn).toHaveBeenCalledTimes(3);
    });

    test("When a debounced function is created and repeatedly called, then only the last call is invoked", () => {
        const mockFn = vi.fn();
        const debouncedFunction = debounce(mockFn, 500);

        debouncedFunction();
        vi.advanceTimersByTime(200);
        debouncedFunction();
        vi.advanceTimersByTime(200);
        debouncedFunction();

        vi.advanceTimersByTime(500);

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test("When no arguments are provided, then the function is executed without any arguments", () => {
        const mockFn = vi.fn();
        callDebounced(mockFn, 250);

        vi.advanceTimersByTime(250);

        expect(mockFn).toHaveBeenCalledWith();
    });
});

describe("Check String equality", () => {
    test("When both objects are the same, then they are equal", () => {
        const obj = { a: 1, b: [2, 3] };
        expect(isStringEqual(obj, obj)).toBe(true);
    });

    test("When both objects have the same structure and values, then they are equal", () => {
        const obj1 = { a: 1, b: [2, 3] };
        const obj2 = { a: 1, b: [2, 3] };
        expect(isStringEqual(obj1, obj2)).toBe(true);
    });

    test("When both objects have different structures or values, then they are not equal", () => {
        const obj1 = { a: 1, b: [2, 3] };
        const obj2 = { a: 1, b: [2, 4] };
        expect(isStringEqual(obj1, obj2)).toBe(false);
    });

    test("When comparing different types, then they are not equal", () => {
        expect(isStringEqual({ a: 1 }, [1])).toBe(false);
        expect(isStringEqual(null, undefined)).toBe(false);
        expect(isStringEqual(42, "42")).toBe(false);
    });
});

describe("Extract authors from string", () => {
    test("When the string is empty, then no authors are extracted", () => {
        const text = "";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([]);
    });

    test("When the string contains one author, then this author is extracted", () => {
        const text = "John Doe";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([{ firstName: "John", lastName: "Doe" }]);
    });

    test("When the string contains multiple authors separated by semicolons, then all authors are extracted", () => {
        const text = "John Doe; Jane Smith; Alice Johnson";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
            { firstName: "Alice", lastName: "Johnson" },
        ]);
    });

    test("When the string contains extra spaces around semicolons, then authors are extracted correctly", () => {
        const text = "  John Doe  ; Jane Smith ;   Alice Johnson  ";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
            { firstName: "Alice", lastName: "Johnson" },
        ]);
    });

    test("When the string contains no spaces around semicolons, then authors are extracted correctly", () => {
        const text = "John Doe;Jane Smith;Alice Johnson";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
            { firstName: "Alice", lastName: "Johnson" },
        ]);
    });

    test("When the string contains consecutive semicolons, then no empty authors are created", () => {
        const text = "John Doe;; Jane Smith; ; Alice Johnson;";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
            { firstName: "Alice", lastName: "Johnson" },
        ]);
    });

    test("When an author has only one name, then it is treated as the last name", () => {
        const text = "Plato; John Doe";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "", lastName: "Plato" },
            { firstName: "John", lastName: "Doe" },
        ]);
    });

    test("When an author has multiple first names, then all but the last are treated as first names", () => {
        const text = "Mary Ann Smith; John Doe";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "Mary Ann", lastName: "Smith" },
            { firstName: "John", lastName: "Doe" },
        ]);
    });

    test("When an author has leading or trailing spaces, then they are trimmed", () => {
        const text = "  John   Doe  ;  Jane   Smith  ";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
        ]);
    });

    test("When the string contains only semicolons and spaces, then no authors are extracted", () => {
        const text = "  ;   ;  ; ";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([]);
    });

    test("When the string has the format 'Last, First', then the names are extracted correctly", () => {
        const text = "Doe, John; Smith, Jane";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
        ]);
    });

    test("When the string has mixed formats, then the names are extracted correctly", () => {
        const text = "Doe, John; Jane Smith; Brown, Bob";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
            { firstName: "Bob", lastName: "Brown" },
        ]);
    });

    test("When an author has multiple commas in the name, then only the first comma is used to split first and last names", () => {
        const text = "Doe, John, Jr.; Smith, Jane";
        const authors = stringToAuthors(text);
        expect(authors).toEqual([
            { firstName: "John, Jr.", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
        ]);
    });
});

describe("Sum up numbers in an array", () => {
    test("When the array is empty, then the sum is 0", () => {
        expect(sum([])).toBe(0);
    });

    test("When the array contains numbers, then the sum of these numbers is returned", () => {
        expect(sum([1, 2, 3])).toBe(6);
        expect(sum([-1, 1, -2, 2])).toBe(0);
    });
});

describe("Sum up values of items in an array based on a value selector function", () => {
    test("When the array is empty, then the sum is 0", () => {
        expect(sumBy([], (i) => i["value"])).toBe(0);
    });

    test("When the array contains items and a value selector function is provided, then the sum of the values obtained by applying the value selector to each item in the array is returned", () => {
        const items = [{ value: 1 }, { value: 2 }, { value: 3 }];
        expect(sumBy(items, (i) => i.value)).toBe(6);
    });
});

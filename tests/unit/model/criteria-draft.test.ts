import { describe, expect, test } from "vitest";
import { CriterionCategory } from "$api/criterion";
import {
    collectChanges,
    getDraftStatus,
    newDraft,
    suggestTag,
    toDraft,
    validateDraft,
} from "$lib/model/criteria-draft";
import { createCriterion } from "$tests/model-builder";

const exclusion = (id: string, tag: string) =>
    toDraft(
        createCriterion({
            id,
            tag,
            name: `Criterion ${tag}`,
            category: CriterionCategory.EXCLUSION,
        }),
    );

describe("suggestTag", () => {
    test("When a category has no criteria, then the first tag is suggested", () => {
        expect(suggestTag(CriterionCategory.HARD_EXCLUSION, [])).toBe("HE1");
        expect(suggestTag(CriterionCategory.INCLUSION, [])).toBe("I1");
    });

    test("When numbered tags exist, then the number after the highest one is suggested", () => {
        const drafts = [exclusion("0", "E1"), exclusion("1", "e4"), exclusion("2", "Custom")];
        expect(suggestTag(CriterionCategory.EXCLUSION, drafts)).toBe("E5");
    });

    test("When the highest tag is marked as removed, then its number can be reused", () => {
        const drafts = [exclusion("0", "E1"), { ...exclusion("1", "E2"), removed: true }];
        expect(suggestTag(CriterionCategory.EXCLUSION, drafts)).toBe("E2");
    });
});

describe("getDraftStatus", () => {
    test("When a draft is stored and untouched, then it is unchanged", () => {
        expect(getDraftStatus(exclusion("0", "E1"))).toBe("unchanged");
    });

    test("When only surrounding whitespace was added, then it is unchanged", () => {
        const draft = exclusion("0", "E1");
        expect(getDraftStatus({ ...draft, name: ` ${draft.name} ` })).toBe("unchanged");
    });

    test("When a draft is new, edited or removed, then the status says so", () => {
        expect(getDraftStatus(newDraft(CriterionCategory.INCLUSION, []))).toBe("added");
        expect(getDraftStatus({ ...exclusion("0", "E1"), name: "Other" })).toBe("edited");
        expect(getDraftStatus({ ...exclusion("0", "E1"), removed: true })).toBe("removed");
    });
});

describe("validateDraft", () => {
    test("When tag and name are blank, then both are reported", () => {
        const errors = validateDraft({ tag: " ", name: "", description: "" }, "new", []);
        expect(errors).toEqual({ tag: "Enter a tag.", name: "Enter a name." });
    });

    test("When the tag is used by another criterion, regardless of case, then it is reported", () => {
        const errors = validateDraft({ tag: "e1", name: "Name", description: "" }, "new", [
            exclusion("0", "E1"),
        ]);
        expect(errors.tag).toBe("e1 is already used.");
    });

    test("When the tag is only used by the criterion itself or a removed one, then it is valid", () => {
        const drafts = [exclusion("0", "E1"), { ...exclusion("1", "E2"), removed: true }];
        expect(validateDraft({ tag: "E1", name: "Name", description: "" }, "0", drafts)).toEqual(
            {},
        );
        expect(validateDraft({ tag: "E2", name: "Name", description: "" }, "new", drafts)).toEqual(
            {},
        );
    });
});

describe("collectChanges", () => {
    test("When drafts were added, edited and removed, then one request per change is collected", () => {
        const added = { ...newDraft(CriterionCategory.INCLUSION, []), name: " Peer reviewed " };
        const edited = { ...exclusion("0", "E1"), name: "Renamed" };
        const removed = { ...exclusion("1", "E2"), removed: true };

        const changes = collectChanges("project", [added, edited, removed, exclusion("2", "E3")]);

        expect(changes.creates).toEqual([
            {
                projectId: "project",
                tag: "I1",
                name: "Peer reviewed",
                description: "",
                category: CriterionCategory.INCLUSION,
            },
        ]);
        expect(changes.updates).toHaveLength(1);
        expect(changes.updates[0].criterion).toMatchObject({ id: "0", name: "Renamed" });
        expect(changes.updates[0].mask).toEqual({ paths: ["criterion.name"] });
        expect(changes.deletes).toEqual(["1"]);
    });
});

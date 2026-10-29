import {
    CriterionCategory,
    type Criterion,
    type Criterion_Create,
    type Criterion_Update,
} from "$api/criterion";

/** The editable fields of a criterion. */
export type CriterionFields = Pick<Criterion, "tag" | "name" | "description">;

/**
 * A criterion as it is edited in the review settings, before the changes are saved.
 *
 * A draft either mirrors a stored criterion (`stored` is set) or is new. Removing a stored
 * criterion only marks it, so the removal can be undone until the changes are saved.
 */
export interface CriterionDraft extends CriterionFields {
    /** Stable identifier of the draft, used as key in lists. Equal to the criterion id if stored. */
    key: string;
    category: CriterionCategory;
    /** The criterion as it is stored in the backend, `undefined` for new criteria. */
    stored?: Criterion;
    removed: boolean;
}

export type CriterionDraftStatus = "unchanged" | "added" | "edited" | "removed";

/** The requests needed to persist a list of drafts. */
export interface CriteriaChanges {
    creates: Criterion_Create[];
    updates: Criterion_Update[];
    deletes: string[];
}

const EDITABLE_FIELDS = ["tag", "name", "description"] as const satisfies (keyof CriterionFields)[];

/** The tag prefix the criteria of a category are numbered with, e.g. "HE1", "E2" or "I3". */
export const TAG_PREFIXES: Record<CriterionCategory, string> = {
    [CriterionCategory.UNSPECIFIED]: "C",
    [CriterionCategory.HARD_EXCLUSION]: "HE",
    [CriterionCategory.EXCLUSION]: "E",
    [CriterionCategory.INCLUSION]: "I",
};

export function toDraft(criterion: Criterion): CriterionDraft {
    return {
        key: criterion.id,
        tag: criterion.tag,
        name: criterion.name,
        description: criterion.description,
        category: criterion.category,
        stored: criterion,
        removed: false,
    };
}

let nextNewDraftKey = 0;

/**
 * Creates a draft for a new criterion of the given category whose tag continues the numbering of the
 * existing criteria in that category.
 */
export function newDraft(category: CriterionCategory, drafts: CriterionDraft[]): CriterionDraft {
    return {
        key: `new-${nextNewDraftKey++}`,
        tag: suggestTag(category, drafts),
        name: "",
        description: "",
        category,
        removed: false,
    };
}

/**
 * Suggests the next free tag for a category, e.g. "E3" when "E1" and "E2" are taken.
 *
 * Only tags of the form `<prefix><number>` count towards the numbering, so custom tags do not
 * interfere with the suggestion.
 */
export function suggestTag(category: CriterionCategory, drafts: CriterionDraft[]): string {
    const prefix = TAG_PREFIXES[category];
    const pattern = new RegExp(`^${prefix}(\\d+)$`, "i");
    const highestNumber = drafts
        .filter((draft) => !draft.removed)
        .map((draft) => pattern.exec(draft.tag.trim())?.[1])
        .filter((match) => match !== undefined)
        .reduce((highest, match) => Math.max(highest, Number(match)), 0);
    return `${prefix}${highestNumber + 1}`;
}

function changedFields(draft: CriterionDraft): (keyof CriterionFields)[] {
    const stored = draft.stored;
    if (!stored) return [];
    return EDITABLE_FIELDS.filter((field) => normalize(draft, field) !== stored[field]);
}

function normalize(fields: CriterionFields, field: keyof CriterionFields): string {
    return fields[field].trim();
}

export function getDraftStatus(draft: CriterionDraft): CriterionDraftStatus {
    if (!draft.stored) return "added";
    if (draft.removed) return "removed";
    return changedFields(draft).length > 0 ? "edited" : "unchanged";
}

/**
 * Validates the fields of a draft against the other drafts.
 *
 * @returns An error message per invalid field
 */
export function validateDraft(
    fields: CriterionFields,
    key: string,
    drafts: CriterionDraft[],
): Partial<Record<keyof CriterionFields, string>> {
    const errors: Partial<Record<keyof CriterionFields, string>> = {};
    const tag = fields.tag.trim();

    if (tag.length === 0) {
        errors.tag = "Enter a tag.";
    } else if (
        drafts.some(
            (draft) =>
                draft.key !== key &&
                !draft.removed &&
                draft.tag.trim().toLowerCase() === tag.toLowerCase(),
        )
    ) {
        errors.tag = `${tag} is already used.`;
    }
    if (fields.name.trim().length === 0) {
        errors.name = "Enter a name.";
    }
    if (fields.description.trim().length === 0) {
        errors.description = "Enter a description.";
    }
    return errors;
}

/** Collects the requests needed to store the given drafts. Unchanged drafts are skipped. */
export function collectChanges(projectId: string, drafts: CriterionDraft[]): CriteriaChanges {
    const changes: CriteriaChanges = { creates: [], updates: [], deletes: [] };

    for (const draft of drafts) {
        const status = getDraftStatus(draft);
        if (status === "added" && !draft.removed) {
            changes.creates.push({
                projectId,
                tag: normalize(draft, "tag"),
                name: normalize(draft, "name"),
                description: normalize(draft, "description"),
                category: draft.category,
            });
        } else if (status === "removed") {
            changes.deletes.push(draft.stored!.id);
        } else if (status === "edited") {
            const fields = changedFields(draft);
            changes.updates.push({
                criterion: {
                    ...draft.stored!,
                    ...Object.fromEntries(fields.map((field) => [field, normalize(draft, field)])),
                },
                mask: { paths: fields.map((field) => `criterion.${field}`) },
            });
        }
    }
    return changes;
}

export function countChanges(changes: CriteriaChanges): number {
    return changes.creates.length + changes.updates.length + changes.deletes.length;
}

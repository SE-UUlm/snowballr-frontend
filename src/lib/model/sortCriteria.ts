/**
 * The criteria by which the user can sort their paper.
 */
export enum SortCriteria {
    PAPER_TITLE = "Title",
    YEAR = "Year",
    DECISION = "Decision",
    PAPER_ID = "Id",
}

export enum SortDirection {
    ASC,
    DESC,
}

export interface SortOption {
    criterion: SortCriteria;
    direction: SortDirection;
}

/**
 * Labels for all allowed sorting options the user can select from.
 * These are used as keys in the `ALLOWED_SORT_OPTIONS` map.
 */
export type SortOptionLabel =
    | "Id: Low to High"
    | "Id: High to Low"
    | "Title: A to Z"
    | "Title: Z to A"
    | "Decision: Yes to No"
    | "Decision: No to Yes"
    | "Year: Oldest to Newest"
    | "Year: Newest to Oldest";

/**
 * List of all allowed sorting options from which the user can select.
 */
export const ALLOWED_SORT_OPTIONS: Record<SortOptionLabel, SortOption> = {
    "Id: Low to High": {
        criterion: SortCriteria.PAPER_ID,
        direction: SortDirection.ASC,
    },
    "Id: High to Low": {
        criterion: SortCriteria.PAPER_ID,
        direction: SortDirection.DESC,
    },
    "Title: A to Z": {
        criterion: SortCriteria.PAPER_TITLE,
        direction: SortDirection.ASC,
    },
    "Title: Z to A": {
        criterion: SortCriteria.PAPER_TITLE,
        direction: SortDirection.DESC,
    },
    "Decision: Yes to No": {
        criterion: SortCriteria.DECISION,
        direction: SortDirection.ASC,
    },
    "Decision: No to Yes": {
        criterion: SortCriteria.DECISION,
        direction: SortDirection.DESC,
    },
    "Year: Oldest to Newest": {
        criterion: SortCriteria.YEAR,
        direction: SortDirection.ASC,
    },
    "Year: Newest to Oldest": {
        criterion: SortCriteria.YEAR,
        direction: SortDirection.DESC,
    },
};

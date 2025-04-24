import { PaperDecision, type Project_Paper } from "$lib/model/api/project";
import type { PaperStatus } from "$lib/model/general";

/**
 * Convert a person object (\{ firstName: "...", lastName, "..." \}) to its string representation
 * "\<firstName\> \<lastName\>.
 */
function getName(person: { firstName: string; lastName: string }): string {
    return `${person.firstName} ${person.lastName}`;
}

/**
 * Combine the first- and last name of the persons array into a string as following:
 * [\{ firstName: "John", lastName: "Doe", ... \}, ... ] --\> "John Doe, ..."
 *
 * @param persons - the list of objects, which at least have a firstName (of type string) and a lastName (of type string)
 *          as object properties. More object properties are allowed and ignored.
 * @returns the names of the persons as string (\<first name\> \<last name\>) concatenated and separated by an ','.
 *          If there is only one person, only the person's name is shown and
 *          if there is no person, an empty string is returned.
 */
function getNames(persons: { firstName: string; lastName: string }[]): string {
    return persons.map((person) => getName(person)).join(", ");
}

/**
 * Checks, whether a given paper is undecided, i.e. unreviewed or has the review status
 * "Maybe".
 *
 * @returns true, if the paper is either unreviewed or has the status "Maybe", otherwise false
 */
function isPaperUndecided(paper: Project_Paper): boolean {
    return (
        paper.decision === PaperDecision.UNREVIEWED || paper.decision === PaperDecision.IN_REVIEW
    );
}

/**
 * Checks, whether a given paper needs further reviews, i.e. it is either undecided (see {@link isPaperUndecided})
 * or has less than the required number of reviews.
 *
 * @returns true, if the paper needs further reviews, otherwise false
 */
function doesPaperNeedReview(paper: Project_Paper, numberOfRequiredReviews: number): boolean {
    return isPaperUndecided(paper) || paper.reviews.length < numberOfRequiredReviews;
}

/**
 * Use to check for exhaustiveness of a switch statement.
 *
 * Usage:
 * ```ts
 * const value: 'a' | 'b' = ...;
 * switch (value) {
 *    case 'a':
 *      return 1;
 *   case 'b':
 *     return 2;
 *  default:
 *   return exhaustiveCheck(value);
 * }
 * ```
 *
 * @param x - the value that should not be reached.
 */
function exhaustiveCheck(x: never): never {
    throw new Error(`Unhandled case: ${x}`);
}

/**
 * Returns either the plural or singular form of a word based on the count.
 *
 * @param count - the number of items
 * @param singular - the singular form of the word
 * @param plural - the plural form of the word
 * @returns the singular form if count is 1, otherwise the plural form
 */
function pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
}

/**
 * Groups a list by keys.
 * The keys are indirectly given by the keySelector function.
 *
 * Inspired by: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
 *
 * @param list - the list to be grouped
 * @param keySelector - function that map a (list) item to a certain key
 * @returns the grouped list as an object with the association key: \<list of items associated to key\>
 */
function groupBy<T>(list: T[], keySelector: (arg0: T) => string): Record<string, T[]> {
    return list.reduce((result: Record<string, T[]>, item: T) => {
        (result[keySelector(item)] ??= []).push(item);
        return result;
    }, {});
}

type ColorPrefix = "border" | "text" | "bg" | "fill";
const statusColors: Record<PaperStatus, Record<ColorPrefix, string>> = {
    Accepted: {
        border: "border-accept-green",
        text: "text-accept-green",
        fill: "fill-accept-green",
        bg: "bg-accept-green",
    },
    Declined: {
        border: "border-decline-red",
        text: "text-decline-red",
        fill: "fill-decline-red",
        bg: "bg-decline-red",
    },
    Undecided: {
        border: "border-maybe-yellow",
        text: "text-maybe-yellow",
        fill: "fill-maybe-yellow",
        bg: "bg-maybe-yellow",
    },
    "Not reviewed": {
        border: "border-unreviewed-gray",
        text: "text-unreviewed-gray",
        fill: "fill-unreviewed-gray",
        bg: "bg-unreviewed-gray",
    },
};

/**
 * Maps the paper status to the corresponding color.
 *
 * @param status - the status of the paper
 * @param prefix - the prefix indicating wherefore the color should be used (possible values: "border", "fill", "text" or "bg")
 * @returns the color according to the status and prefix or 'text-unreviewed-gray' if either the status or prefix are not valid
 */
function getStatusColor(status: PaperStatus, prefix: ColorPrefix = "text"): string {
    return statusColors[status]?.[prefix] ?? "text-unreviewed-gray";
}

/**
 * Maps the paper decision to the corresponding text.
 *
 * @param paperDecision - the paper decision
 * @returns the review status ("Accepted", "Declined", "Undecided" or "Not reviewed")
 */
function getStatusText(paperDecision: PaperDecision): PaperStatus {
    switch (paperDecision) {
        case PaperDecision.ACCEPTED:
            return "Accepted";
        case PaperDecision.DECLINED:
            return "Declined";
        case PaperDecision.IN_REVIEW:
            return "Undecided";
        case PaperDecision.UNREVIEWED:
        case PaperDecision.UNSPECIFIED:
            return "Not reviewed";
        default:
            exhaustiveCheck(paperDecision);
    }
}

/**
 * Compares two paper ids.
 *
 * Both ids are expected to be in the format '#<number>'. The comparison is done by comparing the numbers.
 *
 * @param a - Id of the first paper
 * @param b - Id of the second paper
 * @returns a negative number if a is less than b, a positive number if a is greater than b, and 0 if a is equal to b
 */
function comparePaperId(a: string, b: string): number {
    const idA = parseInt(a.slice(1), 10);
    const idB = parseInt(b.slice(1), 10);
    const compare = idA - idB;
    return isNaN(compare) ? 0 : compare;
}

/**
 * Handles a click event by checking
 * whether it was a single click (so no further click after 350ms) or a double click
 * and call the corresponding functions:
 *  - single click =\> onSingleClick()
 *  - double click =\> onDoubleClick()
 */
function handleSingleOrDoubleClick(onSingleClick: () => void, onDoubleClick: () => void) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return () => {
        if (timeoutId === null) {
            timeoutId = setTimeout(() => {
                timeoutId = null;
                onSingleClick();
            }, 350);
        } else {
            clearTimeout(timeoutId);
            timeoutId = null;
            onDoubleClick();
        }

        return timeoutId;
    };
}

export {
    getName,
    getNames,
    isPaperUndecided,
    doesPaperNeedReview,
    exhaustiveCheck,
    pluralize,
    groupBy,
    getStatusColor,
    getStatusText,
    comparePaperId,
    handleSingleOrDoubleClick,
};

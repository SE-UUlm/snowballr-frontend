import { PaperDecision, type Project_Paper } from "$lib/model/api/project";
import type { PaperStatus } from "$lib/model/general";

/**
 * Convert a person object ({firstName: "...", lastName, "..."}) to its string representation
 * "\<firstName\> \<lastName\>.
 */
function getName(person: { firstName: string; lastName: string }): string {
    return `${person.firstName} ${person.lastName}`;
}

/**
 * Combine the first- and lastname of the persons array into a string as following:
 * [{firstName: "John", lastName: "Doe", ...}, ... ] -->
 * "John Doe, ..."
 *
 * @param persons The list of objects, which at least have a firstName (of type string) and a lastName (of type string)
 *          as object properties. More object properties are allowed and ignored.
 * @return The names of the persons as string (<first name> <last name>) concatenated and separated by an ','.
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
 * @return true, if the paper is either unreviewed or has the status "Maybe", otherwise false
 */
function isPaperUndecided(paper: Project_Paper): boolean {
    return paper.decision === PaperDecision.UNDECIDED;
}

/**
 * Checks, whether a given paper needs further reviews, i.e. it is either undecided (see {@link isPaperUndecided})
 * or has less than the required number of reviews.
 *
 * @return true, if the paper needs further reviews, otherwise false
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
 * @param x - The value that should not be reached.
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
 * @param list - The list to be grouped
 * @param keySelector - Function that map a (list) item to a certain key
 * @return The grouped list
 */
function groupBy<T>(list: T[], keySelector: (arg0: T) => string): { [key: string]: T[] } {
    return list.reduce((result: { [key: string]: T[] }, item: T) => {
        (result[keySelector(item)] ??= []).push(item);
        return result;
    }, {});
}

/**
 * Mapping of the paper status to the corresponding color.
 *
 * @param status - The status of the paper
 * @return The color accordingly to the status
 */
function getStatusColor(status: PaperStatus): string {
    switch (status) {
        case "Accepted":
            return "text-accept-green";
        case "Declined":
            return "text-decline-red";
        case "Undecided":
            return "text-maybe-yellow";
        case "Not reviewed":
            return "text-unreviewed-gray";
        default:
            exhaustiveCheck(status);
    }
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
};

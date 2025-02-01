import { type Paper, ReviewDecision } from "$lib/model/backend";

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
function isPaperUndecided(paper: Paper): boolean {
    return (
        paper.reviewData === undefined || paper.reviewData.finalDecision === ReviewDecision.Maybe
    );
}

/**
 * Checks, whether a given paper needs further reviews, i.e. it is either undecided (see {@link isPaperUndecided})
 * or has less than the required number of reviews.
 *
 * @return true, if the paper needs further reviews, otherwise false
 */
function doesPaperNeedReview(paper: Paper, numberOfRequiredReviews: number): boolean {
    return (
        isPaperUndecided(paper) || (paper.reviewData?.reviews.length ?? 0) < numberOfRequiredReviews
    );
}

export { getName, getNames, isPaperUndecided, doesPaperNeedReview };

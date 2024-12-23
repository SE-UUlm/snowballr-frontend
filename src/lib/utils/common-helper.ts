function getNameAsString(person: { firstName: string; lastName: string }): string {
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
    return persons.map((person) => getNameAsString(person)).join(", ");
}

export { getNames };

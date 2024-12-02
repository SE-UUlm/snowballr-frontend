import { z } from "zod";

/**
 * Schema for the first name of a user.
 */
const firsNameSchema = z
    .string()
    .min(1, { message: "First Name must contain at least 1 character" })
    .max(100, { message: "First Name must contain at most 100 characters" });

/**
 * Schema for the last name of a user.
 */
const lastNameSchema = z
    .string()
    .min(1, { message: "Last Name must contain at least 1 character" })
    .max(100, { message: "Last Name must contain at most 100 characters" });

/**
 * Schema for the email of a user.
 */
const emailSchema = z.string().email({ message: "Email must have valid format" });

const upperCaseLetters = "A-Z";
const lowerCaseLetters = "a-z";
const numbers = "0-9";
const specialCharacters = "#$%&@^`~.,:;\"'\\\\/|_\\-<>*+!?={[()\\]}";
const passwordRegex = new RegExp(
    `^[${upperCaseLetters}${lowerCaseLetters}${numbers}${specialCharacters}]*$`,
);
function hasMinNumberOfCharacterSet(password: string, characterSet: string, minNumber: number) {
    const regExp = new RegExp(`[${characterSet}]`, "g");
    const matches = password.match(regExp);
    return matches ? matches.length >= minNumber : false;
}
/**
 * Schema for the password of a user.
 */
const passwordSchema = z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" })
    .max(128, { message: "Password must contain at most 128 characters" })
    .refine((password) => passwordRegex.test(password), {
        message: `Password must contain only lower or upper case letters, numbers and the following special characters ${specialCharacters}`,
    })
    .refine((password) => hasMinNumberOfCharacterSet(password, upperCaseLetters, 2), {
        message: "Password must contain at least 2 upper case letters",
    })
    .refine((password) => hasMinNumberOfCharacterSet(password, lowerCaseLetters, 2), {
        message: "Password must contain at least 2 lower case letters",
    })
    .refine((password) => hasMinNumberOfCharacterSet(password, numbers, 2), {
        message: "Password must contain at least 2 numbers",
    })
    .refine((password) => hasMinNumberOfCharacterSet(password, specialCharacters, 2), {
        message: `Password must contain at least 2 special characters (${specialCharacters})`,
    });

export const Schema = {
    firstName: firsNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
};

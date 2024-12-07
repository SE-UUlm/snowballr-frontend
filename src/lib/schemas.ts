import { z } from "zod";

export const ZodIssueSubCode = {
    non_blank: "non_blank",
    invalid_characters: "invalid_characters",
    not_enough_upper_case_letters: "not_enough_upper_case_letters",
    not_enough_lower_case_letters: "not_enough_lower_case_letters",
    not_enough_numbers: "not_enough_numbers",
    not_enough_special_characters: "not_enough_special_characters",
} as const;
export type ZodIssueSubCode = keyof typeof ZodIssueSubCode;

/**
 * Add a custom issue to the context.
 *
 * {@link z.ZodIssueCode} is not extensible, so we can't add custom issue codes.
 * Instead, we use the `custom` issue code and add a `subCode` parameter to distinguish
 * between different custom issues.
 *
 * @param context The context to add the issue to.
 * @param subCode The sub code of the issue.
 * @param message The message of the issue.
 */
function addCustomIssue(context: z.RefinementCtx, subCode: ZodIssueSubCode, message?: string) {
    return context.addIssue({
        code: z.ZodIssueCode.custom,
        params: { subCode },
        message,
    });
}

/**
 * Schema for the first name of a user.
 */
const firsNameSchema = z
    .string()
    .trim()
    .min(1, { message: "First Name must contain at least 1 non-whitespace character" })
    .max(100, { message: "First Name must contain at most 100 non-whitespace characters" });

/**
 * Schema for the last name of a user.
 */
const lastNameSchema = z
    .string()
    .trim()
    .min(1, { message: "Last Name must contain at least 1 non-whitespace character" })
    .max(100, { message: "Last Name must contain at most 100 non-whitespace characters" });

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
    .superRefine((password, context) => {
        if (!passwordRegex.test(password)) {
            addCustomIssue(
                context,
                ZodIssueSubCode.invalid_characters,
                `Password must contain only lower or upper case letters, numbers and the following special characters ${specialCharacters}`,
            );
        }

        if (!hasMinNumberOfCharacterSet(password, upperCaseLetters, 2)) {
            addCustomIssue(
                context,
                ZodIssueSubCode.not_enough_upper_case_letters,
                "Password must contain at least 2 upper case letter",
            );
        }

        if (!hasMinNumberOfCharacterSet(password, lowerCaseLetters, 2)) {
            addCustomIssue(
                context,
                ZodIssueSubCode.not_enough_lower_case_letters,
                "Password must contain at least 2 lower case letter",
            );
        }

        if (!hasMinNumberOfCharacterSet(password, numbers, 2)) {
            addCustomIssue(
                context,
                ZodIssueSubCode.not_enough_numbers,
                "Password must contain at least 2 numbers",
            );
        }

        if (!hasMinNumberOfCharacterSet(password, specialCharacters, 2)) {
            addCustomIssue(
                context,
                ZodIssueSubCode.not_enough_special_characters,
                `Password must contain at least 2 special characters (${specialCharacters})`,
            );
        }
    });

/**
 * Schemas, used for input validation.
 */
export const Schema = {
    firstName: firsNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
};

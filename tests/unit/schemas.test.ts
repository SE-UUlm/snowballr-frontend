import { Schema, ZodIssueSubCode } from "$lib/schemas";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

/**
 * Wrapper for `describe` that provides a `testValid` and `testInvalid` function.
 *
 * Usage:
 * - to test a valid input, use `testValid(input)`
 * - to test a valid input with a different expected output, use `testValid(input, expectedOutput)`
 * - to test an invalid input and match all error codes, use `testInvalid(input, { codes: [...] })`
 * - to test an invalid input and match a subset of error codes, use `testInvalid(input, { code: [...], checkAllCodes: false, })`
 * - to match the custom sub codes, use `customCode(ZodIssueSubCode.my_custom_subcode)`
 */
function schemaTest(
    name: string,
    schema: z.ZodFirstPartySchemaTypes,
    func: (testValid: typeof _testValid, testInvalid: typeof _testInvalid) => void,
) {
    function getErrorMessage(result?: z.ZodError): string {
        return result?.errors.map((error) => error.message).join("\n") ?? "<no error message>";
    }

    /**
     * Test for successful validation.
     *
     * @param input The input to validate.
     * @param expectedOutput The expected output of the validation.
     */
    function _testValid(input: string, expectedOutput: string = input) {
        const result = schema.safeParse(input);
        expect(
            result.success,
            `Input validation failed for '${input}': ${getErrorMessage(result.error)}`,
        ).toBe(true);
        expect(result.data, "Validation data doesn't match expected output").toBe(expectedOutput);
    }

    function formatError(error: z.ZodIssue) {
        if (error.code === z.ZodIssueCode.custom) {
            return `${error.code}:${error.params?.subCode}`;
        } else {
            return error.code;
        }
    }

    /**
     * Test for failed validation.
     *
     * @param input The input to validate.
     * @param codes The error codes that should be included in the validation.
     * @param checkAllCodes If true, all error codes must be present in the validation and no other codes should be present.
     */
    function _testInvalid(input: string, config: { codes: string[]; checkAllCodes?: boolean }) {
        const { codes, checkAllCodes } = { checkAllCodes: true, ...config };
        const result = schema.safeParse(input);
        expect(result.success, `Input validation was unexpectedly successful for '${input}'`).toBe(
            false,
        );

        const errorCodes = result.error?.errors.map(formatError) ?? [];
        if (checkAllCodes) {
            checkForAllCodes(errorCodes, codes, input);
        } else {
            checkForCodeSelection(errorCodes, codes, input);
        }
    }

    /**
     * Asserts that all codes are present in the error codes and vice versa.
     */
    function checkForAllCodes(errorCodes: string[], codes: string[], input: string) {
        const checkedCodes: string[] = [];
        for (const errorCode of errorCodes) {
            const expectedCode = codes.find((code) => code === errorCode);
            if (expectedCode) {
                checkedCodes.push(expectedCode);
            }
            assert(
                expectedCode !== undefined,
                `Error code '${errorCode}' was expected for input '${input}'`,
            );
        }

        // Check if all error codes were found
        const nonIncludedCodes = codes.filter((code) => !checkedCodes.includes(code));
        assert(
            nonIncludedCodes.length === 0,
            `The codes '${nonIncludedCodes}' were not found for input '${input}'\nError codes: ${errorCodes.join(", ")}`,
        );
    }

    /**
     * Asserts that all codes are present in the error codes.
     */
    function checkForCodeSelection(errorCodes: string[], codes: string[], input: string) {
        for (const code of codes) {
            assert(
                errorCodes.includes(code),
                `Error codes don't include '${code}' for input '${input}'`,
            );
        }
    }

    describe(name, () => {
        func(_testValid, _testInvalid);
    });
}

function customCode(subCode: ZodIssueSubCode): string {
    return `custom:${subCode}`;
}

schemaTest("First Name Schema", Schema.firstName, (testValid, testInvalid) => {
    test.each(["", " ", "  "])("When first name is blank, then validation fails", (input) => {
        testInvalid(input, { codes: [z.ZodIssueCode.too_small] });
    });

    test("When first name is more than 100 characters long, then validation fails", () => {
        testInvalid("a".repeat(101), { codes: [z.ZodIssueCode.too_big] });
    });

    test.each(Array.from({ length: 100 }, (_, i) => i + 1))(
        "When first name is %f character(s) long, then validation passes",
        (length) => {
            testValid("a".repeat(length));
        },
    );

    test.each(["John", "John Bob", "John-Bob", "Al", "I", "Éstrel", "Thaddäus"])(
        "When valid first name '%s' is tested, then validation passes",
        (input) => {
            testValid(input);
        },
    );

    test.each([" John", "John ", " John "])(
        "When first name '%s' has leading or trailing spaces, then spaces are trimmed in result",
        (input) => {
            testValid(input, "John");
        },
    );
});

schemaTest("Last Name Schema", Schema.lastName, (testValid, testInvalid) => {
    test.each(["", " ", "  "])("When last name is blank, then validation fails", (input) => {
        testInvalid(input, { codes: [z.ZodIssueCode.too_small] });
    });

    test("When last name is more than 100 characters long, then validation fails", () => {
        testInvalid("a".repeat(101), { codes: [z.ZodIssueCode.too_big] });
    });

    test.each(Array.from({ length: 100 }, (_, i) => i + 1))(
        "When last name is more than %f character(s) long, then validation passes",
        (length) => {
            testValid("a".repeat(length));
        },
    );

    test.each(["Doe", "Doe Jr.", "Doe-Smith", "Ji", "O", "Años", "Hönes"])(
        "When valid last name '%s' is tested, then validation passes",
        (input) => {
            testValid(input);
        },
    );

    test.each([" Doe", "Doe ", " Doe "])(
        "When last name '%s' has leading or trailing spaces, then spaces are trimmed in result",
        (input) => {
            testValid(input, "Doe");
        },
    );
});

schemaTest("Email Schema", Schema.email, (testValid, testInvalid) => {
    test.each([
        "",
        " ",
        "a",
        "john.doe",
        "john@doe",
        "john.doe@",
        "john.doe@.",
        "john.doe@a.b",
        "john.doe@com",
        "john.doe@com.",
        "john.doe@.com",
        "john.doe@com..",
        "john.doe@.com.",
    ])("When invalid email '%s' is tested, then validation fails", (input) => {
        testInvalid(input, { codes: [z.ZodIssueCode.invalid_string] });
    });

    test.each([" john.doe@example.com", "john.doe@example.com ", " john.doe@example.com "])(
        "When email '%s' with trailing or leading spaces is tested, then validation fails",
        (input) => {
            testInvalid(input, { codes: [z.ZodIssueCode.invalid_string] });
        },
    );

    test.each(["john.doe@example.com", "john@example.com", "a@b.cd"])(
        "When valid email '%s' is tested, then validation passes",
        (input) => {
            testValid(input);
        },
    );
});

schemaTest("Password Schema", Schema.password, (testValid, testInvalid) => {
    test.each(Array.from(Array(8).keys()))(
        "When password is less than %f character(s) long, then validations fails",
        (length) => {
            testInvalid("a".repeat(length), {
                codes: [z.ZodIssueCode.too_small],
                checkAllCodes: false,
            });
        },
    );

    test("When password is more than 128 characters long, then validations fails", () => {
        testInvalid("a".repeat(129), { codes: [z.ZodIssueCode.too_big], checkAllCodes: false });
    });

    test("When input contains less than 2 upper case letters, then validation fails", () => {
        testInvalid("A", {
            codes: [customCode(ZodIssueSubCode.not_enough_upper_case_letters)],
            checkAllCodes: false,
        });
    });

    test("When input contains less than 2 lower case letters, then validation fails", () => {
        testInvalid("a", {
            codes: [customCode(ZodIssueSubCode.not_enough_lower_case_letters)],
            checkAllCodes: false,
        });
    });

    test("When input contains less than 2 numbers, then validation fails", () => {
        testInvalid("1", {
            codes: [customCode(ZodIssueSubCode.not_enough_numbers)],
            checkAllCodes: false,
        });
    });

    test("When input contains less than 2 special characters, then validation fails", () => {
        testInvalid("!", {
            codes: [customCode(ZodIssueSubCode.not_enough_special_characters)],
            checkAllCodes: false,
        });
    });

    test("When input contains characters that are not allowed, then validation fails", () => {
        testInvalid("ûî", {
            codes: [customCode(ZodIssueSubCode.invalid_characters)],
            checkAllCodes: false,
        });
    });

    test.each([
        '#}A3)"P*%~-9M:L99{f-(m$M*gLb*&fo',
        "a'{x*_|_F7c`m\\+o$<U99,+nrZK;4}~E",
        'g`3"Ue3Cd$u{Us!\\F$;{,:>Pc~S"5-=',
        "*sT,$\\!e\\J:g}#]bS$fiv*$}f7bt7'(5",
        'H!_c=sE\'_y})";4_%yY{5d@"=Db5=5`-',
        'Rw&`a,Q54_.}yc\\V-#YK$*Mx<^x"rM)^',
        'yv{{*C2]=5?::-!3^vr+:-y"#9!Q@<T{',
        "[[Vu\\uz:&;D}z[3w+_/$S,K5'xE<*.gD",
        "dt)_$pE6s{);/4e=!\\%gvd*F`@&C,>U'",
        "g=KL\">/L]=*_@xd]]',7Z^:(QY{*$7AQ",
    ])("When valid password '%s' is tested, then validation passes", (input) => {
        testValid(input);
    });
});

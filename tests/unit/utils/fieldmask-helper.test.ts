import { describe, expect, test } from "vitest";
import { buildFieldMask } from "$lib/utils/fieldmask-helper";

describe("Build field mask", () => {
    test("When an empty object is provided, then an empty paths array is returned.", () => {
        expect(buildFieldMask("", {})).toEqual({ paths: [] });
    });

    test("When a simple object is provided without prefix, then field names are converted to snake_case.", () => {
        const input = {
            firstName: "John",
            lastName: "Doe",
            userId: 123,
        };
        expect(buildFieldMask("", input)).toEqual({
            paths: ["first_name", "last_name", "user_id"],
        });
    });

    test("When a nested object is provided without prefix, then nested paths are properly joined.", () => {
        const input = {
            personalInfo: {
                firstName: "John",
                lastName: "Doe",
            },
        };
        expect(buildFieldMask("", input)).toEqual({
            paths: ["personal_info.first_name", "personal_info.last_name"],
        });
    });

    test("When a prefix is provided, then it is prepended to all paths.", () => {
        const input = {
            firstName: "John",
            lastName: "Doe",
        };
        expect(buildFieldMask("user", input)).toEqual({
            paths: ["user.first_name", "user.last_name"],
        });
    });

    test("When a complex nested object is provided with prefix, then all nested paths are properly prefixed.", () => {
        const input = {
            personalInfo: {
                firstName: "John",
                lastName: "Doe",
                contactDetails: {
                    emailAddress: "john@example.com",
                    phoneNumber: "1234567890",
                },
            },
        };
        expect(buildFieldMask("user", input)).toEqual({
            paths: [
                "user.personal_info.first_name",
                "user.personal_info.last_name",
                "user.personal_info.contact_details.email_address",
                "user.personal_info.contact_details.phone_number",
            ],
        });
    });
});

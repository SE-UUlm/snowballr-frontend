import type { FieldMask } from "$lib/model/api/google/protobuf/field_mask";
import { generateFieldMask } from "protobuf-fieldmask";

/**
 * Convert a string in camelCase- / PascalCase-style to snake_case-style.
 *
 * Therefore, insert '_' before uppercase letters and lowercase everything
 *
 * @example
 *  - "firstName" becomes "first_name"
 *  - "URLPath" becomes "url_path"
 */
function camelToSnakeCase(s: string): string {
    return s
        .replace(/([A-Z])/g, "_$1")
        .replace(/^_/, "")
        .toLowerCase();
}

/**
 * Builds a FieldMask object based on the given data object and an optional prefix.
 *
 * The field mask is generated using the `generateFieldMask()` function of the "protobuf-fieldmask"
 * package, which extracts the property / field paths in camelCase. Then the field names are
 * converted to snake_case and prefixed.
 *
 * @example
 * buildFieldMask("user", \{ id: "123", firstName: "John" \}) // returns \{ paths: [ "user.id", "user.first_name" ] \}
 *
 * @param dataObj - The data object for which the field mask needs to be generated.
 * @param prefix - An optional string to prepend to each field path. Defaults to "".
 * @returns A FieldMask object containing the path array that lists all the fields in snake_case format.
 */
export function buildFieldMask<T>(dataObj: T, prefix: string = ""): FieldMask {
    const fields = generateFieldMask(dataObj);

    const paths = fields.map((field) => {
        // filter(Boolean) is needed to remove empty strings after the split, e.g. "foo.bar."
        // becomes ["foo", "bar"] instead of ["foo", "bar", ""]
        const path = field.split(".").filter(Boolean).map(camelToSnakeCase);
        return prefix === "" ? path.join(".") : `${prefix}.${path.join(".")}`;
    });

    return { paths };
}

import { Configuration, ProjectsControllerApi } from "@se-uulm/snowballr-api-client";
import { env } from "$env/dynamic/public";

// If no PUBLIC_API_BASE_URL is defined, log an error and exit.
// Without the base URL, we cannot make any API calls.
if (!env.PUBLIC_API_BASE_URL) {
    console.error("PUBLIC_API_BASE_URL is not defined");
    process.exit(1);
}

const credentials: RequestCredentials =
    (env.PUBLIC_CREDENTIAL_POLICY as RequestCredentials) ?? "same-origin";

const configuration = new Configuration({
    basePath: env.PUBLIC_API_BASE_URL,
    credentials: credentials,
});

export const restService = flattenApis([new ProjectsControllerApi(configuration)]);

/**
 * Converts a union type to an intersection type.
 */
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

/**
 * Flattens multiple API instances into a single object with all methods.
 * Throws an error if there are duplicate method names across instances.
 *
 * @param instances - An array of API instances to flatten.
 * @returns An object containing all methods from the provided API instances.
 */
function flattenApis<T extends object[]>(instances: [...T]): UnionToIntersection<T[number]> {
    const merged: Record<string, unknown> = {};

    for (const instance of instances) {
        let proto = Object.getPrototypeOf(instance);

        while (proto && proto !== Object.prototype) {
            for (const key of Object.getOwnPropertyNames(proto)) {
                const value = (instance as Record<string, unknown>)[key];

                if (key === "constructor" || typeof value !== "function") continue;
                if (key in merged) {
                    throw new Error(`Duplicate API method name across controllers: ${key}`);
                }

                merged[key] = value.bind(instance);
            }

            proto = Object.getPrototypeOf(proto);
        }
    }

    return merged as UnionToIntersection<T[number]>;
}

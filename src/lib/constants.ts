import { env } from "$env/dynamic/public";

/**
 * Indicates whether the application is running in development mode.
 * Set by the PUBLIC_IS_DEV_MODE environment variable.
 */
export const IS_IN_DEV_MODE = env.PUBLIC_IS_DEV_MODE === "true";

/**
 * Indicates whether the application is running in test mode (e.g., during automated tests).
 *
 * Set by the NODE_ENV environment variable.
 */
export const IS_IN_TEST_MODE = process.env.NODE_ENV === "test";

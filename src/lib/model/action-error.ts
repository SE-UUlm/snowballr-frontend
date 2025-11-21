import type { AlertVariant } from "$lib/components/composites/utils/Alert.svelte";
import { env } from "$env/dynamic/public";

/**
 * Standardized error/warning object for action error handling.
 */
export type ActionError =
    | {
          errorTitle: string;
          errorDetails?: string;
          variant: AlertVariant;
      }
    | undefined;

/**
 * Details for an ActionError, either a description of the action that failed or whole custom details.
 */
export type ActionErrorDetails = { action: string } | { customDetails: string };

export function isActionError(error: unknown): error is ActionError {
    if (typeof error === "object" && error !== null) {
        return "errorTitle" in error && "errorDetails" in error && "variant" in error;
    }
    return false;
}

/**
 * Creates a standardized ActionError object for error handling in actions.
 *
 * @param title - The title of the error message (prefer Title Case). E.g., "Failed to Save Changes".
 * @param details - Details about the error, either a description of the action that failed or custom details.
 * E.g., `{ actionDescription: "saving your changes" }` or `{ customDetails: "The server is unreachable." }`.
 * @param error - (Optional) The original Error object that triggered this ActionError.
 * @returns a standardized ActionError object.
 */
export function createActionError(
    title: string,
    details: ActionErrorDetails,
    error: Error | undefined = undefined,
): ActionError {
    if (error && env.PUBLIC_IS_DEV_MODE === "true") {
        console.error(`Action Error - '${title}':`, error);
    }
    return {
        errorTitle: title,
        errorDetails: getErrorDetails(details),
        variant: "error",
    };
}

/**
 * Creates a standardized ActionError object for warning handling in actions.
 *
 * @param title - The title of the warning message (prefer Title Case). E.g., "No Changes Detected".
 * @param details - Details for the warning, either a description of the action that triggered the warning or whole custom details.
 * E.g., `{ actionDescription: "updating your profile" }` or `{ customDetails: "You did not make any changes to your profile." }`.
 * @returns a standardized ActionError object.
 */
export function createActionWarning(title: string, details: ActionErrorDetails): ActionError {
    return {
        errorTitle: title,
        errorDetails: getErrorDetails(details),
        variant: "warning",
    };
}

function getErrorDetails(details: ActionErrorDetails): string {
    if ("customDetails" in details) {
        return details.customDetails;
    } else {
        return getDefaultErrorDetails(details.action);
    }
}

function getDefaultErrorDetails(action: string): string {
    return `Something went wrong while ${action}. Please make sure your internet connection is stable, then try again.`;
}

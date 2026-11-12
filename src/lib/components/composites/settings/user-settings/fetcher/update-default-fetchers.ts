import { setDefaultFetchers } from "$lib/api/user";
import { createActionError, type ActionError } from "$lib/model/action-error";
import type { Fetchers } from "$lib/components/composites/settings/fetcher/fetcher";
import type { UserSettings } from "$lib/api/types";
import { toast } from "svelte-sonner";

export async function updateDefaultFetchers(
    fetchers: Fetchers,
    onSuccess: (updatedUserSettings: UserSettings) => void = () => {},
    onError: (error: ActionError) => void = () => {},
) {
    function onFulfilled(settings: UserSettings) {
        toast.success("Successfully updated your default fetcher settings.");
        onSuccess(settings);
    }

    function onRejected(error: Error) {
        toast.error("Error when updating your default fetcher settings.", {
            description: error.message,
        });
        onError(
            createActionError(
                "Default Fetcher Settings Update Failed",
                {
                    action: "updating your default fetcher settings",
                },
                error,
            ),
        );
    }

    await setDefaultFetchers(fetchers).then(onFulfilled, onRejected);
}

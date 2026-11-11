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
    await setDefaultFetchers(fetchers)
        .then((it) => {
            toast.success("Successfully updated your default fetcher settings.");
            onSuccess(it);
        })
        .catch((error) => {
            toast.error("Error when updating your default fetcher settings.", {
                description: error,
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
        });
}

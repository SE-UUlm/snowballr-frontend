import { backendService } from "$lib/grpc-api";
import { createActionError, type ActionError } from "$lib/model/action-error";
import type { Fetchers } from "$lib/components/composites/settings/fetcher/fetcher";
import { Project_Settings } from "$api/project";
import { UserSettings } from "$api/user_settings";
import { toast } from "svelte-sonner";

export async function updateDefaultFetchers(
    fetchers: Fetchers,
    onSuccess: (updatedUserSettings: UserSettings) => void = () => {},
    onError: (error: ActionError) => void = () => {},
) {
    await backendService
        .updateUserSettings({
            userSettings: UserSettings.create({
                defaultProjectSettings: Project_Settings.create({
                    fetchers: fetchers,
                }),
            }),
            // Manually set the path list because the generated field mask does not detect that the
            // map for the fetchers is set.
            mask: { paths: ["user_settings.default_project_settings.fetchers"] },
        })
        .response.then((it) => {
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

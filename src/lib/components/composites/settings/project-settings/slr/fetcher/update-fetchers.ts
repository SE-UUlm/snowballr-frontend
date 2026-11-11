import { backendService } from "$lib/grpc-api";
import { createActionError, type ActionError } from "$lib/model/action-error";
import type { Fetchers } from "$lib/components/composites/settings/fetcher/fetcher";
import { Project, Project_Settings } from "snowballr-api/project";
import { toast } from "svelte-sonner";
import { refreshProject } from "$lib/model/cache/project-cache";

export async function updateFetchers(
    projectId: string,
    fetchers: Fetchers,
    onSuccess: (updatedProject: Project) => void = () => {},
    onError: (error: ActionError) => void = () => {},
) {
    const projectData: Partial<Project> = {
        id: projectId,
        settings: Project_Settings.create({
            fetchers: fetchers,
        }),
    };

    await backendService
        .updateProject({
            project: Project.create(projectData),
            // Manually set the path list because the generated field mask does not detect that the
            // map for the fetchers is set.
            mask: { paths: ["project.settings.fetchers"] },
        })
        .response.then(async (it) => {
            // The project is loaded once by the project layout and is not reloaded when navigating
            // between settings tabs, so it has to be refreshed for a remounted section to read it.
            await refreshProject(it);
            toast.success("Successfully updated project settings.");
            onSuccess(it);
        })
        .catch((error) => {
            toast.error("Error when updating project.", {
                description: error,
            });
            onError(
                createActionError(
                    "Project Settings Update Failed",
                    {
                        action: "updating the project settings",
                    },
                    error,
                ),
            );
        });
}

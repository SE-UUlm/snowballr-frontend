import { backendService } from "$lib/grpc-api";
import type { FetcherOptions } from "$lib/model/api/fetcher";
import { Project, Project_Settings } from "$lib/model/api/project";
import type { ApiError } from "$lib/model/general";
import { toast } from "svelte-sonner";

export type Fetchers = { [key: string]: FetcherOptions };

export async function updateFetchers(
    projectId: string,
    fetchers: Fetchers,
    onSuccess: (updatedProject: Project) => void = () => {},
    onError: (error: ApiError) => void = () => {},
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
        .response.then((it) => {
            toast.success("Successfully updated project settings.");
            onSuccess(it);
        })
        .catch((error) => {
            toast.error("Error when updating project.", {
                description: error,
            });
            onError({
                errorTitle: "Project Settings Update Failed",
                errorDetails:
                    "Something went wrong when updating the project settings. Please make sure your internet connection is stable, then try again.",
            });
        });
}

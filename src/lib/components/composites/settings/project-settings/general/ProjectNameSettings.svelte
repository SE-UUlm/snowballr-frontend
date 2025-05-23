<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Button } from "$lib/components/primitives/button";
    import { backendService } from "$lib/grpc-api";
    import { onMount } from "svelte";
    import { Project } from "$lib/model/api/project";
    import { Schema } from "$lib/schemas";
    import { generateFieldMask } from "protobuf-fieldmask";
    import type { ApiError } from "$lib/model/general";
    import ErrorAlert from "$lib/components/composites/utils/ErrorAlert.svelte";
    import { invalidate } from "$app/navigation";
    import { LoaderCircle } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();

    let projectName: string = $state("");

    let projectNameInput: Input;

    let updateProjectError: ApiError | undefined = $state(undefined);

    let loading = $state(true);
    let showLoadingSpinner = $state(false);

    /**
     * Loading the project name on mount.
     */
    onMount(async () => {
        loadingProject
            .then((project) => {
                projectName = project.name;
                loading = false;
            })
            .catch((error) => {
                updateProjectError = {
                    errorTitle: "Something went wrong while loading the project name.",
                };
                console.error(`Couldn't load the project name: ${error}`);
            });
    });

    /**
     * Changes the name of the project, if a non-blank project name is provided.
     *
     * Therefore, send a request to the backend to update the project with the
     * provided name.
     */
    async function handleSubmit(event: Event) {
        updateProjectError = undefined;
        loading = showLoadingSpinner = true;
        event.preventDefault();
        const newProjectName: string = projectNameInput.getValue().trim();
        const projectNameValid = projectNameInput.validate();
        if (projectNameValid) {
            const projectData: Partial<Project> = {
                id: projectId,
                name: newProjectName,
            };
            const fieldMask = generateFieldMask(projectData);
            if (projectName === newProjectName) {
                toast.info("Please enter a new project name.");
            } else {
                try {
                    await backendService.updateProject({
                        project: Project.create(projectData),
                        mask: {
                            paths: fieldMask,
                        },
                    }).response;
                    projectName = newProjectName;
                    toast.success("Successfully updated project name.");
                    await invalidate("data:getProjectById");
                } catch (error) {
                    updateProjectError = {
                        errorTitle: "Something went wrong while updating the project name.",
                    };
                    console.error(`Couldn't update project: ${error}`);
                }
            }
        }
        loading = showLoadingSpinner = false;
    }
</script>

<!--
@component
Component for changing the project name settings.

Usage:
```svelte
    <ProjectNameSettings {loadingProject} {projectId}/>
```
-->
<SettingsSection sectionTitle="General">
    <form
        id="project-update"
        class="flex w-full max-w-xl flex-col items-center gap-2.5 md:h-fit md:max-w-xl md:flex-row md:items-start"
        onsubmit={handleSubmit}
    >
        <Input
            bind:this={projectNameInput}
            class="h-full w-full"
            disabled={loading}
            inputId="project-name-input"
            label="Project Name"
            placeholder={loading ? "Loading" : "New Project Name"}
            required
            schema={Schema.projectName}
            type="text"
            value={projectName}
        />
        <Button
            class="text-md w-full md:mt-5.5 md:w-42"
            disabled={loading}
            form="project-update"
            type="submit"
        >
            {#if showLoadingSpinner}
                <LoaderCircle class="animate-spin" />
                Renaming
            {:else}
                Rename
            {/if}
        </Button>
    </form>
    {#if updateProjectError}
        <div class="max-w-xl">
            <ErrorAlert errorTitle={updateProjectError.errorTitle} />
        </div>
    {/if}
</SettingsSection>

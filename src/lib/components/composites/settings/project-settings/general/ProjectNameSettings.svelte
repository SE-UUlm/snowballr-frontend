<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { backendService } from "$lib/grpc-api";
    import { onMount } from "svelte";
    import { Project } from "$api/project";
    import { Schema } from "$lib/schemas";
    import { invalidate } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { buildFieldMask } from "$lib/utils/fieldmask-helper";
    import {
        createActionError,
        createActionWarning,
        type ActionError,
    } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    let projectName: string = $state("");

    let projectNameInput: Input;

    let updateProjectError: ActionError = $state(undefined);

    let loadingProjectName = $state(false);
    const loading = $state({ value: false });

    /**
     * Loading the project name on mount.
     */
    onMount(async () => {
        loadingProjectName = true;
        await loadingProject
            .then((project) => {
                projectName = project.name;
            })
            .catch((error) => {
                updateProjectError = createActionError(
                    "Failed to Load the Project",
                    {
                        action: "loading the project name",
                    },
                    error,
                );
            });
        loadingProjectName = false;
    });

    /**
     * Changes the name of the project, if a non-blank project name is provided.
     *
     * Therefore, send a request to the backend to update the project with the
     * provided name.
     */
    async function handleSubmit(event: Event) {
        event.preventDefault();
        updateProjectError = undefined;

        if (!projectNameInput.validate()) return;

        const projectData: Partial<Project> = {
            id: projectId,
            name: projectNameInput.getValue(),
        };

        if (projectName === projectData.name) {
            updateProjectError = createActionWarning("No Changes Detected", {
                customDetails:
                    "To successfully change the project's name, you must provide a new one that is different from the current one.",
            });
            return;
        }

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: buildFieldMask(projectData, "project"),
            })
            .response.then(async () => {
                await invalidate("data:getProjectById");
                toast.success("Successfully updated project name.");
                projectName = projectData.name!;

                // Make sure that the input field is not focused after submitting
                (document.activeElement as HTMLElement)?.blur();
            })
            .catch((error) => {
                updateProjectError = createActionError(
                    "Failed to Update the Project",
                    {
                        action: "updating the project name",
                    },
                    error,
                );
            });
    }
</script>

<!--
@component
Component for changing the project name settings.

Usage:
```svelte
    <ProjectNameSettings {loadingProject} {projectId} />
```
-->
<SettingsSection sectionTitle="General">
    <form
        id="project-update"
        class="flex w-full max-w-100 flex-col items-center gap-2.5 md:h-fit md:max-w-150 md:flex-row md:items-start"
        onsubmit={(args) => loadingWrapper(loading, handleSubmit, args)}
    >
        <Input
            bind:this={projectNameInput}
            class="h-full w-full"
            disabled={loadingProjectName || loading.value || isProjectArchived}
            inputId="project-name-input"
            label="Project Name"
            placeholder={loadingProjectName ? "Loading" : "New Project Name"}
            required
            schema={Schema.projectName}
            type="text"
            value={projectName}
        />
        <LoadingButton
            class="text-md w-full md:mt-5.5 md:w-44 lg:w-42 xl:w-40"
            disabled={isProjectArchived}
            form="project-update"
            label="Rename"
            loading={loading.value}
            loadingLabel="Renaming"
            type="submit"
        />
    </form>
    <ActionErrorAlert class="max-w-100 md:max-w-150" error={updateProjectError} />
</SettingsSection>

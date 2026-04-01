<script lang="ts">
    import { goto } from "$app/navigation";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { buttonVariants } from "$lib/components/primitives/button";
    import Input from "$lib/components/primitives/input/input.svelte";
    import { backendService } from "$lib/grpc-api";
    import { createActionError } from "$lib/model/action-error";
    import type { Project } from "$api/project";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();

    const loading = $state({ value: false });
    let deleteProjectError = $state<unknown>(undefined);
    let open = $state(false);

    let projectName: string = $state("");
    let loadingProjectName = $state(false);

    let confirmationText = $state("");
    let canDeleteProject = $derived(
        confirmationText.length > 0 && confirmationText === projectName,
    );

    onMount(async () => {
        loadingProjectName = true;

        await loadingProject
            .then((project) => {
                projectName = project.name;
            })
            .catch((error) => {
                deleteProjectError = createActionError(
                    "Failed to Load the Project",
                    {
                        action: "loading the project name",
                    },
                    error,
                );
            });
        loadingProjectName = false;
    });

    async function deleteProject() {
        deleteProjectError = undefined;

        await backendService
            .softDeleteProject({ id: projectId })
            .response.then(async () => {
                toast.success(`Successfully deleted '${projectName}'.`);
                await goto("/");
            })
            .catch((error) => {
                deleteProjectError = error;
            });
    }
</script>

<!--
@component
Dialog to delete the current project.

Usage:
```svelte
    <DeleteProjectSettingsDialog {loadingProject} {projectId} />
```
-->
<AlertDialog
    actionButtonLoadingText="Delete This Project"
    actionButtonText="Delete This Project"
    actionProps={{
        class: "w-full sm:w-44",
        variant: "destructiveSubtle",
        disabled: loadingProjectName || !canDeleteProject,
        onclick: (args) => loadingWrapper(loading, deleteProject, args),
    }}
    cancelProps={{
        onclick: () => (confirmationText = ""),
    }}
    error={deleteProjectError}
    errorText="Couldn't delete this project"
    loading={loading.value}
    title="Delete This Project"
    triggerProps={{
        class: buttonVariants({ variant: "destructiveSubtle" }),
        "aria-label": "Delete this project",
    }}
    bind:open
>
    {#snippet trigger()}
        Delete Project
    {/snippet}
    {#snippet description()}
        Once deleted, the project cannot be accessed anymore. Ensure that no member is still
        conducting an SLR.
        <div class="flex flex-col gap-1 pt-2">
            <span>
                Enter <span class="font-bold">{projectName}</span> below to confirm the project deletion.
            </span>
            <Input data-testid="confirmation-input" bind:value={confirmationText} />
        </div>
    {/snippet}
</AlertDialog>

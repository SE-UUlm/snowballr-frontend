<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, ProjectStatus } from "$lib/model/api/project";
    import { invalidate } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { buildFieldMask } from "$lib/utils/fieldmask-helper";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";

    interface Props {
        projectId: string;
    }

    const { projectId }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    const settingsDescription = $derived(
        isProjectArchived
            ? "This project is archived. Reactivate it to make changes and continue your SLR."
            : "Archiving makes the project read-only. You’ll need to reactivate it to make any changes or continue the SLR.",
    );

    const loading = $state({ value: false });

    /**
     * Changes the status of the project.
     *
     * If the project is already archived, then activate it again; otherwise archive it.
     */
    async function handleSubmit(event: Event) {
        event.preventDefault();

        const projectData: Partial<Project> = {
            id: projectId,
            status: isProjectArchived ? ProjectStatus.ACTIVE : ProjectStatus.ARCHIVED,
        };

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: buildFieldMask(projectData, "project"),
            })
            .response.then(async () => {
                toast.success(
                    `Successfully ${isProjectArchived ? "activated" : "archived"} the project.`,
                );
                await invalidate("data:getProjectById");
            })
            .catch(() => {
                toast.error(`Could not ${isProjectArchived ? "activate" : "archive"} the project.`);
            });
    }
</script>

<!--
@component
Component for changing the project status to archived if the project is active or change the
status to active if the project is archived.

Usage:
```svelte
    <ArchiveProjectSettings {projectId}/>
```
-->
<SettingsSection sectionTitle="Archive Project">
    <p class="text-md">{settingsDescription}</p>
    <LoadingButton
        class="text-md w-full md:w-44"
        label={isProjectArchived ? "Activate Project" : "Archive Project"}
        loading={loading.value}
        loadingLabel={isProjectArchived ? "Activating Project" : "Archiving Project"}
        onclick={(args) => loadingWrapper(loading, handleSubmit, args)}
        type="submit"
    />
</SettingsSection>

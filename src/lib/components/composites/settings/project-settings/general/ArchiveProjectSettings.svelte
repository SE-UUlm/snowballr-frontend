<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, ProjectStatus } from "$lib/model/api/project";
    import { invalidate } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { buildFieldMask } from "$lib/utils/fieldmask-helper";
    import { resource } from "$lib/resource.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();

    const loadingIsProjectArchived = $derived(
        loadingProject.then((project) => project.status === ProjectStatus.ARCHIVED),
    );
    const isAlreadyArchived = $derived(
        resource(loadingIsProjectArchived, {
            initialValue: false,
            onErrorValue: false,
            resourceName: "project status",
        }),
    );

    const settingsDescription = $derived(
        isAlreadyArchived.value
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
            status: isAlreadyArchived.value ? ProjectStatus.ACTIVE : ProjectStatus.ARCHIVED,
        };

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: buildFieldMask(projectData, "project"),
            })
            .response.then(async () => {
                await invalidate("data:getProjectById");
                toast.success(
                    `Successfully ${isAlreadyArchived.value ? "activated" : "archived"} the project.`,
                );
            })
            .catch(() => {
                toast.error(
                    `Could not ${isAlreadyArchived.value ? "activate" : "archive"} the project.`,
                );
            });
    }
</script>

<!--
@component
Component for changing the project status to archived if the project is active or change the
status to active if the project is archived.

Usage:
```svelte
    <ArchiveProjectSettings {loadingProject} {projectId}/>
```
-->
<SettingsSection sectionTitle="Archive Project">
    <p class="text-md">{settingsDescription}</p>
    <LoadingButton
        class="text-md w-full md:w-44"
        label={isAlreadyArchived.value ? "Activate Project" : "Archive Project"}
        loading={loading.value}
        loadingLabel={isAlreadyArchived.value ? "Activating Project" : "Archiving Project"}
        onclick={(args) => loadingWrapper(loading, handleSubmit, args)}
        type="submit"
    />
</SettingsSection>

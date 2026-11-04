<script lang="ts">
    import { ProjectStatus } from "$api/project";
    import { setIsProjectArchivedContext } from "#lib/custom-context/is-project-archived-context.js";
    import { resource } from "#lib/resource.svelte.js";

    const { children, data } = $props();
    const { loadingProject } = $derived(data);

    const isProjectArchivedState = $state({
        isProjectArchived: false,
    });
    setIsProjectArchivedContext(isProjectArchivedState);

    const isProjectArchived = $derived(
        resource(loadingProject, {
            initialValue: false,
            onSuccess: (project) => project.status === ProjectStatus.ARCHIVED,
            onErrorValue: false,
            resourceName: "project status",
        }),
    );

    $effect(() => {
        isProjectArchivedState.isProjectArchived = isProjectArchived.value;
    });
</script>

{@render children()}

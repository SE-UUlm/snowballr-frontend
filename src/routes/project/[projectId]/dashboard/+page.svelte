<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import PaperListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";

    const { data } = $props();
    const { user, projectId, loadingProject, openReviews } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>{project.name}</title>
    {:catch}
        <title>Project Dashboard</title>
    {/await}
</svelte:head>
<ProjectNavigationBar defaultTabValue="dashboard" {loadingProject} {projectId} {user} />
<main class="flex flex-row h-full w-full mb-10 gap-x-5 overflow-hidden">
    <section class="h-full w-full">
        <NamedList
            emptyHint="No open reviews."
            items={openReviews}
            keySelector={(review) => review.paper.id}
            listName="Open Reviews"
            numberOfSkeletons={10}
            showNumberOfListItems={true}
        >
            {#snippet listItemComponent(componentData)}
                <PaperListEntry {...componentData} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <PaperListEntrySkeleton />
            {/snippet}
        </NamedList>
    </section>
    <section class="flex flex-col h-full w-full min-w-0 gap-y-5">Hallo</section>
</main>

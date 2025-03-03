<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import PaperListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import ProjectInformation from "$lib/components/composites/statistics-components/ProjectInformation.svelte";
    import { Separator } from "$lib/components/primitives/separator";

    const { data } = $props();
    const { user, projectId, loadingProject, openReviews, projectInformation } = data;
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
<main class="mb-10 flex h-full w-full flex-row gap-x-5 overflow-hidden">
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
    <section class="flex h-full w-full flex-col gap-y-5 p-5">
        <div id="project-information-section" class="flex flex-col gap-y-3">
            <h2>Project Information</h2>
            <Separator />
            <ProjectInformation {projectInformation} />
        </div>
    </section>
</main>

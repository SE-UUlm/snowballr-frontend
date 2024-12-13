<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import NamedList from "$lib/components/composites/utils/NamedList.svelte";
    import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
    import ProjectListEntrySkeleton from "$lib/components/composites/project-components/ProjectListEntrySkeleton.svelte";

    const { data } = $props();
    const { user, projectMetadata } = data;
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar {user} title="SnowballR" />
<main class="flex flex-row h-full w-full mb-10 gap-x-5 overflow-hidden">
    <!-- TODO: exchange by the NamedList for the open reviews -->
    <section class="flex flex-col h-full w-full px-5 gap-y-4">
        <h2>Open Reviews</h2>
    </section>
    <NamedList listName="Projects" items={projectMetadata} showNumberOfListItems={true}>
        {#snippet listItemComponent(componentData)}
            <ProjectListEntry {...componentData} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <ProjectListEntrySkeleton />
        {/snippet}
    </NamedList>
</main>

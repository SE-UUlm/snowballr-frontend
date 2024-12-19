<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
    import ProjectListEntrySkeleton from "$lib/components/composites/project-components/ProjectListEntrySkeleton.svelte";

    const { data } = $props();
    const { user, projectsMetadata } = data;
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar {user} title="SnowballR" />
<main class="flex flex-row h-full w-full mb-10 gap-x-5">
    <!-- TODO: exchange by the NamedList for the open reviews -->
    <section class="h-full w-full">
        <div class="flex flex-col h-full w-full px-5 gap-y-4">
            <h2>Open Reviews</h2>
        </div>
    </section>
    <section class="h-full w-full">
        <NamedList
            listName="Projects"
            items={projectsMetadata}
            numberOfSkeletons={10}
            showNumberOfListItems={true}
        >
            {#snippet listItemComponent(componentData)}
                <ProjectListEntry {...componentData} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <ProjectListEntrySkeleton />
            {/snippet}
        </NamedList>
    </section>
</main>

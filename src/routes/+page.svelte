<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
    import ProjectListEntrySkeleton from "$lib/components/composites/project-components/ProjectListEntrySkeleton.svelte";
    import PaperListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";

    const { data } = $props();
    const { user, projectsMetadata, openReviews } = data;
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar {user} title="SnowballR" />
<main class="flex flex-row h-full w-full mb-10 gap-x-5">
    <section class="h-full w-full">
        <NamedList
            listName="Open Reviews"
            items={openReviews}
            numberOfSkeletons={10}
            showNumberOfListItems={true}
            emptyHint="No open reviews."
        >
            {#snippet listItemComponent(componentData)}
                <PaperListEntry {...componentData} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <PaperListEntrySkeleton />
            {/snippet}
        </NamedList>
    </section>
    <section class="h-full w-full min-w-0">
        <NamedList
            listName="Projects"
            items={projectsMetadata}
            numberOfSkeletons={5}
            showNumberOfListItems={true}
            emptyHint="No active or archived projects."
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

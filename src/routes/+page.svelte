<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
    import ProjectListEntrySkeleton from "$lib/components/composites/project-components/ProjectListEntrySkeleton.svelte";
    import PaperListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import CreateProjectDialog from "$lib/components/composites/project-components/CreateProjectDialog.svelte";

    let { data } = $props();
    const { user, openReviews } = data;
    const { projectsMetadata } = $derived(data);
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar loadingTitle={Promise.resolve("SnowballR")} {user} />
<main class="mb-10 flex h-full w-full flex-row gap-x-10 overflow-hidden px-5">
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
    <section class="flex h-full w-full min-w-0 flex-col gap-y-5">
        <NamedList
            emptyHint="No active or archived projects."
            items={projectsMetadata}
            keySelector={(projectMetadata) => projectMetadata.project.id}
            listName="Projects"
            numberOfSkeletons={5}
            showNumberOfListItems={true}
        >
            {#snippet listItemComponent(componentData)}
                <ProjectListEntry {...componentData} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <ProjectListEntrySkeleton />
            {/snippet}
        </NamedList>
        <CreateProjectDialog {user} />
    </section>
</main>

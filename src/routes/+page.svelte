<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ProjectListEntry from "$lib/components/composites/project-components/ProjectListEntry.svelte";
    import ProjectListEntrySkeleton from "$lib/components/composites/project-components/ProjectListEntrySkeleton.svelte";
    import { Button } from "$lib/components/primitives/button";
    import { CirclePlus } from "lucide-svelte";
    import PaperListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";

    const { data } = $props();
    const { user, projectsMetadata, openReviews } = data;
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar {user} title="SnowballR" />
<main class="flex flex-row h-full w-full mb-10 gap-x-5 overflow-hidden">
    <!-- TODO: exchange by the NamedList for the open reviews -->
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
    <section class="flex flex-col h-full w-full min-w-0 gap-y-5">
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
        <div class="px-5">
            <!-- need to overwrite svg size in button, as the shadcn default button sets a default size
                 for possible icons, which cannot be overwritten by set the size inside the icon -->
            <Button class="h-fit w-full py-4 gap-2.5 text-xl [&_svg]:size-5">
                <CirclePlus strokeWidth="2.5" />
                Create Project
            </Button>
        </div>
    </section>
</main>

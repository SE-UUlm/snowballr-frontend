<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    window.addEventListener("unhandledrejection", function (event) {
        // the event object has two special properties:
        console.error(event.promise); // [object Promise] - the promise that generated the error
        console.error(event.reason); // Error: Whoops! - the unhandled error object
    });

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
    <p>
        {projectMetadata
            .then(() => {
                console.log(123);
                return 123;
            })
            .catch(() => {
                console.log(456);
                return 456;
            })}
    </p>
    <!--<NamedList listName="Projects" items={projectMetadata} showNumberOfListItems={true}>
        {#snippet listItemComponent(componentData)}
            <ProjectListEntry {...componentData} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <ProjectListEntrySkeleton />
        {/snippet}
    </NamedList>-->
</main>

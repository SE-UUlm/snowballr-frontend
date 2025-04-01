<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<svelte:head>
    <title>Reading List</title>
</svelte:head>
<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Reading List")} {user} />

<ReadingListEntry
    paper={{
        id: "0",
        externalId: "EXT12345",
        title: "An Analysis of TypeScript Performance",
        abstrakt:
            "This paper examines the performance characteristics of TypeScript in large-scale applications.",
        year: 2023,
        publisher: "Tech Journal",
        publicationName: "Journal of Modern Programming",
        publicationType: "Journal Article",
        hasPdf: true,
        authors: [
            { firstName: "John", lastName: "Doe", orcid: "0000-0001-2345-6789" },
            { firstName: "Bob", lastName: "Johnson", orcid: "0000-0004-5678-9012" },
        ],
        backwardReferencedIds: ["1", "2"],
    }}
/>

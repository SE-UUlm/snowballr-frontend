<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const { user, project } = data;
    const paper = {
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
            { firstName: "Jane", lastName: "Smith", orcid: "0000-0002-3456-7890" },
        ],
        backwardReferencedIds: ["1", "2"],
    };
</script>

<svelte:head>
    <title>Add Paper | {project.name}</title>
</svelte:head>
<PaperNavigationBar {user} backRef={`/project/${project.id}/dashboard`} {paper} />

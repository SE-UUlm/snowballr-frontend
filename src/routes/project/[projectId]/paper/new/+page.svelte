<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const { user, projectId, loadingProject } = data;
    const paper = {
        id: projectId,
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
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Add Paper | {project.name}</title>
    {:catch}
        <title>Add Paper</title>
    {/await}
</svelte:head>
{#await loadingProject}
    <p>Loading...</p>
{:then}
    <PaperNavigationBar
        {user}
        backRef={`/project/${projectId}/dashboard`}
        loadingPaper={Promise.resolve(paper)}
    />
{:catch error}
    <p>{error.message}</p>
{/await}

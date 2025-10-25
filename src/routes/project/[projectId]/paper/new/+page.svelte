<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const { projectId, loadingProject } = data;
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
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Smith" },
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
        backRef={`/project/${projectId}/dashboard`}
        loadingPaper={Promise.resolve(paper)}
        loadingPaperId={Promise.resolve(paper.id)}
    />
{:catch error}
    <p>{error.message}</p>
{/await}

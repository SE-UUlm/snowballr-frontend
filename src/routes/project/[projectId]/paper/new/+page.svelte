<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import type { PaperSpec } from "$lib/model/backend";

    const { data } = $props();
    const { user, project } = data;
    const paper: PaperSpec = {
        doi: "Doi",
        title: "Field-Sensitive Pointer Analysis for Static Dataflow in the R Programming Language",
        abstrakt: "Abstrakt",
        year: 2015,
        type: "Paper",
        authors: [
            { id: 0, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 1, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 2, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 3, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 4, firstName: "Foo", lastName: "Bar", orcid: "" },
        ],
        backwardReferencedPaperIds: [],
        forwardReferencedPaperIds: [],
    };
</script>

<svelte:head>
    <title>Add Paper | {project.name}</title>
</svelte:head>
<PaperNavigationBar {user} backRef={`/project/${project.id}/dashboard`} {paper} />

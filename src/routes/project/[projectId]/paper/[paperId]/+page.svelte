<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
    const paper = {
        id: data.paperId,
        title: "Field-Sensitive Pointer Analysis for Static Dataflow in the R Programming Language",
        authors: [
            "Author 1",
            "Author 2",
            "Author 3",
            "Author 4",
            "Author 5",
            "Author 6",
            "Author 7",
            "Author 8",
            "Author 9",
            "Author 10",
        ],
    };
</script>

<PaperNavigationBar {user} backRef={`/project/${data.projectId}/dashboard`} {paper} />

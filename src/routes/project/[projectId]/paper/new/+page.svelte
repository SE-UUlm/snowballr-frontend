<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
    const paper = {
        id: undefined,
        title: "Field-Sensitive Point...",
        authors: ["Author 1", "Author 2", "Author 3", "Author 4", "Author 5", "Aut..."],
    };
</script>

<PaperNavigationBar {user} backRef={`/project/${data.projectId}/dashboard`} {paper} />

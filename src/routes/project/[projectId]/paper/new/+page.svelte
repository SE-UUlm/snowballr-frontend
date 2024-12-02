<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import type { PaperSpec } from "$lib/types.js";

    const { data } = $props();
    const { user, project } = data;
    const paper: PaperSpec = {
        title: "Field-Sensitive Point...",
        authors: ["Author 1", "Author 2", "Author 3", "Author 4", "Author 5", "Aut..."],
        isBookmarked: false,
    };
</script>

<svelte:head>
    <title>Add Paper | {project.name}</title>
</svelte:head>
<PaperNavigationBar {user} backRef={`/project/${project.id}/dashboard`} {paper} />

<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const user = getCurrentUser();
</script>

<svelte:head>
    <title>Archived Projects</title>
</svelte:head>
<SimpleNavigationBar {user} title="Archived Projects" backRef="/" />

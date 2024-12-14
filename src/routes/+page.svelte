<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const user = getCurrentUser();
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar {user} title="SnowballR" />

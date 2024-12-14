<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const user = getCurrentUser();
</script>

<svelte:head>
    <title>Reading List</title>
</svelte:head>
<SimpleNavigationBar {user} title="Reading List" backRef="/" />

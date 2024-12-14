<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user";

    const { children } = $props();
    const user = getCurrentUser();
</script>

<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Settings")} {user} />

{@render children()}

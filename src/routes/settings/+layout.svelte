<script lang="ts">
    import SimpleNavigationBar from "$lib/components/custom/SimpleNavigationBar.svelte";

    const { children } = $props();

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
</script>

<SimpleNavigationBar {user} title="Settings" backRef="/" />

{@render children()}

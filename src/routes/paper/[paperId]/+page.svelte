<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const { user, paper } = data;
</script>

<PaperNavigationBar {user} backRef="/" {paper} />

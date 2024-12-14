<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { data } = $props();
    const { paper } = data;
    const user = getCurrentUser();
</script>

<svelte:head>
    <title>{paper.title}</title>
</svelte:head>
<PaperView
    {user}
    {paper}
    showButtonBar={false}
    backRef="/"
    userConfig={{ isReviewMode: false, showMaybeButton: false }}
/>

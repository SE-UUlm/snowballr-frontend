<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import PaperEntry from "$lib/components/composites/paper-components/PaperEntry.svelte";
    import { ReviewStatus } from "../types";

    const { data } = $props();
    const { user } = data;

    const paper = {
        id: 247,
        data: {
            title: "Field Sensitive Pointer Analysis for Static Data Flow in the R Programming Language",
            authors: ["Felix Schlegel", "Florian Sihler"],
        },
        showReviewStatus: true,
        reviewData: {
            individualReviews: [],
            finalDecision: ReviewStatus.Unreviewed,
        },
    };
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<div class="flex flex-col gap-3">
    <SimpleNavigationBar {user} title="SnowballR" tabs={[]} defaultTabValue="" />

    <PaperEntry {paper} />
</div>

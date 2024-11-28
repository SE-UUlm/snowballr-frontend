<script lang="ts">
    import PaperCard from "$lib/components/composites/paper-components/paper-view/cards/PaperCard.svelte";
    import PaperCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperCardContent.svelte";

    interface Props {
        tabs: {
            value: string;
            label: string;
        }[];
    }

    const { tabs }: Props = $props();
</script>

<PaperCard {tabs}>
    {#each tabs as tab}
        <PaperCardContent value={tab.value}>
            <p>{tab.label} content</p>
        </PaperCardContent>
    {/each}
</PaperCard>

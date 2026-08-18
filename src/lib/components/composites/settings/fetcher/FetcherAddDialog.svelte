<script lang="ts">
    import type { FetcherInformation } from "$api/fetcher";
    import Plus from "@lucide/svelte/icons/plus";
    import FetcherChangeDialog from "./FetcherChangeDialog.svelte";
    import type { Fetchers, SaveFetchers } from "./fetcher";

    interface Props {
        fetchers: Fetchers;
        fetcher: FetcherInformation;
        onSave: SaveFetchers;
        disabled: boolean;
    }

    let { fetchers, fetcher, onSave, disabled }: Props = $props();
</script>

<FetcherChangeDialog
    className="w-full sm:w-40"
    {disabled}
    {fetcher}
    {fetchers}
    label="Add Fetcher"
    loadingLabel="Adding Fetcher"
    {onSave}
    title={`Add ${fetcher.name} Fetcher`}
    triggerVariant="default"
>
    {#snippet trigger()}
        <Plus />
    {/snippet}
</FetcherChangeDialog>

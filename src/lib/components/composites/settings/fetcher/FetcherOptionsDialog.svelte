<script lang="ts">
    import SquarePen from "@lucide/svelte/icons/square-pen";
    import type { FetcherInformation } from "$api/fetcher";
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
    className="w-full sm:w-38"
    {disabled}
    {fetcher}
    {fetchers}
    label="Save Options"
    loadingLabel="Saving Options"
    {onSave}
    title={`Edit ${fetcher.name} Fetcher Options`}
    triggerVariant="ghost"
>
    {#snippet trigger()}
        <SquarePen />
    {/snippet}
</FetcherChangeDialog>

<script lang="ts">
    import SquarePen from "@lucide/svelte/icons/square-pen";
    import type { FetcherInformation } from "#lib/api/types.js";
    import FetcherChangeDialog from "#lib/components/composites/settings/fetcher/FetcherChangeDialog.svelte";
    import type { SaveFetchers } from "#lib/components/composites/settings/fetcher/fetcher.js";
    import type { Fetchers } from "#lib/api/fetcher.js";

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

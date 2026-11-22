<script lang="ts">
    import type { FetcherInformation } from "#lib/api/types.js";
    import Plus from "@lucide/svelte/icons/plus";
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

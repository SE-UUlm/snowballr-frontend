<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import type { ActionError } from "$lib/model/action-error";
    import Trash from "@lucide/svelte/icons/trash";
    import { cn } from "$lib/utils/shadcn-helper";
    import { buttonVariants } from "$lib/components/primitives/button";
    import type { FetcherInformation } from "$api/fetcher";
    import type { Fetchers, SaveFetchers } from "./fetcher";

    interface Props {
        fetchers: Fetchers;
        fetcher: FetcherInformation;
        onSave: SaveFetchers;
        disabled: boolean;
    }

    let { fetchers, fetcher, onSave, disabled }: Props = $props();

    let removeFetcherError: ActionError = $state(undefined);
    let open = $state(false);
    let loading = $state(false);

    async function removeFetcher() {
        loading = true;

        const updatedFetchers = { ...fetchers };
        delete updatedFetchers[fetcher.id];

        await onSave(
            updatedFetchers,
            () => (open = false),
            (it) => (removeFetcherError = it),
        );

        loading = false;
    }
</script>

<AlertDialog
    actionButtonLoadingText="Removing Fetcher"
    actionButtonText="Remove Fetcher"
    actionProps={{
        variant: "destructiveSubtle",
        onclick: removeFetcher,
        class: "w-full sm:w-42",
    }}
    cancelButtonText="Cancel"
    cancelProps={{
        disabled: loading,
    }}
    {loading}
    title={`Remove ${fetcher.name} Fetcher`}
    triggerProps={{
        class: cn(
            buttonVariants({ variant: "destructiveSubtle" }),
            "border-none bg-white hover:bg-red-400/10",
        ),
        disabled: disabled,
    }}
    bind:open
>
    {#snippet trigger()}
        <Trash />
    {/snippet}
    {#snippet description()}
        <p>
            Removing the fetcher also irreversibly removes the values of the options you may have
            configured.
        </p>
        <ActionErrorAlert error={removeFetcherError} />
    {/snippet}
</AlertDialog>

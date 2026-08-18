<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { type FetcherOption } from "./FetcherOptionRow.svelte";
    import Lock from "@lucide/svelte/icons/lock";
    import { type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import FetcherInformationView from "./FetcherInformationView.svelte";
    import { FetcherInformation } from "$api/fetcher";
    import { cn } from "$lib/utils/shadcn-helper";
    import { buttonVariants, type ButtonVariant } from "$lib/components/primitives/button";
    import type { Snippet } from "svelte";
    import type { Fetchers, SaveFetchers } from "./fetcher";

    interface Props {
        label: string;
        loadingLabel: string;
        title: string;
        triggerVariant: ButtonVariant;
        className: string;
        trigger: Snippet;
        fetchers: Fetchers;
        fetcher: FetcherInformation;
        onSave: SaveFetchers;
        disabled: boolean;
    }

    let {
        label,
        loadingLabel,
        title,
        triggerVariant,
        className,
        trigger,
        fetchers,
        fetcher,
        onSave,
        disabled,
    }: Props = $props();

    let error: ActionError = $state(undefined);
    let open = $state(false);
    let loading = $state(false);
    let options: FetcherOption[] = $state([]);

    async function updateFetcherOptions() {
        loading = true;

        const updatedFetchers = { ...fetchers };
        const newOptions: { [key: string]: string } = {};
        for (const option of options) {
            newOptions[option.id] = option.value;
        }
        updatedFetchers[fetcher.id] = { options: newOptions };

        await onSave(
            updatedFetchers,
            () => (open = false),
            (it) => (error = it),
        );

        loading = false;
    }
</script>

{#snippet lockIcon()}
    <Lock />
{/snippet}

<AlertDialog
    actionButtonLoadingText={loadingLabel}
    actionButtonText={label}
    actionIcon={disabled ? lockIcon : undefined}
    actionProps={{
        onclick: updateFetcherOptions,
        disabled: disabled,
        class: className,
    }}
    cancelProps={{
        disabled: loading,
    }}
    {loading}
    {title}
    {trigger}
    triggerProps={{ class: cn(buttonVariants({ variant: triggerVariant })) }}
    bind:open
>
    {#snippet description()}
        <div class="flex flex-col gap-4">
            <FetcherInformationView
                disabled={disabled || loading}
                {fetcher}
                {fetchers}
                bind:options
            />
            <ActionErrorAlert {error} />
        </div>
    {/snippet}
</AlertDialog>

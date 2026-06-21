<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { Project } from "$api/project";
    import { updateFetchers } from "./update-fetchers";
    import { type FetcherOption } from "./FetcherOptionRow.svelte";
    import Lock from "@lucide/svelte/icons/lock";
    import { type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import FetcherInformationView from "$lib/components/composites/settings/project-settings/slr/fetcher/FetcherInformationView.svelte";
    import { FetcherInformation } from "$api/fetcher";
    import { cn } from "$lib/utils/shadcn-helper";
    import { buttonVariants, type ButtonVariant } from "$lib/components/primitives/button";
    import type { Snippet } from "svelte";

    interface Props {
        label: string;
        loadingLabel: string;
        title: string;
        triggerVariant: ButtonVariant;
        className: string;
        trigger: Snippet;
        project: Project;
        fetcher: FetcherInformation;
        onProjectChanged: (project: Project) => void;
        disabled: boolean;
    }

    let {
        label,
        loadingLabel,
        title,
        triggerVariant,
        className,
        trigger,
        project,
        fetcher,
        onProjectChanged,
        disabled,
    }: Props = $props();

    let error: ActionError = $state(undefined);
    let open = $state(false);
    let loading = $state(false);
    let options: FetcherOption[] = $state([]);

    async function updateFetcherOptions() {
        loading = true;

        const updatedFetchers = project.settings?.fetchers ?? {};
        const newOptions: { [key: string]: string } = {};
        for (const option of options) {
            newOptions[option.id] = option.value;
        }
        updatedFetchers[fetcher.id] = { options: newOptions };

        await updateFetchers(
            project.id,
            updatedFetchers,
            (it) => {
                open = false;
                onProjectChanged(it);
            },
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
                {project}
                bind:options
            />
            <ActionErrorAlert {error} />
        </div>
    {/snippet}
</AlertDialog>

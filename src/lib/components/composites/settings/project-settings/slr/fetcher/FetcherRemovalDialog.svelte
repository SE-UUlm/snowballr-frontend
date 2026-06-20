<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import type { ActionError } from "$lib/model/action-error";
    import { Project } from "$api/project";
    import { updateFetchers } from "./update-fetchers";
    import Trash from "@lucide/svelte/icons/trash";
    import { cn } from "$lib/utils/shadcn-helper";
    import { buttonVariants } from "$lib/components/primitives/button";
    import type { FetcherInformation } from "$api/fetcher";

    interface Props {
        project: Project;
        fetcher: FetcherInformation;
        onProjectChanged: (project: Project) => void;
        disabled: boolean;
    }

    let { project, fetcher, onProjectChanged, disabled }: Props = $props();

    let removeFetcherError: ActionError = $state(undefined);
    let open = $state(false);
    let loading = $state(false);

    async function removeFetcher() {
        loading = true;

        const updatedFetchers = project.settings?.fetchers ?? {};
        delete updatedFetchers[fetcher.id];

        await updateFetchers(
            project.id,
            updatedFetchers,
            (project) => {
                open = false;
                onProjectChanged(project);
            },
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

<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, Project_Settings } from "$lib/model/api/project";
    import { updateFetchers } from "./UpdateFetchers";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";
    import FetcherOptionRow from "./FetcherOptionRow.svelte";
    import { Lock } from "lucide-svelte";
    import { createActionError, type ActionError } from "$lib/model/action-error";

    let loadFetcherOptionsError: ActionError = $state(undefined);

    interface Props {
        projectId: string;
        projectSettings?: Project_Settings;
        onProjectChanged: (project: Project) => void;
        fetcher: string;
        open?: boolean;
        slrSettingsLocked?: boolean;
    }

    let {
        projectId,
        fetcher,
        projectSettings,
        onProjectChanged,
        open = $bindable(false),
        slrSettingsLocked = false,
    }: Props = $props();

    interface Option {
        name: string;
        value: string;
        defaultValue: string;
    }

    const headers: [string, string][] = [
        ["Overridden", "Indicates whether the fetcher receives this option."],
        ["Name", "The name of the option."],
        ["Value", "The value of the option."],
        ["Default", "Set the current value to the default value of the option."],
    ];

    let options: Map<string, Option> = $state(new Map());
    let optionsLoading = $state(false);
    let saveLoading = $state(false);
    const loading = $derived(optionsLoading || saveLoading);

    $effect(() => {
        if (fetcher !== "" && open) refetchOptions(fetcher);
    });

    // Fetch the available options for a fetcher
    async function refetchOptions(fetcher: string) {
        optionsLoading = true;
        const availableOptions = await backendService
            .getAvailableFetcherOptions({ fetcherName: fetcher })
            .response.then((it) => new Map(Object.entries(it.options)))
            .catch((error) => {
                loadFetcherOptionsError = createActionError(
                    "Failed to Retrieve available Options",
                    {
                        action: "retrieving the available options for this fetcher",
                    },
                    error,
                );
                return new Map();
            });
        const fetchers = new Map(Object.entries(projectSettings?.fetchers ?? []));
        const fetcherOptions = new Map(Object.entries(fetchers.get(fetcher)?.options ?? {}));

        options = new Map(
            availableOptions.entries().map(([name, defaultValue]): [string, Option] => [
                name,
                {
                    name,
                    value: fetcherOptions.get(name) ?? "",
                    defaultValue,
                },
            ]),
        );
        optionsLoading = false;
    }

    // Save fetcher options (options) of the project (projectId)
    async function saveFetcherOptions() {
        saveLoading = true;
        const updatedFetcherApis = projectSettings?.fetchers ?? {};
        updatedFetcherApis[fetcher] = {
            options: Object.fromEntries(
                options
                    .values()
                    .filter((it) => it.value !== "")
                    .map((it) => [it.name, it.value]),
            ),
        };

        await updateFetchers(
            projectId,
            updatedFetcherApis,
            (it) => {
                open = false;
                onProjectChanged(it);
            },
            (it) => (loadFetcherOptionsError = it),
        );
        saveLoading = false;
    }
</script>

{#snippet lockIcon()}
    <Lock />
{/snippet}

<AlertDialog
    actionButtonLoadingText="Saving Options"
    actionButtonText="Save Options"
    actionIcon={slrSettingsLocked ? lockIcon : undefined}
    actionProps={{
        onclick: saveFetcherOptions,
        disabled: slrSettingsLocked || optionsLoading || options.size === 0,
        class: "w-38",
    }}
    cancelButtonText="Cancel"
    cancelProps={{
        disabled: loading,
    }}
    loading={saveLoading}
    title="Edit Option Values"
    bind:open
>
    {#snippet description()}
        <div class="flex flex-col gap-4">
            {#if optionsLoading}
                {#each [0, 1, 2, 3] as i (i)}
                    <div class="flex flex-row gap-2">
                        <Skeleton class="h-8 w-8" />
                        <Skeleton class="h-8 flex-1" />
                        <Skeleton class="h-8 flex-1" />
                        <Skeleton class="h-8 w-8" />
                    </div>
                {/each}
            {:else if options.size === 0}
                <p>The <b>{fetcher}</b> fetcher cannot be configured using options.</p>
            {:else}
                <div
                    class="grid grid-cols-[auto_1fr_1fr_auto] items-center justify-items-center gap-2"
                >
                    {#each headers as [name, description] (name)}
                        <Tooltip>
                            {#snippet trigger()}
                                <p class="text-muted-foreground text-xs">{name}</p>
                            {/snippet}
                            {#snippet content()}
                                <p>{description}</p>
                            {/snippet}
                        </Tooltip>
                    {/each}

                    {#each options.values() as { name, value, defaultValue } (name)}
                        <FetcherOptionRow
                            {name}
                            {defaultValue}
                            onValueChanged={(value) => {
                                options.get(name)!.value = value;
                            }}
                            {slrSettingsLocked}
                            {value}
                        />
                    {/each}
                </div>
            {/if}

            {#if loadFetcherOptionsError}
                <Alert
                    details={loadFetcherOptionsError.errorDetails}
                    title={loadFetcherOptionsError.errorTitle}
                    variant="error"
                />
            {/if}
        </div>
    {/snippet}
</AlertDialog>

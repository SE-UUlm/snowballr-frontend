<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, Project_Settings } from "$lib/model/api/project";
    import type { ApiError } from "$lib/model/general";
    import { updateFetchers } from "./UpdateFetchers";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";
    import FetcherOptionRow from "./FetcherOptionRow.svelte";

    let error: ApiError | undefined = $state();

    interface Props {
        projectId: string;
        projectSettings?: Project_Settings;
        onProjectChanged: (project: Project) => void;
        fetcher: string;
        open?: boolean;
    }

    let {
        projectId,
        fetcher,
        projectSettings,
        onProjectChanged,
        open = $bindable(false),
    }: Props = $props();

    interface Option {
        name: string;
        value: string;
        defaultValue: string;
    }

    let options: Map<string, Option> = $state(new Map());

    $effect(() => {
        if (fetcher !== "" && open) refetchOptions(fetcher);
    });

    // Fetch the available options for a fetcher
    async function refetchOptions(fetcher: string) {
        loading = true;
        const availableOptions = await backendService
            .getAvailableFetcherOptions({ fetcherName: fetcher })
            .then((it) => new Map(Object.entries(it.response.options)));
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
        loading = false;
    }

    // Save fetcher options (options) of the project (projectId)
    async function saveFetcherOptions() {
        const updatedFetcherApis = projectSettings?.fetchers ?? {};
        updatedFetcherApis[fetcher] = {
            options: Object.fromEntries(
                options
                    .values()
                    .filter((it) => it.value !== "")
                    .map((it) => [it.name, it.value]),
            ),
        };

        updateFetchers(
            projectId,
            updatedFetcherApis,
            (it) => {
                open = false;
                onProjectChanged(it);
            },
            (it) => (error = it),
        );
    }

    let loading = $state(false);

    const headers: [string, string][] = [
        ["Overridden", "Indicates wether the fetcher receives this option."],
        ["Name", "The name of the option."],
        ["Value", "The value of the option."],
        ["Default", "Set the current value to the default value of the option."],
    ];
</script>

<AlertDialog
    actionButtonText="Save"
    actionProps={{
        onclick: () => saveFetcherOptions(),
    }}
    cancelButtonText="Cancel"
    cancelProps={{
        onclick: () => {},
    }}
    title="Edit Option Values"
    bind:open
    bind:loading
>
    {#snippet description()}
        <div class="flex flex-col gap-4">
            {#if loading}
                {#each [0, 1, 2, 3] as i (i)}
                    <div class="flex flex-row gap-2">
                        <Skeleton class="h-8 w-8" />
                        <Skeleton class="h-8 flex-1" />
                        <Skeleton class="h-8 flex-1" />
                        <Skeleton class="h-8 w-8" />
                    </div>
                {/each}
            {:else if options.size == 0}
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
                            {value}
                        />
                    {/each}
                </div>
            {/if}

            {#if error}
                <Alert details={error.errorDetails} title={error.errorTitle} variant="error" />
            {/if}
        </div>
    {/snippet}
</AlertDialog>

<script lang="ts">
    import type { FetcherInformation } from "$api/fetcher";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import FetcherOptionRow, { type FetcherOption } from "./FetcherOptionRow.svelte";
    import type { Fetchers } from "./fetcher";
    import { onMount } from "svelte";

    interface Props {
        fetchers: Fetchers;
        fetcher: FetcherInformation;
        options: FetcherOption[];
        disabled: boolean;
    }

    let { fetchers, fetcher, options = $bindable([]), disabled }: Props = $props();

    const headers: [string, string][] = [
        ["Name", "The name of the option."],
        ["Value", "The value of the option."],
        ["Default", "Set the current value to the default value of the option."],
    ];

    onMount(() => {
        const currentFetcherOptions = fetchers[fetcher.id];
        options = Object.entries(fetcher.optionsSchema).map(([id, schema]) => ({
            id,
            value: currentFetcherOptions?.options[id] ?? "",
            defaultValue: schema.defaultValue ?? "",
            ...schema,
        }));
    });
</script>

<div class="flex flex-col gap-4">
    <p class="whitespace-pre-line">{fetcher.description}</p>
    <ul>
        {#each fetcher.links as link (link.label)}
            <li>
                <a
                    class="flex w-fit flex-row items-center gap-2 text-blue-500 hover:underline"
                    href={link.url}
                    target="_blank"
                >
                    {link.label}
                    <ExternalLink class="size-4" />
                </a>
            </li>
        {/each}
    </ul>
    <div class="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2">
        {#each headers as [name, description] (name)}
            <span class="text-muted-foreground text-sm" title={description}>{name}</span>
        {/each}

        {#each options as option (option.id)}
            <FetcherOptionRow
                {disabled}
                onValueChanged={(value) => (option.value = value)}
                {option}
            />
        {/each}
    </div>
</div>

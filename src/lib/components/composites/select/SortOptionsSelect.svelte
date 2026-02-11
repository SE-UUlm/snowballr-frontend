<script lang="ts">
    import * as Select from "$lib/components/primitives/select/index.js";
    import {
        ALLOWED_SORT_OPTIONS,
        SortCriteria,
        SortDirection,
        type SortOptionLabel,
    } from "$lib/model/sort-criteria";
    import ArrowDown10 from "@lucide/svelte/icons/arrow-down-1-0";
    import ArrowDownZA from "@lucide/svelte/icons/arrow-down-z-a";
    import ArrowDown01 from "@lucide/svelte/icons/arrow-down-0-1";
    import ArrowDownAZ from "@lucide/svelte/icons/arrow-down-a-z";
    import ArrowDownYN from "$lib/svg/ArrowDownYN.svelte";
    import ArrowDownNY from "$lib/svg/ArrowDownNY.svelte";

    interface Props {
        selectedSortOption: SortOptionLabel;
    }

    let { selectedSortOption = $bindable("Id: Low to High") }: Props = $props();
</script>

<!--
@component
Select component that allows the user to choose how the papers on the page should be sorted.

Usage:
```svelte
    <SortOptionsSelect bind:selectedSortOption={sortOption} />
```
-->
<Select.Root type="single" bind:value={selectedSortOption}>
    <Select.Trigger
        class="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
    >
        {`Sort by: ${ALLOWED_SORT_OPTIONS[selectedSortOption].criterion}`}
        {#if ALLOWED_SORT_OPTIONS[selectedSortOption].direction === SortDirection.ASC}
            {#if ALLOWED_SORT_OPTIONS[selectedSortOption].criterion === SortCriteria.PAPER_TITLE}
                <ArrowDownAZ class="size-4" />
            {:else if ALLOWED_SORT_OPTIONS[selectedSortOption].criterion === SortCriteria.DECISION}
                <ArrowDownYN />
            {:else}
                <ArrowDown01 class="size-4" />
            {/if}
        {:else if ALLOWED_SORT_OPTIONS[selectedSortOption].criterion === SortCriteria.PAPER_TITLE}
            <ArrowDownZA class="size-4" />
        {:else if ALLOWED_SORT_OPTIONS[selectedSortOption].criterion === SortCriteria.DECISION}
            <ArrowDownNY />
        {:else}
            <ArrowDown10 class="size-4" />
        {/if}
    </Select.Trigger>
    <Select.Content>
        {#each Object.keys(ALLOWED_SORT_OPTIONS) as option (option)}
            <Select.Item value={option}>{option}</Select.Item>
        {/each}
    </Select.Content>
</Select.Root>

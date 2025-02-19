<script lang="ts">
    import * as Select from "$lib/components/primitives/select/index.js";
    import type { SelectOption } from "./types";

    interface Props {
        options: SelectOption[];
        categoryLabel?: string;
        selectedValues?: string[];
    }

    let { options, categoryLabel = "category", selectedValues = $bindable([]) }: Props = $props();
    let label = $derived(getSelectLabel(selectedValues));

    function getSelectLabel(selectedValues: string[] | undefined): string {
        if (
            !selectedValues ||
            selectedValues.length === 0 ||
            selectedValues.length === options.length
        ) {
            return `All ${categoryLabel} (${options?.length ?? 0})`;
        }

        return `${categoryLabel}: ${selectedValues.length} selected`;
    }
</script>

<!--
@component
Custom select component that allows users to select multiple options from a list of options.

- when no options are available, a disabled item is displayed with the message "No [categoryLabel] available".
- when all options are selected, the trigger displays "All [categoryLabel] ([options.length])".
- when some options are selected, the trigger displays "[categoryLabel]: [selectedValues.length] selected".

Usage:
```svelte
    <Select
        {options}
        allOptionsLabel="All Years"
    />
```
-->
<Select.Root type="multiple" bind:value={selectedValues}>
    <Select.Trigger class="w-fit">{label}</Select.Trigger>
    <Select.Content>
        {#each options as option}
            <Select.Item value={option.value}>{option.label}</Select.Item>
        {/each}
        {#if options.length === 0}
            <Select.Item value={"no-options"} disabled>
                {`No ${categoryLabel.toLowerCase()} available`}
            </Select.Item>
        {/if}
    </Select.Content>
</Select.Root>

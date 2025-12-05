<script lang="ts">
    import * as Select from "$lib/components/primitives/select/index.js";
    import type { SelectOption } from "$lib/model/select-option";

    interface Props {
        options: SelectOption[];
        categoryLabel?: string;
        disabled: boolean;
        selectedValue?: string;
    }

    let {
        options,
        categoryLabel = "categories",
        disabled,
        selectedValue = $bindable(undefined),
    }: Props = $props();

    let label = $derived(getSelectLabel(selectedValue));

    function getSelectLabel(selectedValue: string | undefined): string {
        return !selectedValue ? `No ${categoryLabel} selected` : selectedValue;
    }
</script>

<!--
@component
Custom select component that allows users to select only a single option from a list of options.

Usage:
```svelte
    <SingleSelect categoryLabel="format" {options} bind:selectedValue={selectedFormat} />
```
-->
<Select.Root {disabled} type="single" bind:value={selectedValue}>
    <Select.Trigger class="w-42">
        <span class="flex w-full flex-row justify-center">{label}</span>
    </Select.Trigger>
    <Select.Content class="max-h-[300px]">
        {#if options.length === 0}
            <Select.Item disabled value="no-options">
                {`No ${categoryLabel} available`}
            </Select.Item>
        {:else}
            {#each options as option (option.value)}
                <Select.Item value={option.value}>{option.label}</Select.Item>
            {/each}
        {/if}
    </Select.Content>
</Select.Root>

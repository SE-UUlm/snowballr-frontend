<script lang="ts">
    import * as Select from "$lib/components/primitives/select/index.js";
    import { Separator } from "$lib/components/primitives/separator";

    export interface SelectOption {
        value: string;
        label: string;
    }

    interface Props {
        options: SelectOption[];
        categoryLabel?: string;
        selectedValues?: string[];
    }

    let { options, categoryLabel = "categories", selectedValues = $bindable([]) }: Props = $props();

    // Maximum number of characters allowed in the select component's label used for displaying
    // the selected values.
    const MAX_SELECTED_VALUES_LABEL_LENGTH = 30;
    let label = $derived(getSelectLabel(selectedValues));

    let doSelectAllOptions = $state(false);

    /**
     * Determine the label of the select button.
     *
     * If no value was selected, all values were selected or no values exist, then
     * "All \<category\> (\<number of possible values\>)" is shown.
     * Otherwise, "\<category\>: \<selected value\>, \<selected value\>... (\<number of selected values\>)"
     *
     * @param selectedValues - The values the user selected
     */
    function getSelectLabel(selectedValues: string[] | undefined): string {
        selectedValues = selectedValues?.filter((value) => value !== "all-options");
        if (
            !selectedValues ||
            selectedValues.length === 0 ||
            selectedValues.length === options.length
        ) {
            return `All ${categoryLabel} (${options.length})`;
        }

        let selectedValueLabel = selectedValues
            .map((value) => options.find((option) => option.value === value)?.label)
            .join(", ");
        if (selectedValueLabel.length > MAX_SELECTED_VALUES_LABEL_LENGTH) {
            selectedValueLabel = `${selectedValueLabel.substring(0, MAX_SELECTED_VALUES_LABEL_LENGTH - 3)}...`;
        }

        return `${categoryLabel}: ${selectedValueLabel} (${selectedValues.length})`;
    }

    /**
     * Select or unselect all options at once.
     */
    function toggleAllOptions() {
        if (doSelectAllOptions) {
            selectedValues = [];
        } else {
            selectedValues = [...options.map((option) => option.value), "all-options"];
        }
        doSelectAllOptions = !doSelectAllOptions;
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
        categoryLabel="Years"
    />
```
-->

<Select.Root type="multiple" bind:value={selectedValues}>
    <Select.Trigger class="w-fit">{label}</Select.Trigger>
    {#if options.length === 0}
        <Select.Content>
            <Select.Item disabled value="no-options">
                {`No ${categoryLabel.toLowerCase()} available`}
            </Select.Item>
        </Select.Content>
    {:else}
        <Select.Content>
            <Select.Item onclick={() => toggleAllOptions()} value="all-options">
                {doSelectAllOptions ? "Unselect all" : "Select all"}
            </Select.Item>
            <Separator />
            {#each options as option (option.value)}
                <Select.Item value={option.value}>{option.label}</Select.Item>
            {/each}
        </Select.Content>
    {/if}
</Select.Root>

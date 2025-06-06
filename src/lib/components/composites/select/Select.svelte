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

    const ALL_OPTIONS = "all-options";
    let doSelectAllOptions = $state(false);

    // Maximum number of characters allowed in the select component's label used for displaying
    // the selected values.
    const MAX_SELECTED_VALUES_LABEL_LENGTH = 30;
    let label = $derived(getSelectLabel(selectedValues));

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
     * If the 'Select all / Unselect all' option was selected, then it add / remove all options to / from
     * the selected options.
     *
     * @remarks
     * If the ALL_OPTIONS option is included in the list of values, then the 'Select all / Unselect all'
     * option was selected.
     *
     * @param values - The list of all selected values
     */
    function selectOrUnselectAllOptions(values: string[]) {
        if (values.includes(ALL_OPTIONS)) {
            if (!doSelectAllOptions) {
                selectedValues = options.map((o) => o.value);
            } else {
                selectedValues = [];
            }
            doSelectAllOptions = !doSelectAllOptions;
        }
    }

    // Automatically drop any selected items that not exist in options, if the options are already
    // loaded.
    $effect(() => {
        const invalid = selectedValues.filter((v) => !options.some((option) => option.value === v));
        if (invalid.length > 0 && options.length > 0) {
            // re-filter away the invalid ones and reassign
            selectedValues = selectedValues.filter((v) => !invalid.includes(v));
            // after this, `invalid.length` will be zero on the next run ⇒ no loop
        }
    });

    // Change "Select all / Unselect all" label automatically when the user manually
    // selects / unselects all options
    $effect(() => {
        if (selectedValues.length === 0) {
            doSelectAllOptions = false;
        } else if (selectedValues.length === options.length) {
            doSelectAllOptions = true;
        }
    });
</script>

<!--
@component
Custom select component that allows users to select multiple options from a list of options.

- when no options are available, a disabled item is displayed with the message "No [categoryLabel] available".
- when all options are selected, the trigger displays "All [categoryLabel] ([options.length])".
- when some options are selected, the trigger displays "[categoryLabel]: [selectedValue1], [selectedValue2], ...([selectedValues.length]) selected".

Usage:
```svelte
    <Select categoryLabel="Years" {options} bind:selectedValues={selectedYears} />
```
-->
<Select.Root onValueChange={selectOrUnselectAllOptions} type="multiple" bind:value={selectedValues}>
    <Select.Trigger class="w-fit">{label}</Select.Trigger>
    <Select.Content class="max-h-[300px]">
        {#if options.length === 0}
            <Select.Item disabled value="no-options">
                {`No ${categoryLabel.toLowerCase()} available`}
            </Select.Item>
        {:else}
            <Select.Item value={ALL_OPTIONS}>
                {doSelectAllOptions ? "Unselect all" : "Select all"}
            </Select.Item>
            <Separator />
            {#each options as option (option.value)}
                <Select.Item value={option.value}>{option.label}</Select.Item>
            {/each}
        {/if}
    </Select.Content>
</Select.Root>

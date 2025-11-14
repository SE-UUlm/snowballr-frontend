<script lang="ts">
    import MultiSelect from "$lib/components/composites/select/MultiSelect.svelte";
    import type { SelectOption } from "$lib/model/select-option";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        loadingYears: Promise<number[]>;
        selectedYears?: string[];
    }

    let { loadingYears, selectedYears = $bindable(undefined) }: Props = $props();

    const years = resource<number[], number[]>(loadingYears, {
        initialValue: [],
        resourceName: "years",
    });

    let options = $derived<SelectOption[]>(
        // Use slice to create a copy of the array before sorting it
        // Sorting the original array would cause an error
        // See: https://svelte.dev/docs/svelte/runtime-errors#Client-errors-state_unsafe_mutation
        years.value
            .slice()
            .sort()
            .map((year) => {
                return {
                    value: `${year}`,
                    label: `${year}`,
                };
            }),
    );
</script>

<MultiSelect categoryLabel="Years" {options} bind:selectedValues={selectedYears} />

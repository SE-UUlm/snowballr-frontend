<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";
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

<Select categoryLabel="Years" {options} bind:selectedValues={selectedYears} />

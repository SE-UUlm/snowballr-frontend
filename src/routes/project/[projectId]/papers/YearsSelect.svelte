<script lang="ts">
    import Select from "$lib/components/composites/select/Select.svelte";
    import type { SelectOption } from "$lib/components/composites/select/types";

    interface Props {
        loadingYears: Promise<number[]>;
    }

    const { loadingYears }: Props = $props();

    let years = $state<number[] | undefined>(undefined);
    let options = $derived<SelectOption[]>(
        // Use slice to create a copy of the array before sorting it
        // Sorting the original array would cause an error
        // See: https://svelte.dev/docs/svelte/runtime-errors#Client-errors-state_unsafe_mutation
        years
            ?.slice()
            .sort()
            .map((year) => {
                if (year === -1) {
                    return {
                        value: "-1",
                        label: "N/A",
                    };
                }

                return {
                    value: `${year}`,
                    label: `${year}`,
                };
            }) ?? [],
    );

    loadingYears
        .then((loadedYears) => {
            years = loadedYears;
        })
        .catch((error) => {
            console.error(`Failed to load years: ${error}`);
        });
</script>

<Select {options} categoryLabel="Years" />

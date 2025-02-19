<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";
    import type { Criterion } from "$lib/model/api/criterion";

    interface Props {
        loadingCriteria: Promise<Criterion[]>;
        selectedCriteria?: string[];
    }

    let { loadingCriteria, selectedCriteria = $bindable(undefined) }: Props = $props();

    let criteria = $state<Criterion[] | undefined>(undefined);
    let options = $derived<SelectOption[]>(
        criteria?.map((criterion) => {
            return {
                value: `${criterion.id}`,
                label: `${criterion.tag}: ${criterion.name}`,
            };
        }) ?? [],
    );

    loadingCriteria
        .then((loadedCriteria) => {
            criteria = loadedCriteria;
        })
        .catch((error) => {
            console.error(`Failed to load criteria: ${error}`);
        });
</script>

<Select categoryLabel="Criteria" {options} bind:selectedValues={selectedCriteria} />

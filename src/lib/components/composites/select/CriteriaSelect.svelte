<script lang="ts">
    import MultiSelect, {
        type SelectOption,
    } from "$lib/components/composites/select/MultiSelect.svelte";
    import { Criterion } from "$lib/model/api/criterion";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        loadingCriteria: Promise<Criterion[]>;
        selectedCriteria?: string[];
    }

    let { loadingCriteria, selectedCriteria = $bindable(undefined) }: Props = $props();

    const criteria = resource<Criterion[], Criterion[]>(loadingCriteria, {
        initialValue: [],
        resourceName: "criteria",
    });

    let options = $derived<SelectOption[]>(
        criteria.value.map((criterion) => {
            return {
                value: `${criterion.id}`,
                label: `${criterion.tag}: ${criterion.name}`,
            };
        }),
    );
</script>

<MultiSelect categoryLabel="Criteria" {options} bind:selectedValues={selectedCriteria} />

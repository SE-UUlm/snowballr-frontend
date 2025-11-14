<script lang="ts">
    import MultiSelect, {
        type SelectOption,
    } from "$lib/components/composites/select/MultiSelect.svelte";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        loadingStageCount: Promise<bigint>;
        selectedStages?: string[];
    }

    let { loadingStageCount, selectedStages = $bindable(undefined) }: Props = $props();

    const stageCount = resource<bigint, bigint>(loadingStageCount, {
        initialValue: -1n,
        resourceName: "stages",
    });

    let options = $derived<SelectOption[]>(
        // Create Stage options; If stageCount is undefined, create an empty array
        Array.from({ length: Number(stageCount.value + 1n) }, (_, i) => {
            return {
                value: `${i}`,
                label: `Stage ${i}`,
            };
        }),
    );
</script>

<MultiSelect categoryLabel="Stages" {options} bind:selectedValues={selectedStages} />

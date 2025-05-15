<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";
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

<Select categoryLabel="Stages" {options} bind:selectedValues={selectedStages} />

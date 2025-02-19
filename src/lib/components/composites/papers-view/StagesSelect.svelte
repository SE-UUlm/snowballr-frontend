<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";

    interface Props {
        loadingStageCount: Promise<bigint>;
        selectedStages?: string[];
    }

    let { loadingStageCount, selectedStages = $bindable(undefined) }: Props = $props();

    let stageCount = $state<bigint | undefined>(undefined);
    let options = $derived<SelectOption[]>(
        // Create Stage options; If stageCount is undefined, create an empty array
        Array.from({ length: Number(stageCount ?? -1) + 1 }, (_, i) => {
            return {
                value: `${i}`,
                label: `Stage ${i}`,
            };
        }),
    );

    loadingStageCount
        .then((count) => {
            stageCount = count;
        })
        .catch((error) => {
            console.error(`Failed to load stages: ${error}`);
        });
</script>

<Select categoryLabel="Stages" {options} bind:selectedValues={selectedStages} />

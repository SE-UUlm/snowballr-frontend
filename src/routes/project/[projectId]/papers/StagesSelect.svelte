<script lang="ts">
    import Select from "$lib/components/composites/select/Select.svelte";
    import type { SelectOption } from "$lib/components/composites/select/types";

    interface Props {
        loadingStageCount: Promise<bigint>;
    }

    const { loadingStageCount }: Props = $props();

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

<Select {options} categoryLabel="Stages" />

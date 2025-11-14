<script lang="ts">
    import MultiSelect, {
        type SelectOption,
    } from "$lib/components/composites/select/MultiSelect.svelte";
    import { PaperDecision } from "$lib/model/api/project";
    import { getStatusText } from "$lib/utils/common-helper";

    interface Props {
        selectedDecisions?: string[];
    }

    let { selectedDecisions = $bindable(undefined) }: Props = $props();

    function getOption(decision: PaperDecision): SelectOption {
        return { value: String(decision), label: getStatusText(decision) };
    }

    // Default options are all from PaperDecision except 'UNSPECIFIED'
    const defaultOptions = Object.keys(PaperDecision)
        .filter((key) => isNaN(Number(key)) && key !== "UNSPECIFIED")
        .map((decision) => getOption(PaperDecision[decision as keyof typeof PaperDecision]));

    // Use default options and additional option 'unreviewed'
    const options = $state<SelectOption[]>(defaultOptions);
</script>

<MultiSelect categoryLabel="Decisions" {options} bind:selectedValues={selectedDecisions} />

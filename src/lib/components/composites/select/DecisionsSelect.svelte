<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";
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

<Select categoryLabel="Decisions" {options} bind:selectedValues={selectedDecisions} />

<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";
    import { PaperDecision } from "$lib/model/api/project";
    import { exhaustiveCheck } from "$lib/utils/common-helper";

    interface Props {
        selectedDecisions?: string[];
    }

    let { selectedDecisions = $bindable(undefined) }: Props = $props();

    function getOption(decision: PaperDecision): SelectOption {
        switch (decision) {
            case PaperDecision.ACCEPTED:
                return { value: String(PaperDecision.ACCEPTED), label: "Accepted" };
            case PaperDecision.DECLINED:
                return { value: String(PaperDecision.DECLINED), label: "Declined" };
            case PaperDecision.IN_REVIEW:
                return { value: String(PaperDecision.IN_REVIEW), label: "Undecided" };
            case PaperDecision.UNSPECIFIED:
            case PaperDecision.UNREVIEWED:
                return { value: String(PaperDecision.UNREVIEWED), label: "Unreviewed" };
            default:
                exhaustiveCheck(decision);
        }
    }

    // Default options are all from PaperDecision except 'UNSPECIFIED'
    const defaultOptions = Object.keys(PaperDecision)
        .filter((key) => isNaN(Number(key)) && key !== "UNSPECIFIED")
        .map((decision) => getOption(PaperDecision[decision as keyof typeof PaperDecision]));

    // Use default options and additional option 'unreviewed'
    const options = $state<SelectOption[]>(defaultOptions);
</script>

<Select categoryLabel="Decisions" {options} bind:selectedValues={selectedDecisions} />

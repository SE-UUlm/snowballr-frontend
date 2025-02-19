<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";

    interface Props {
        selectedDecisions?: string[];
    }

    let { selectedDecisions = $bindable(undefined) }: Props = $props();

    let options = $state<SelectOption[]>([
        { value: "accepted", label: "Accepted" },
        { value: "declined", label: "Declined" },
        { value: "maybe", label: "Maybe" },
    ]);
</script>

<Select {options} categoryLabel="Decisions" bind:selectedValues={selectedDecisions} />

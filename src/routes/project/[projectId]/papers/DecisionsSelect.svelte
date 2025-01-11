<script lang="ts">
    import Select from "$lib/components/composites/select/Select.svelte";
    import type { SelectOption } from "$lib/components/composites/select/types";

    let options = $state<SelectOption[]>([
        { value: "accepted", label: "Accepted" },
        { value: "declined", label: "Declined" },
        { value: "maybe", label: "Maybe" },
    ]);
</script>

<Select {options} categoryLabel="Decisions" />

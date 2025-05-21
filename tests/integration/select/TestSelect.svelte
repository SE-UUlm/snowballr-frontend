<script lang="ts">
    import Select from "$lib/components/composites/select/Select.svelte";

    let { options, selectedValues } = $props();
</script>

<Select {options} bind:selectedValues={$selectedValues} />

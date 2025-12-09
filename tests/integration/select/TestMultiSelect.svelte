<script lang="ts">
    import MultiSelect from "$lib/components/composites/select/MultiSelect.svelte";

    let { options, selectedValues } = $props();
</script>

<MultiSelect {options} bind:selectedValues={$selectedValues} />

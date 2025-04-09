<script lang="ts">
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
</script>

<Dialog title="This is the dialog title" triggerProps={{ class: "bg-red-500" }}>
    {#snippet trigger()}
        This is the dialog trigger
    {/snippet}
    {#snippet description()}
        This is the dialog description
    {/snippet}
</Dialog>

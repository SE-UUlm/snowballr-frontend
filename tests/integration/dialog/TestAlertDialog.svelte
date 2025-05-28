<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";

    interface Props {
        loading?: boolean;
        error?: unknown;
        open?: boolean;
    }

    let { loading = false, error = undefined, open = false }: Props = $props();
</script>

<AlertDialog
    actionProps={{ class: "bg-blue-500" }}
    {error}
    {loading}
    title="This is the alert dialog title"
    triggerProps={{ class: "bg-red-500" }}
    bind:open
>
    {#snippet trigger()}
        This is the alert dialog trigger
    {/snippet}
    {#snippet description()}
        This is the alert dialog description
    {/snippet}
</AlertDialog>

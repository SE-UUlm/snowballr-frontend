<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";

    interface Props {
        loading?: boolean;
        error?: unknown;
        open?: boolean;
    }

    let {
        loading = $bindable(false),
        error = $bindable(undefined),
        open = $bindable(false),
    }: Props = $props();
</script>

<AlertDialog
    actionProps={{ class: "bg-blue-500" }}
    title="This is the alert dialog title"
    triggerProps={{ class: "bg-red-500" }}
    bind:error
    bind:open
    bind:loading
>
    {#snippet trigger()}
        This is the alert dialog trigger
    {/snippet}
    {#snippet description()}
        This is the alert dialog description
    {/snippet}
</AlertDialog>

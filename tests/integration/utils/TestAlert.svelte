<script lang="ts">
    import Alert from "$lib/components/composites/utils/Alert.svelte";

    interface Props {
        title: string;
        details: string;
        variant: "default" | "info" | "warning" | "error" | "success";
    }

    const { title, details, variant }: Props = $props();
</script>

<Alert {details} {title} {variant} />

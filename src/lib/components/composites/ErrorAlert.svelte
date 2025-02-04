<script lang="ts">
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import * as Alert from "$lib/components/primitives/alert";
    import type { ApiLoadError } from "$lib/model/general";

    const {
        errorTitle,
        errorDetails = "Please check your connection and try again.",
    }: ApiLoadError = $props();
</script>

<Alert.Root variant="destructive">
    <CircleAlert class="size-4" />
    <Alert.Title>{errorTitle}</Alert.Title>
    {#if errorDetails}
        <Alert.Description>{errorDetails}</Alert.Description>
    {/if}
</Alert.Root>

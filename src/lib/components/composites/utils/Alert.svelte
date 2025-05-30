<script lang="ts">
    import * as Alert from "$lib/components/primitives/alert";
    import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-svelte";

    type Props = {
        title: string;
        details?: string;
        variant?: "default" | "success" | "info" | "warning" | "error";
    };

    const { title, details, variant = "default" }: Props = $props();
</script>

<Alert.Root {variant}>
    {#if variant === "success"}
        <CircleCheckIcon class="size-4" role="img" />
    {:else if variant === "info"}
        <InfoIcon class="size-4" role="img" />
    {:else if variant === "warning"}
        <TriangleAlertIcon class="size-4" role="img" />
    {:else if variant === "error"}
        <CircleAlertIcon class="size-4" role="img" />
    {/if}
    <Alert.Title>{title}</Alert.Title>
    {#if details}
        <Alert.Description>{details}</Alert.Description>
    {/if}
</Alert.Root>

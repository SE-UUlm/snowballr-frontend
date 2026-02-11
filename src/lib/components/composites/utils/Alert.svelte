<script lang="ts">
    import * as Alert from "$lib/components/primitives/alert";
    import CircleAlert from "@lucide/svelte/icons/circle-alert";
    import CircleCheck from "@lucide/svelte/icons/circle-check";
    import Info from "@lucide/svelte/icons/info";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

    export type AlertVariant = "default" | "success" | "info" | "warning" | "error";
    type Props = {
        title: string;
        details?: string;
        variant?: AlertVariant;
    };

    const { title, details, variant = "default" }: Props = $props();
</script>

<Alert.Root aria-label={title} {variant}>
    {#if variant === "success"}
        <CircleCheck class="size-4" role="img" />
    {:else if variant === "info"}
        <Info class="size-4" role="img" />
    {:else if variant === "warning"}
        <TriangleAlert class="size-4" role="img" />
    {:else if variant === "error"}
        <CircleAlert class="size-4" role="img" />
    {/if}
    <Alert.Title>{title}</Alert.Title>
    {#if details}
        <Alert.Description>{details}</Alert.Description>
    {/if}
</Alert.Root>

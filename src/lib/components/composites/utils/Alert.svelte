<script lang="ts">
    import * as Alert from "$lib/components/primitives/alert";
    import CircleAlert from "@lucide/svelte/icons/circle-alert";
    import CircleCheck from "@lucide/svelte/icons/circle-check";
    import Info from "@lucide/svelte/icons/info";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
    import { cn } from "$lib/utils/shadcn-helper";

    export type AlertVariant = "default" | "success" | "info" | "warning" | "error";
    type Props = {
        title: string;
        details?: string;
        variant?: AlertVariant;
        inline?: boolean;
    };

    const { title, details, variant = "default", inline }: Props = $props();
</script>

<Alert.Root
    class={inline ? "flex flex-row items-center overflow-scroll p-2" : ""}
    aria-label={title}
    {variant}
>
    {@const iconClass = cn("size-4 min-w-4", inline ? "static!" : "")}
    {#if variant === "success"}
        <CircleCheck class={iconClass} role="img" />
    {:else if variant === "info"}
        <Info class={iconClass} role="img" />
    {:else if variant === "warning"}
        <TriangleAlert class={iconClass} role="img" />
    {:else if variant === "error"}
        <CircleAlert class={iconClass} role="img" />
    {/if}
    <Alert.Title class={cn(inline ? "m-0 pl-2! whitespace-nowrap" : "")}>
        {title}{inline ? ": " : ""}
    </Alert.Title>
    {#if details}
        <Alert.Description class={inline ? "pl-2! whitespace-nowrap" : ""}>
            {details}
        </Alert.Description>
    {/if}
</Alert.Root>

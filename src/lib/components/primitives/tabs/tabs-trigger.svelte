<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    type TabsTriggerProps = TabsPrimitive.TriggerProps & {
        href?: string;
    };

    let {
        children,
        ref = $bindable(null),
        href = undefined,
        class: className,
        ...restProps
    }: TabsTriggerProps = $props();
</script>

<TabsPrimitive.Trigger
    class={cn(
        "ring-offset-background data-[state=active]:bg-background data-[state=active]:text-default text-default-nc inline-flex items-center justify-center rounded-sm px-3 py-1.5 whitespace-nowrap focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs",
        className,
    )}
    bind:ref
    {...restProps}
>
    {#snippet child({ props })}
        <svelte:element
            this={href ? "a" : "button"}
            {href}
            {...props}
            class={cn(props["class"]!, "cursor-default")}
        >
            {@render children?.()}
        </svelte:element>
    {/snippet}
</TabsPrimitive.Trigger>

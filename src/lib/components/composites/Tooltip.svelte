<script lang="ts">
    import { buttonVariants } from "$lib/components/primitives/button/index.js";
    import * as Tooltip from "$lib/components/primitives/tooltip/index.js";
    import { cn } from "$lib/utils";
    import type { TooltipTriggerProps, WithElementRef } from "bits-ui";
    import type { Snippet } from "svelte";

    type Props = WithElementRef<TooltipTriggerProps> & {
        trigger: Snippet;
        content: Snippet;
        buttonVariant?:
            | "default"
            | "link"
            | "destructive"
            | "outline"
            | "secondary"
            | "ghost"
            | undefined;
    };

    const { trigger, content, buttonVariant, class: className, ...restProps }: Props = $props();
</script>

<!--
@component
Reusable tooltip component that wraps a trigger and content component.
The tooltip can't be used as link. To still redirect on click, use the `onclick` prop.

Usage:
```svelte
<Tooltip
    class="text-primary shadow-sm"
    buttonVariant="default"
    onclick={() => goto(href)}
>
    {#snippet trigger()}
        I'm a trigger
    {/snippet}
    {#snippet content()}
        This shows a tooltip
    {/snippet}
</Tooltip>
```
-->
<Tooltip.Provider>
    <Tooltip.Root>
        <Tooltip.Trigger
            class={cn(buttonVariants({ variant: buttonVariant }), className)}
            {...restProps}
        >
            {@render trigger()}
        </Tooltip.Trigger>
        <Tooltip.Content>
            {@render content()}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>

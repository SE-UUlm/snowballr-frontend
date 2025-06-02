<script lang="ts">
    import {
        buttonVariants,
        type ButtonSize,
        type ButtonVariant,
    } from "$lib/components/primitives/button/index";
    import * as Tooltip from "$lib/components/primitives/tooltip/index";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { TooltipTriggerProps, WithElementRef } from "bits-ui";
    import type { Snippet } from "svelte";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";

    type Props = WithElementRef<TooltipTriggerProps> & {
        trigger: Snippet;
        loadingTrigger?: Snippet;
        content: Snippet;
        triggerVariant?: ButtonVariant;
        triggerSize?: ButtonSize;
        openOnClick?: boolean;
        loading?: boolean;
    };

    const {
        trigger,
        loadingTrigger = trigger,
        content,
        triggerVariant = "none",
        triggerSize = "fit",
        openOnClick = false,
        loading = false,
        class: className,
        ...restProps
    }: Props = $props();

    let open = $state(false);

    function handleClick(event: Event) {
        if (!openOnClick) {
            return;
        }

        event.preventDefault();
        open = true;
    }
</script>

<!--
@component
Reusable tooltip component that wraps a trigger and content component.
The tooltip can't be used as link. To still redirect on click, use the `onclick` prop.

- if `openOnClick` is set, the tooltip is immediately shown when it's clicked.

Usage:
```svelte
    <Tooltip
        class="text-primary shadow-xs"
        triggerVariant="default"
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
    <Tooltip.Root bind:open>
        <Tooltip.Trigger
            class={cn(buttonVariants({ variant: triggerVariant, size: triggerSize }), className)}
            onclick={handleClick}
            {...restProps}
        >
            {#if loading}
                <LoaderCircle class="animate-spin" />
                {@render loadingTrigger()}
            {:else}
                {@render trigger()}
            {/if}
        </Tooltip.Trigger>
        <Tooltip.Content>
            {@render content()}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>

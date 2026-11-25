<script lang="ts">
    import {
        buttonVariants,
        type ButtonSize,
        type ButtonVariant,
    } from "#lib/components/primitives/button/index.js";
    import * as Tooltip from "#lib/components/primitives/tooltip/index.js";
    import { cn } from "#lib/utils/shadcn-helper.js";
    import type { TooltipTriggerProps, WithElementRef } from "bits-ui";
    import type { Snippet } from "svelte";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    type Props = WithElementRef<TooltipTriggerProps> & {
        trigger: Snippet;
        loadingTrigger?: Snippet;
        content: Snippet;
        triggerVariant?: ButtonVariant;
        triggerSize?: ButtonSize;
        openOnClick?: boolean;
        loading?: boolean;
        /** If set, the trigger is rendered as a link that opens this URL in a new tab. */
        href?: string;
    };

    const {
        trigger,
        loadingTrigger = trigger,
        content,
        triggerVariant = "none",
        triggerSize = "fit",
        openOnClick = false,
        loading = false,
        href,
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
To redirect within the app on click, use the `onclick` prop.

- if `openOnClick` is set, the tooltip is immediately shown when it's clicked.
- if `href` is set, the trigger is rendered as a link that opens the URL in a new tab, e.g. for
  external pages.

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
{#snippet triggerContent()}
    {#if loading}
        <LoaderCircle class="animate-spin" />
        {@render loadingTrigger()}
    {:else}
        {@render trigger()}
    {/if}
{/snippet}

<Tooltip.Provider>
    <Tooltip.Root bind:open>
        <Tooltip.Trigger
            class={cn(buttonVariants({ variant: triggerVariant, size: triggerSize }), className)}
            onclick={handleClick}
            {...restProps}
        >
            {#snippet child({ props })}
                {#if href === undefined}
                    <button {...props}>{@render triggerContent()}</button>
                {:else}
                    <!-- `type` is set to "button" by the trigger, which doesn't apply to links. -->
                    <a {...props} {href} rel="noopener noreferrer" target="_blank" type={undefined}>
                        {@render triggerContent()}
                    </a>
                {/if}
            {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>
            {@render content()}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>

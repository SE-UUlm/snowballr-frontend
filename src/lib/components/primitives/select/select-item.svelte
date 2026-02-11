<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import { Select as SelectPrimitive, type WithoutChild } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        value,
        label,
        children: childrenProp,
        disabled = false,
        ...restProps
    }: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
    class={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        disabled ? "pl-2" : "pl-8",
        className,
    )}
    {disabled}
    {value}
    bind:ref
    {...restProps}
>
    {#snippet children({ selected, highlighted })}
        {#if !disabled}
            <span class="absolute left-2 flex size-3.5 items-center justify-center">
                {#if selected}
                    <Check class="size-4" />
                {/if}
            </span>
        {/if}
        {#if childrenProp}
            {@render childrenProp({ selected, highlighted })}
        {:else}
            {label || value}
        {/if}
    {/snippet}
</SelectPrimitive.Item>

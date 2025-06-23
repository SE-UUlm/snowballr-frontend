<script lang="ts">
    import { Select as SelectPrimitive, type WithoutChild } from "bits-ui";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithoutChild<SelectPrimitive.TriggerProps> = $props();
</script>

<SelectPrimitive.Trigger
    class={cn(
        "border-input bg-background flex h-10 w-full items-center justify-between gap-1.5 rounded-md px-3 py-2 text-sm focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className,
    )}
    bind:ref
    {...restProps}
>
    {@render children?.()}
    <ChevronDown class="size-4" />
</SelectPrimitive.Trigger>

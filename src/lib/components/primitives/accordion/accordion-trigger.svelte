<script lang="ts">
    import { Accordion as AccordionPrimitive, type WithoutChild } from "bits-ui";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        level = 3,
        children,
        ...restProps
    }: WithoutChild<AccordionPrimitive.TriggerProps> & {
        level?: AccordionPrimitive.HeaderProps["level"];
    } = $props();
</script>

<AccordionPrimitive.Header class="flex" {level}>
    <AccordionPrimitive.Trigger
        class={cn(
            "flex flex-1 items-center gap-2 py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
            className,
        )}
        bind:ref
        {...restProps}
    >
        <ChevronDown class="size-5 shrink-0 transition-transform duration-200" />
        {@render children?.()}
    </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>

<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
    import { cn, type WithoutChild } from "$lib/utils/shadcn-helper.js";

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
            "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger relative flex flex-1 items-center justify-between gap-2 rounded-lg border border-transparent py-4 text-left font-medium transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5",
            className,
        )}
        data-slot="accordion-trigger"
        bind:ref
        {...restProps}
    >
        <ChevronDownIcon
            class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
            data-slot="accordion-trigger-icon"
        />
        <ChevronUpIcon
            class="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
            data-slot="accordion-trigger-icon"
        />
        {@render children?.()}
    </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>

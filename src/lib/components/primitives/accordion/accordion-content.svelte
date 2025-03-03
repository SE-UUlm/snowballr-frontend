<script lang="ts">
    import { Accordion as AccordionPrimitive, type WithoutChild } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
    class={cn(
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all",
        className,
    )}
    bind:ref
    {...restProps}
>
    <div class="pt-0 pb-4">
        {@render children?.()}
    </div>
</AccordionPrimitive.Content>

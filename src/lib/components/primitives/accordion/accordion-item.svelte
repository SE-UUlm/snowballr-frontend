<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: AccordionPrimitive.ItemProps = $props();
</script>

<AccordionPrimitive.Item class={cn("border-b", className)} bind:ref {...restProps} />

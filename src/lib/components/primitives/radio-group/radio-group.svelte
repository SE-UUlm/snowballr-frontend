<script lang="ts">
    import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        value = $bindable(""),
        ...restProps
    }: RadioGroupPrimitive.RootProps = $props();
</script>

<RadioGroupPrimitive.Root
    class={cn("grid gap-3", className)}
    data-slot="radio-group"
    bind:ref
    bind:value
    {...restProps}
/>

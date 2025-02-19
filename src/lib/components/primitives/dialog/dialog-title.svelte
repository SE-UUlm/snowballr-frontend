<script lang="ts">
    import { Dialog as DialogPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
    class={cn("text-lg font-semibold leading-none tracking-tight", className)}
    bind:ref
    {...restProps}
/>

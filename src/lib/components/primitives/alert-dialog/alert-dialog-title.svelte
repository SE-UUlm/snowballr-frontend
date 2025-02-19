<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        level = 3,
        ...restProps
    }: AlertDialogPrimitive.TitleProps = $props();
</script>

<AlertDialogPrimitive.Title
    class={cn("text-lg font-semibold", className)}
    {level}
    bind:ref
    {...restProps}
/>

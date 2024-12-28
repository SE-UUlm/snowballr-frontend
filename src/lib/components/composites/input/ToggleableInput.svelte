<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper";
    import autosize from "svelte-autosize";

    type Props = WithElementRef<HTMLInputAttributes> & {
        isEditable: boolean;
    };

    let { isEditable = $bindable(false), value = $bindable(), class: className }: Props = $props();
</script>

<textarea
    use:autosize
    class={cn(
        "bg-background px-1.5 py-1 min-h-8 w-full resize-none text-default focus-visible:outline-hidden border",
        isEditable ? "border-input rounded-md" : "border-transparent",
        className,
    )}
    rows="1"
    {value}
    readonly={!isEditable}
></textarea>

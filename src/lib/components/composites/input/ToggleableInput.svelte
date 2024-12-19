<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils";

    type Props = WithElementRef<HTMLInputAttributes> & {
        isReadonly: boolean;
    };

    let { isReadonly = $bindable(true), value = $bindable(), class: className }: Props = $props();
</script>

<div
    class={cn(
        "border-input bg-background focus-visible:ring-ring rounded-md border px-1.5 py-1 w-full block resize-none text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 overflow-y-scroll",
        className,
    )}
    role="textbox"
    contenteditable={!isReadonly}
>
    {value}
</div>
<!--  -->

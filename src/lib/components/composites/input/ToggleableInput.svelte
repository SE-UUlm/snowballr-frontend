<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper";

    type Props = WithElementRef<HTMLInputAttributes> & {
        isEditable: boolean;
    };

    let { isEditable = $bindable(false), value = $bindable(), class: className }: Props = $props();
</script>

<!--
@component
A textarea that can be toggled between read-only and editable mode.

The `inputAction` and `inputActionProps` props are used to pass an action to the textarea.
This is used in `AbstractToggleableInput` and probably won't be needed elsewhere.

Usage:
```svelte
    <ToggleableInput {isEditable} {value} />
```
-->
<textarea
    class={cn(
        "bg-background px-1.5 py-1 min-h-8 w-full resize-none text-default focus-visible:outline-hidden border",
        isEditable ? "border-input rounded-md" : "border-transparent",
        className,
    )}
    rows="1"
    {value}
    readonly={!isEditable}
    data-testid="toggleable-input"
></textarea>

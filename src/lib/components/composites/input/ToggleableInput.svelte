<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper";
    import autosize from "svelte-autosize";
    import type { Action } from "svelte/action";

    type Props = WithElementRef<HTMLInputAttributes> & {
        isEditable: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputAction?: Action<HTMLTextAreaElement, any>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputActionProps?: any;
    };

    let {
        isEditable = $bindable(false),
        inputAction = () => {},
        inputActionProps = {},
        value = $bindable(),
        class: className,
    }: Props = $props();
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
    use:autosize
    use:inputAction={inputActionProps}
    class={cn(
        "bg-background px-1.5 py-1 min-h-8 w-full resize-none text-default focus-visible:outline-hidden border",
        isEditable ? "border-input rounded-md" : "border-transparent",
        className,
    )}
    rows="1"
    {value}
    readonly={!isEditable}
></textarea>

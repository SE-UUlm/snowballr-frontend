<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper";

    type Props = WithElementRef<HTMLInputAttributes> & {
        key: string;
        isEditable: boolean;
        onInputChange: (input: string) => void;
    };

    let {
        key,
        isEditable = $bindable(false),
        value = $bindable(),
        onInputChange,
        placeholder,
        class: className,
    }: Props = $props();
</script>

<!--
@component
A textarea that can be toggled between read-only and editable mode.

The `onInputChange` method is called whenever the input of the input changes.

Usage:
```svelte
    <ToggleableInput {isEditable} {key} onInputChange={(input) => foo(input)} />
```
-->
<textarea
    class={cn(
        "bg-background text-default min-h-8 w-full resize-none border px-1.5 py-1 focus-visible:outline-hidden",
        isEditable ? "border-input rounded-md" : "border-transparent",
        className,
    )}
    data-testid={`toggleable-input-${key}`}
    oninput={(event) => onInputChange((event.target as HTMLTextAreaElement)?.value as string)}
    {placeholder}
    readonly={!isEditable}
    rows="1"
    {value}
></textarea>

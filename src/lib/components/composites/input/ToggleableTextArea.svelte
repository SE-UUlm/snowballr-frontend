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
    }: Props = $props();
</script>

<!--
@component
A textarea that can be toggled between read-only and editable mode.

The `onInputChange` method is called whenever the input of the input changes.

Usage:
```svelte
    <ToggleableTextArea {isEditable} {key} onInputChange={(input) => foo(input)} />
```
-->
{#if isEditable}
    <textarea
        class="bg-background text-default border-input h-full min-h-8 w-full resize-none rounded-md border px-1.5 py-1 focus-visible:outline-hidden"
        data-testid={`toggleable-textarea-${key}`}
        oninput={(event) => onInputChange((event.target as HTMLTextAreaElement)?.value as string)}
        {placeholder}
        rows="1"
        {value}
    ></textarea>
{:else}
    <div
        class={cn(
            "bg-background text-default h-full w-full overflow-y-hidden border border-transparent px-1.5 py-1",
            !value ? "text-neutral-500/85" : "",
        )}
        data-testid={`toggleable-textarea-${key}`}
    >
        {value ? value : placeholder}
    </div>
{/if}

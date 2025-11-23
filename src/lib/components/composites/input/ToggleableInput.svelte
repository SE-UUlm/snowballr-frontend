<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper";
    import Input from "./Input.svelte";

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
An input that can be toggled between read-only and editable mode.

The `onInputChange` method is called whenever the input of the input changes.

Usage:
```svelte
    <ToggleableInput {isEditable} {key} onInputChange={(input) => foo(input)} />
```
-->
{#if isEditable}
    <Input
        class="bg-background text-default w-full"
        data-testid={`toggleable-input-${key}`}
        inputClass={cn("border-input rounded-md border px-1.5", className)}
        inputId={`toggleable-input-${key}`}
        oninput={(event) => onInputChange((event.target as HTMLInputElement)?.value as string)}
        placeholder={placeholder ?? ""}
        required
        type="text"
        {value}
    />
{:else}
    <div
        class={cn(
            "bg-background text-default flex h-10 w-full items-center overflow-hidden px-[0.475rem]",
            !value ? "text-slate-500" : "",
            className,
        )}
        data-testid={`toggleable-input-${key}`}
    >
        <span class="line-clamp-1" title={value}>{value ? value : placeholder}</span>
    </div>
{/if}

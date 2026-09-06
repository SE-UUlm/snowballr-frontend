<script lang="ts">
    import { Button } from "$lib/components/primitives/button";
    import ClipboardPaste from "@lucide/svelte/icons/clipboard-paste";
    import Label from "$lib/components/primitives/label/label.svelte";
    import type { FetcherOptionSchema } from "$api/fetcher";
    import Input from "$lib/components/composites/input/Input.svelte";
    import Eye from "@lucide/svelte/icons/eye";
    import EyeClosed from "@lucide/svelte/icons/eye-closed";

    export type FetcherOption = FetcherOptionSchema & {
        id: string;
        value: string;
    };

    interface Props {
        option: FetcherOption;
        onValueChanged: (value: string) => void;
        disabled?: boolean;
    }

    let { option, onValueChanged = () => {}, disabled = false }: Props = $props();
    let value = $derived(option.value);
    let defaultDisabled = $derived(disabled || value === option.defaultValue);
    let isPasswordVisible = $derived(!option.isSecret);

    $effect(() => onValueChanged(value));
</script>

<Label style="scrollbar-width: none;" class="w-full overflow-x-scroll overflow-y-hidden">
    <span>{option.name}</span><span class="text-red-500">{option.required ? "*" : ""}</span>
</Label>
<Input
    defaultValue={option.defaultValue}
    {disabled}
    inputId={option.id}
    label=""
    onButtonClick={() => (isPasswordVisible = !isPasswordVisible)}
    placeholder={option.description}
    required={option.required}
    type={isPasswordVisible ? "text" : "password"}
    bind:value
>
    {#snippet buttonContent()}
        {#if option.isSecret}
            {#if isPasswordVisible}
                <Eye />
            {:else}
                <EyeClosed />
            {/if}
        {/if}
    {/snippet}
</Input>
<Button
    data-testid={`${option.id}-set-default-btn`}
    disabled={defaultDisabled}
    onclick={() => (value = option.defaultValue ?? "")}
    variant="ghost"
>
    <ClipboardPaste />
</Button>

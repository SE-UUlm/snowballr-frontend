<script lang="ts">
    import { buttonVariants } from "$lib/components/primitives/button";
    import * as Dialog from "$lib/components/primitives/dialog/index.js";
    import type { DialogTriggerProps } from "bits-ui";
    import type { Snippet } from "svelte";

    interface Props {
        triggerProps?: DialogTriggerProps;
        trigger: Snippet;
        title?: string;
        description?: Snippet;
        open?: boolean;
        content?: Snippet;
        footer?: Snippet;
    }

    let {
        triggerProps = {},
        trigger,
        title = "Are you absolutely sure?",
        description = undefined,
        open = $bindable(false),
        content = undefined,
        footer = undefined,
    }: Props = $props();
</script>

<!--
@component
Highly customizable Dialog Element.

Usage:
```svelte
    <Dialog title="This is the title of the dialog">
        {#snippet trigger()}
            Open Dialog
        {/snippet}
        {#snippet description()}
            This is a description
        {/snippet}
        {#snippet content()}
            This is the content
        {/snippet}
        {#snippet footer()}
            This is the footer
        {/snippet}
    </Dialog>
```
-->
<Dialog.Root bind:open>
    <Dialog.Trigger {...triggerProps} data-testid="dialog-trigger">
        {@render trigger()}
    </Dialog.Trigger>
    <Dialog.Content data-testid="dialog-content">
        <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
                {@render description?.()}
            </Dialog.Description>
        </Dialog.Header>
        {@render content?.()}
        <Dialog.Footer>
            <Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
            {@render footer?.()}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

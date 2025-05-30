<script lang="ts">
    import type { AlertDialogActionProps } from "$lib/components/primitives/alert-dialog/alert-dialog-action.svelte";
    import * as AlertDialog from "$lib/components/primitives/alert-dialog/index.js";
    import type { Snippet } from "svelte";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import type { DialogTriggerProps } from "bits-ui";
    import type { AlertDialogCancelProps } from "$lib/components/primitives/alert-dialog/alert-dialog-cancel.svelte";
    import { wrapLongWords } from "$lib/utils/common-helper";
    import Alert from "$lib/components/composites/utils/Alert.svelte";

    interface Props {
        triggerProps?: DialogTriggerProps;
        trigger?: Snippet;
        title?: string;
        description?: Snippet;
        cancelProps?: AlertDialogCancelProps;
        cancelButtonText?: string;
        actionProps?: AlertDialogActionProps;
        actionButtonText?: string;
        errorText?: string;
        loading?: boolean;
        error?: unknown;
        open?: boolean;
    }

    let {
        triggerProps = {},
        trigger = undefined,
        title = "Are you absolutely sure?",
        description = undefined,
        cancelProps = {},
        cancelButtonText = "Cancel",
        actionProps = {},
        actionButtonText = "Confirm",
        errorText = "An error occurred",
        loading = $bindable(false),
        error = $bindable(undefined),
        open = $bindable(false),
    }: Props = $props();
</script>

<!--
@component
Highly customizable AlertDialog Element.

Bindings:
- `loading`: Whether the action button is in a loading state.
- `error`: The error object e.g. from a `catch` block, when defined, an error alert is shown.

With those bindings you can easily handle the loading state and error state of the dialog.
Example:
```svelte
    <script lang="ts">
        ...

        let loading = $state(false);
        let error = $state<unknown>(undefined);
        let open = $state(false);

        function dialogOnClick() {
            error = undefined;
            loading = true;
            await someAsyncFunction()
                .then(() => {
                    console.log("Success");
                    open = false;
                })
                .catch((error) => {
                    console.error("Error", error);
                    error = error;
                });
            loading = false;
        }
    </script>

    ...

    <AlertDialog
        ...
        actionProps={{
            onclick: dialogOnClick,
        }}
        bind:loading
        bind:error
        bind:open
    >
        ...
    </AlertDialog>
```

Usage:
```svelte
    <AlertDialog
        title="This is the title of the dialog"
        actionProps={{
            variant: "destructive",
            onclick: () => console.log("Action button clicked"),
        }}
        actionButtonText="Execute Destructive Action"
        errorText="Couldn't execute action"
    >
        {#snippet trigger()}
            Open Dialog
        {/snippet}
        {#snippet description()}
            This is a description
        {/snippet}
    </AlertDialog>
```
-->
<AlertDialog.Root bind:open>
    {#if trigger}
        <AlertDialog.Trigger {...triggerProps} data-testid="alert-dialog-trigger">
            {@render trigger()}
        </AlertDialog.Trigger>
    {/if}
    <AlertDialog.Content>
        <AlertDialog.Header>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <AlertDialog.Title><h1>{@html wrapLongWords(title, 30)}</h1></AlertDialog.Title>
            <AlertDialog.Description class="text-default-m" data-testid="alert-dialog-description">
                {@render description?.()}
            </AlertDialog.Description>
        </AlertDialog.Header>
        {#if error}
            <Alert title={errorText} variant="error" />
        {/if}
        <AlertDialog.Footer>
            <AlertDialog.Cancel {...cancelProps} data-testid="alert-dialog-cancel">
                {cancelButtonText}
            </AlertDialog.Cancel>
            <AlertDialog.Action
                {...actionProps}
                data-testid="alert-dialog-action"
                disabled={loading}
            >
                {#if loading}
                    <LoaderCircle class="animate-spin" />
                {/if}
                {actionButtonText}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

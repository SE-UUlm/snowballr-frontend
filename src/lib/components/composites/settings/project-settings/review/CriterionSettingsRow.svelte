<script lang="ts">
    import { Button } from "$lib/components/primitives/button";
    import { Input } from "$lib/components/primitives/input";
    import { Label } from "$lib/components/primitives/label";
    import {
        getDraftStatus,
        validateDraft,
        type CriterionDraft,
        type CriterionFields,
    } from "$lib/model/criteria-draft";
    import { cn } from "$lib/utils/shadcn-helper";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Trash from "@lucide/svelte/icons/trash";
    import Undo2 from "@lucide/svelte/icons/undo-2";

    interface Props {
        draft: CriterionDraft;
        /** All drafts of the project, used to check that the tag is unique. */
        drafts: CriterionDraft[];
        editing: boolean;
        disabled?: boolean;
        onEdit: () => void;
        onApply: (fields: CriterionFields) => void;
        onCancel: () => void;
        onRemove: () => void;
        onRestore: () => void;
    }

    const {
        draft,
        drafts,
        editing,
        disabled = false,
        onEdit,
        onApply,
        onCancel,
        onRemove,
        onRestore,
    }: Props = $props();

    const status = $derived(getDraftStatus(draft));

    const STATUS_LABELS = {
        unchanged: undefined,
        added: "New",
        edited: "Edited",
        removed: "Removed",
    } as const;

    // svelte-ignore state_referenced_locally
    let fields: CriterionFields = $state({
        tag: draft.tag,
        name: draft.name,
        description: draft.description,
    });
    let showErrors = $state(false);
    const errors = $derived(validateDraft(fields, draft.key, drafts));

    $effect(() => {
        if (editing) {
            fields = { tag: draft.tag, name: draft.name, description: draft.description };
            showErrors = false;
        }
    });

    function apply(event: Event) {
        event.preventDefault();
        showErrors = true;
        if (Object.keys(errors).length > 0) return;
        onApply(fields);
    }

    function cancelOnEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
        }
    }

    /** Focuses the name if the tag was suggested, otherwise the tag. */
    function focusFirstField(node: HTMLElement) {
        const target = draft.name === "" ? "name" : "tag";
        node.querySelector<HTMLInputElement>(`[data-field="${target}"]`)?.focus();
    }

    const fieldId = $derived(`criterion-${draft.key}`);
</script>

<!--
@component
A single criterion in the review criteria settings.

Shows the tag, name and description of a criterion together with its pending change, i.e. whether
it is new, edited or about to be removed. While `editing` is set, the criterion is shown as a small
form. Applying the form only changes the draft; the changes are stored by the surrounding
`CriteriaSettings`.

Usage:
```svelte
    <CriterionSettingsRow {draft} {drafts} editing={false} onEdit={...} onApply={...} ... />
```
-->
<li
    class={cn(
        "relative flex flex-col rounded-md border-l-4 border-transparent py-2 pr-1 pl-3",
        status === "added" && "border-success",
        status === "edited" && "border-warning",
        status === "removed" && "border-error",
        editing && "bg-muted/60 border-primary",
    )}
    data-status={status}
    data-testid="criterion-settings-row"
>
    {#if editing}
        <form
            class="flex flex-col gap-3 py-1"
            aria-label={`Edit criterion ${draft.tag || "without tag"}`}
            novalidate
            onsubmit={apply}
            use:focusFirstField
        >
            <div class="flex flex-col gap-3 sm:flex-row">
                <div class="flex flex-col gap-1.5 sm:w-28">
                    <Label for={`${fieldId}-tag`}>Tag</Label>
                    <Input
                        id={`${fieldId}-tag`}
                        class="h-9 px-3 py-2 font-bold"
                        aria-describedby={showErrors && errors.tag
                            ? `${fieldId}-tag-error`
                            : undefined}
                        aria-invalid={showErrors && errors.tag !== undefined}
                        autocomplete="off"
                        data-field="tag"
                        maxlength={20}
                        onkeydown={cancelOnEscape}
                        bind:value={fields.tag}
                    />
                    {#if showErrors && errors.tag}
                        <p id={`${fieldId}-tag-error`} class="text-error text-sm">{errors.tag}</p>
                    {/if}
                </div>
                <div class="flex flex-1 flex-col gap-1.5">
                    <Label for={`${fieldId}-name`}>Name</Label>
                    <Input
                        id={`${fieldId}-name`}
                        class="h-9 px-3 py-2"
                        aria-describedby={showErrors && errors.name
                            ? `${fieldId}-name-error`
                            : undefined}
                        aria-invalid={showErrors && errors.name !== undefined}
                        autocomplete="off"
                        data-field="name"
                        onkeydown={cancelOnEscape}
                        placeholder="e.g. Not peer reviewed"
                        bind:value={fields.name}
                    />
                    {#if showErrors && errors.name}
                        <p id={`${fieldId}-name-error`} class="text-error text-sm">
                            {errors.name}
                        </p>
                    {/if}
                </div>
            </div>
            <div class="flex flex-col gap-1.5">
                <Label for={`${fieldId}-description`}>Description</Label>
                <textarea
                    id={`${fieldId}-description`}
                    class="border-input-border-slate bg-background text-default placeholder:text-placeholder min-h-16 w-full rounded-md border px-3 py-2 focus-visible:outline-hidden"
                    aria-describedby={showErrors && errors.description
                        ? `${fieldId}-description-error`
                        : undefined}
                    aria-invalid={showErrors && errors.description !== undefined}
                    onkeydown={cancelOnEscape}
                    placeholder="When does this criterion apply to a paper?"
                    rows="2"
                    bind:value={fields.description}
                ></textarea>
                {#if showErrors && errors.description}
                    <p id={`${fieldId}-description-error`} class="text-error text-sm">
                        {errors.description}
                    </p>
                {/if}
            </div>
            <div class="flex flex-row justify-end gap-2">
                <Button onclick={onCancel} size="sm" type="button" variant="ghost">Cancel</Button>
                <Button size="sm" type="submit">Done</Button>
            </div>
        </form>
    {:else}
        <div class="flex flex-row flex-wrap items-start gap-x-3">
            <div
                class={cn(
                    "flex min-w-0 flex-1 basis-48 flex-col gap-0.5",
                    status === "removed" && "text-muted-foreground [&_.strike]:line-through",
                )}
            >
                <div class="flex min-h-9 flex-row flex-wrap items-center gap-x-2">
                    <span class="strike shrink-0 font-bold">{draft.tag}</span>
                    <span class="strike min-w-0 break-words sm:truncate" title={draft.name}>
                        {draft.name}
                    </span>
                    {#if STATUS_LABELS[status]}
                        <span
                            class={cn(
                                "shrink-0 text-sm",
                                status === "added" && "text-success",
                                status === "edited" && "text-warning",
                                status === "removed" && "text-error",
                            )}
                        >
                            {STATUS_LABELS[status]}
                        </span>
                    {/if}
                </div>
                {#if draft.description}
                    <p class="strike text-muted-foreground max-w-prose text-sm break-words">
                        {draft.description}
                    </p>
                {/if}
            </div>
            {#if status === "removed"}
                <Button
                    aria-label={`Keep criterion ${draft.tag}`}
                    {disabled}
                    onclick={onRestore}
                    size="sm"
                    variant="ghost"
                >
                    <Undo2 />
                    Keep
                </Button>
            {:else}
                <Button
                    class="size-9"
                    aria-label={`Edit criterion ${draft.tag}`}
                    {disabled}
                    onclick={onEdit}
                    size="icon"
                    variant="ghost"
                >
                    <Pencil />
                </Button>
                <Button
                    class="size-9 text-red-600"
                    aria-label={`Remove criterion ${draft.tag}`}
                    {disabled}
                    onclick={onRemove}
                    size="icon"
                    variant="ghost"
                >
                    <Trash />
                </Button>
            {/if}
        </div>
    {/if}
</li>

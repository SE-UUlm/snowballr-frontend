<script lang="ts">
    import { CriterionCategory, type Criterion } from "$api/criterion";
    import type { Project } from "$api/project";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { Button } from "$lib/components/primitives/button";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { backendService } from "$lib/grpc-api";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import {
        collectChanges,
        countChanges,
        getDraftStatus,
        newDraft,
        toDraft,
        type CriterionDraft,
        type CriterionFields,
    } from "$lib/model/criteria-draft";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import Plus from "@lucide/svelte/icons/plus";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import CriterionSettingsRow from "./CriterionSettingsRow.svelte";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    const CATEGORIES = [
        {
            category: CriterionCategory.HARD_EXCLUSION,
            title: "Hard Exclusion",
            hint: "A paper that meets one of these is declined, whatever else applies.",
            emptyHint: "No hard exclusion criteria yet.",
        },
        {
            category: CriterionCategory.EXCLUSION,
            title: "Soft Exclusion",
            hint: "A paper that meets one of these should be declined.",
            emptyHint: "No soft exclusion criteria yet.",
        },
        {
            category: CriterionCategory.INCLUSION,
            title: "Inclusion",
            hint: "A paper that meets one of these should be accepted.",
            emptyHint: "No inclusion criteria yet.",
        },
    ] as const;

    let drafts: CriterionDraft[] = $state([]);
    let editingKey: string | undefined = $state(undefined);
    let loadingCriteria = $state(true);
    let loadError: ActionError = $state(undefined);
    let saveError: ActionError = $state(undefined);
    let currentStage = $state(0n);
    let confirmOpen = $state(false);
    const saving = $state({ value: false });

    const changes = $derived(collectChanges(projectId, drafts));
    const numberOfChanges = $derived(countChanges(changes));
    const changedDrafts = $derived(drafts.filter((draft) => getDraftStatus(draft) !== "unchanged"));
    const disabled = $derived(isProjectArchived || loadingCriteria || saving.value);

    onMount(async () => {
        await Promise.all([
            backendService
                .getAllCriteriaForProject({ id: projectId })
                .response.then(({ criteria }) => {
                    drafts = criteria.map(toDraft);
                })
                .catch((error) => {
                    loadError = createActionError(
                        "Failed to Load the Criteria",
                        { action: "loading the review criteria" },
                        error,
                    );
                }),
            loadingProject
                .then((project) => {
                    currentStage = project.currentStage;
                })
                .catch(() => {
                    // Without a stage, ask for confirmation to be on the safe side.
                    currentStage = 1n;
                }),
        ]);
        loadingCriteria = false;
    });

    function draftsOf(category: CriterionCategory) {
        return drafts.filter((draft) => draft.category === category);
    }

    function addCriterion(category: CriterionCategory) {
        const draft = newDraft(category, drafts);
        drafts.push(draft);
        editingKey = draft.key;
    }

    function updateDraft(key: string, update: Partial<CriterionDraft>) {
        drafts = drafts.map((draft) => (draft.key === key ? { ...draft, ...update } : draft));
    }

    function applyEdit(key: string, fields: CriterionFields) {
        updateDraft(key, fields);
        editingKey = undefined;
    }

    /** A new criterion that was never applied has no name yet and is dropped on cancel. */
    function cancelEdit(draft: CriterionDraft) {
        if (!draft.stored && draft.name === "") {
            drafts = drafts.filter(({ key }) => key !== draft.key);
        }
        editingKey = undefined;
    }

    function removeCriterion(draft: CriterionDraft) {
        if (draft.stored) {
            updateDraft(draft.key, { removed: true });
        } else {
            drafts = drafts.filter(({ key }) => key !== draft.key);
        }
    }

    function discardChanges() {
        drafts = drafts
            .filter((draft) => draft.stored)
            .map((draft) => toDraft(draft.stored as Criterion));
        saveError = undefined;
    }

    function requestSave() {
        saveError = undefined;
        if (currentStage > 0n) {
            confirmOpen = true;
        } else {
            void loadingWrapper(saving, saveChanges, undefined);
        }
    }

    /**
     * Stores the changed drafts. Removals run first and additions last, so that a tag can be handed
     * from one criterion to another in a single save.
     *
     * Drafts whose request fails stay unsaved, so the admin can retry without entering them again.
     */
    async function saveChanges() {
        const total = numberOfChanges;
        const results: Record<string, CriterionDraft | null> = {};
        let failures = 0;

        async function run(
            status: "removed" | "edited" | "added",
            request: (draft: CriterionDraft) => Promise<CriterionDraft | null>,
        ) {
            const affected = drafts.filter((draft) => getDraftStatus(draft) === status);
            await Promise.all(
                affected.map((draft) =>
                    request(draft)
                        .then((result) => (results[draft.key] = result))
                        .catch(() => failures++),
                ),
            );
        }

        await run("removed", (draft) =>
            backendService.deleteCriterion({ id: draft.stored!.id }).response.then(() => null),
        );
        await run("edited", (draft) => {
            const [update] = collectChanges(projectId, [draft]).updates;
            return backendService.updateCriterion(update).response.then(toDraft);
        });
        await run("added", (draft) => {
            const [create] = collectChanges(projectId, [draft]).creates;
            return backendService.createCriterion(create).response.then(toDraft);
        });

        drafts = drafts
            .map((draft) => (draft.key in results ? results[draft.key] : draft))
            .filter((draft) => draft !== null);

        if (failures > 0) {
            saveError = createActionError("Failed to Save All Criteria", {
                customDetails: `${failures} of ${total} changes couldn't be saved. They are still marked below, so you can save them again.`,
            });
        } else {
            toast.success("Successfully saved review criteria.");
            confirmOpen = false;
        }
    }

    const CHANGE_VERBS = { added: "Add", edited: "Change", removed: "Remove", unchanged: "" };

    function summarizeChanges(): string {
        const parts = [
            [changes.creates.length, "new"],
            [changes.updates.length, "edited"],
            [changes.deletes.length, "removed"],
        ]
            .filter(([count]) => count !== 0)
            .map(([count, label]) => `${count} ${label}`);
        return `Not saved yet: ${parts.join(", ")}.`;
    }
</script>

<!--
@component
This component renders a section within the Review project settings. It allows project admins to
add, edit and remove the hard exclusion, soft exclusion and inclusion criteria reviewers choose from
in the review mode.

Changes are collected first and stored together. Once the project is past stage 0, the admin has to
confirm the changes, since they can affect the outcome of the literature review.

Usage:
```svelte
    <CriteriaSettings {loadingProject} {projectId} />
```
-->
<SettingsSection
    loading={loadingCriteria || saving.value}
    locked={isProjectArchived}
    lockedDescription="The criteria of an archived project can't be changed."
    sectionTitle="Review Criteria"
>
    <p class="max-w-2xl">
        Reviewers select the criteria a paper meets to justify their decision in the review mode.
    </p>
    <ActionErrorAlert class="max-w-2xl" error={loadError} />

    <div class="mt-3 flex max-w-2xl flex-col gap-6">
        {#each CATEGORIES as { category, title, hint, emptyHint } (category)}
            {@const categoryDrafts = draftsOf(category)}
            <section class="flex flex-col gap-2" aria-labelledby={`criteria-${category}-title`}>
                <div class="flex flex-col">
                    <h3 id={`criteria-${category}-title`} class="text-default-sb">{title}</h3>
                    <p class="text-muted-foreground text-sm">{hint}</p>
                </div>
                {#if loadingCriteria}
                    <Skeleton class="h-9 w-full" data-testid="skeleton" />
                {:else}
                    {#if categoryDrafts.length > 0}
                        <ul class="flex flex-col gap-1">
                            {#each categoryDrafts as draft (draft.key)}
                                <CriterionSettingsRow
                                    disabled={disabled ||
                                        (editingKey !== undefined && editingKey !== draft.key)}
                                    {draft}
                                    {drafts}
                                    editing={editingKey === draft.key}
                                    onApply={(fields) => applyEdit(draft.key, fields)}
                                    onCancel={() => cancelEdit(draft)}
                                    onEdit={() => (editingKey = draft.key)}
                                    onRemove={() => removeCriterion(draft)}
                                    onRestore={() => updateDraft(draft.key, { removed: false })}
                                />
                            {/each}
                        </ul>
                    {:else}
                        <p class="text-hint pl-4">{emptyHint}</p>
                    {/if}
                    <Button
                        class="w-fit"
                        aria-label={`Add criterion to ${title}`}
                        disabled={disabled || editingKey !== undefined}
                        onclick={() => addCriterion(category)}
                        size="sm"
                        variant="ghost"
                    >
                        <Plus />
                        Add criterion
                    </Button>
                {/if}
            </section>
        {/each}
    </div>

    {#if numberOfChanges > 0 || saveError}
        <div
            class="bg-background sticky bottom-0 flex max-w-2xl flex-row flex-wrap items-center gap-3 rounded-md border p-3"
            data-testid="criteria-save-bar"
        >
            <p class="flex-1 basis-48 text-sm" aria-live="polite">
                {#if editingKey !== undefined}
                    Finish editing the open criterion to save your changes.
                {:else if numberOfChanges > 0}
                    {summarizeChanges()}
                {/if}
            </p>
            <div class="flex flex-row flex-wrap gap-2">
                <Button
                    disabled={saving.value || numberOfChanges === 0}
                    onclick={discardChanges}
                    variant="ghost"
                >
                    Discard changes
                </Button>
                <LoadingButton
                    class="w-40 max-w-full"
                    disabled={disabled || editingKey !== undefined || numberOfChanges === 0}
                    label="Save criteria"
                    loading={saving.value && !confirmOpen}
                    loadingLabel="Saving"
                    onclick={requestSave}
                />
            </div>
        </div>
    {/if}
    <ActionErrorAlert class="max-w-2xl" error={saveError} />
</SettingsSection>

<AlertDialog
    actionButtonLoadingText="Saving"
    actionButtonText="Save criteria"
    actionProps={{
        class: "w-full sm:w-40",
        onclick: () => loadingWrapper(saving, saveChanges, undefined),
    }}
    cancelButtonText="Keep editing"
    error={confirmOpen ? saveError : undefined}
    loading={saving.value}
    title={`Change Criteria During Stage ${currentStage}?`}
    bind:open={confirmOpen}
>
    {#snippet description()}
        <div class="flex flex-col gap-3">
            <p>
                Papers in earlier stages were reviewed against the current criteria. Changing them
                now means not every paper is judged by the same rules, which can affect the outcome
                of your literature review.
            </p>
            <ul class="text-foreground flex flex-col gap-1" aria-label="Changes to save">
                {#each changedDrafts as draft (draft.key)}
                    <li>
                        {CHANGE_VERBS[getDraftStatus(draft)]}
                        <span class="font-bold">{draft.tag.trim()}</span>
                        {draft.name.trim()}
                    </li>
                {/each}
            </ul>
        </div>
    {/snippet}
</AlertDialog>

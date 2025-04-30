<script lang="ts">
    import Checkbox from "$lib/components/primitives/checkbox/checkbox.svelte";
    import CircleHelp from "lucide-svelte/icons/circle-help";
    import Tooltip from "../utils/Tooltip.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import UserAvatar from "../user-avatar/UserAvatar.svelte";
    import type { User } from "$lib/model/api/user";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import { getSelectedReviewCriteriaContext } from "$lib/utils/custom-context";

    interface Props {
        reviewers: User[];
        criterion: CriterionWithReviews;
    }

    let { reviewers, criterion }: Props = $props();

    const selectedReviewCriteriaState = getSelectedReviewCriteriaContext();
    const isCriterionChecked = selectedReviewCriteriaState.criteria.includes(criterion.id);

    /**
     * If this criterion was not checked before, then it will be added to the selected review
     * criteria list, otherwise it will be deleted from this list.
     */
    function toggleReviewCriteriaInState() {
        const criterionId = criterion.id;
        if (!isCriterionChecked) {
            selectedReviewCriteriaState.criteria.push(criterionId);
        } else {
            selectedReviewCriteriaState.criteria = selectedReviewCriteriaState.criteria.filter(
                (id) => id !== criterionId,
            );
        }
    }
</script>

<!--
@component
Single list element for a criterion.

- `reviewers` should contain all users that are referenced in the reviews of `criterion`.

When `reviewMode.isActivated` is true, a checkbox is shown in front of the list element.
When checked, this means that the criterion applies to the current paper.
Otherwise, the list of reviewers, who already checked this checkbox are listed.

Usage:
```svelte
    <ul>
        <CriterionListEntry {reviewers} {criterion} />
    </ul>
```
-->
<li class="flex flex-row items-center gap-4" data-testid="criterion-list-entry">
    {#if reviewMode.isActivated}
        <Checkbox
            checked={isCriterionChecked}
            data-testid="criterion-checkbox"
            disabled={isCriterionChecked}
            onCheckedChange={toggleReviewCriteriaInState}
        />
    {/if}
    <div class="flex flex-row gap-2 truncate">
        <span class="font-bold">{criterion.tag}</span>
        <span class="truncate" title={criterion.name}>{criterion.name}</span>
    </div>
    <Tooltip
        class="p-0 [&_svg]:size-6"
        aria-label={criterion.description}
        openOnClick
        triggerSize="fit"
        triggerVariant="none"
    >
        {#snippet trigger()}
            <CircleHelp class="text-neutral-500" />
        {/snippet}
        {#snippet content()}
            {criterion.description}
        {/snippet}
    </Tooltip>
    {#if !reviewMode.isActivated}
        <div class="flex flex-row gap-2.5 pl-2">
            {#each criterion.reviews as review (review.id)}
                <UserAvatar
                    reviewDecision={review.decision}
                    size="small"
                    user={reviewers.find((reviewer) => review.userId === reviewer.id)}
                />
            {/each}
        </div>
    {/if}
</li>

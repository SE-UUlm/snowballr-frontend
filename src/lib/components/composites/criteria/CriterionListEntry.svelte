<script lang="ts">
    import Checkbox from "$lib/components/primitives/checkbox/checkbox.svelte";
    import CircleHelp from "lucide-svelte/icons/circle-help";
    import Tooltip from "../Tooltip.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import UserAvatar from "../user-avatar/UserAvatar.svelte";
    import type { User } from "$lib/model/api/user";

    interface Props {
        inReviewMode: boolean;
        reviewers: User[];
        criterion: CriterionWithReviews;
    }

    let { inReviewMode, reviewers, criterion }: Props = $props();
</script>

<!--
@component
Single list element for a criterion.

- When `inReviewMode` is true, a checkbox is shown in front of the list element.
  When checked, this means that the criterion applies to the current paper.
  Otherwise, the list of reviewers, who already checked this checkbox are listed.
- `reviewers` should contain all users that are referenced in the reviews of `criterion`.

Usage:
```svelte
    <ul>
        <CriterionListEntry inReviewMode={true} {reviewers} {criterion} />
    </ul>
```
-->
<li class="flex flex-row items-center gap-4" data-testid="criterion-list-entry">
    {#if inReviewMode}
        <!-- Will be extended in https://github.com/SE-UUlm/snowballr-frontend/issues/53 -->
        <Checkbox data-testid="criterion-checkbox" />
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
    {#if !inReviewMode}
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

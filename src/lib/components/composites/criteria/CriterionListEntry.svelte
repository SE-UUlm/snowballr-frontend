<script lang="ts">
    import Checkbox from "$lib/components/primitives/checkbox/checkbox.svelte";
    import CircleHelp from "lucide-svelte/icons/circle-help";
    import Tooltip from "../Tooltip.svelte";
    import type { ReviewedCriterion } from "$lib/model/general";
    import UserAvatar from "../user-avatar/UserAvatar.svelte";
    import type { User } from "$lib/model/api/user";

    interface Props {
        inReviewMode: boolean;
        reviewers: User[];
        criterion: ReviewedCriterion;
    }

    let { inReviewMode, reviewers, criterion }: Props = $props();
</script>

<!--
@component
Single Criterion List Element.

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
<li class="flex flex-row gap-2.5 items-center" data-testid="criterion-list-entry">
    {#if inReviewMode}
        <!-- Will be extended in https://github.com/SE-UUlm/snowballr-frontend/issues/53 -->
        <Checkbox data-testid="criterion-checkbox" />
    {/if}
    <div class="flex flex-row gap-1.5">
        <span class="font-bold">{criterion.tag}</span>
        <span>{criterion.name}</span>
    </div>
    <Tooltip
        class="[&_svg]:size-6 p-0"
        aria-label={criterion.description}
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
        {#each criterion.reviews as review (review.id)}
            <UserAvatar
                reviewDecision={review.decision}
                user={reviewers.find((reviewer) => review.userId === reviewer.id)}
            />
        {/each}
    {/if}
</li>

<script lang="ts">
    import CriterionListEntry from "./CriterionListEntry.svelte";
    import type { ReviewedCriterion } from "$lib/model/general";
    import type { User } from "$lib/model/api/user";
    import CriterionListEntrySkeleton from "./CriterionListEntrySkeleton.svelte";

    interface Props {
        listTitle: string;
        inReviewMode: boolean;
        reviewers: Promise<User[]>;
        criteria: Promise<ReviewedCriterion[]>;
        numberOfSkeletons?: number;
        emptyHint: string;
    }

    let {
        listTitle,
        inReviewMode,
        reviewers: loadingReviewers,
        criteria: loadingCriteria,
        numberOfSkeletons = 2,
        emptyHint,
    }: Props = $props();
</script>

<!--
@component
A list of criteria.

- `inReviewMode`: whether the criteria is shown in review mode or not
- `listTitle` is displayed as header of the list

Usage:
```svelte
    <CriteriaList listTitle="Hard Exclusion" {inReviewMode} {reviewers} {criteria} />
```
-->
<section class="flex flex-col gap-5">
    <h2>{listTitle}</h2>
    <ul class="flex flex-col gap-4 pl-2">
        {#await Promise.all([loadingReviewers, loadingCriteria])}
            {#each { length: numberOfSkeletons }, i}
                <CriterionListEntrySkeleton
                    {inReviewMode}
                    numberOfReviews={i % 2 ? i / 2 : (i % 3) + 1}
                />
            {/each}
        {:then [reviewers, criteria]}
            {#each criteria as criterion}
                <CriterionListEntry {inReviewMode} {reviewers} {criterion} />
            {/each}
            {#if criteria.length === 0}
                <span class="text-hint italic">{emptyHint}</span>
            {/if}
        {:catch error}
            {console.error(`Failed to load criteria: ${error}`)}
            <span class="text-error">Couldn't load Criteria</span>
        {/await}
    </ul>
</section>

<script lang="ts">
    import CriterionListEntry from "./CriterionListEntry.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import type { User } from "$lib/model/api/user";
    import CriterionListEntrySkeleton from "./CriterionListEntrySkeleton.svelte";
    import NamedList from "../list/NamedList.svelte";

    interface Props {
        listTitle: "Hard Exclusion" | "Soft Exclusion" | "Inclusion";
        reviewers: Promise<User[]>;
        criteria: Promise<CriterionWithReviews[]>;
        numberOfSkeletons?: number;
        emptyHint: string;
    }

    let {
        listTitle,
        reviewers: loadingReviewers,
        criteria: loadingCriteria,
        numberOfSkeletons = 2,
        emptyHint,
    }: Props = $props();

    const items = Promise.all([loadingReviewers, loadingCriteria]).then(([reviewers, criteria]) =>
        criteria.map((criterion) => ({ criterion, reviewers })),
    );
</script>

<!--
@component
A list of criteria.

- `listTitle` is displayed as header of the list

Usage:
```svelte
    <CriteriaList listTitle="Hard Exclusion" {reviewers} {criteria} />
```
-->
<section class="flex flex-col gap-5 overflow-hidden">
    <NamedList
        {emptyHint}
        errorHint="Couldn't load criteria"
        {items}
        keySelector={(item) => item.criterion.id}
        listName={listTitle}
        {numberOfSkeletons}
    >
        {#snippet listItemComponent(item)}
            <CriterionListEntry criterion={item.criterion} reviewers={item.reviewers} />
        {/snippet}
        {#snippet listItemSkeleton(i)}
            <CriterionListEntrySkeleton numberOfReviews={i % 2} />
        {/snippet}
    </NamedList>
</section>

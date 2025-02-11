<script lang="ts">
    import CriteriaList from "$lib/components/composites/criteria/CriteriaList.svelte";
    import { CriterionCategory } from "$lib/model/api/criterion";
    import { type User } from "$lib/model/api/user";
    import type { ReviewedCriterion } from "$lib/model/general";

    export interface ReviewCriteriaListProps {
        inReviewMode: boolean;
        reviewers: Promise<User[]>;
        reviewedCriteria: Promise<ReviewedCriterion[]>;
    }

    let {
        inReviewMode,
        reviewers,
        reviewedCriteria: loadingCriteria,
    }: ReviewCriteriaListProps = $props();

    const hardExclusions = loadingCriteria.then((criteria) =>
        criteria.filter((criterion) => criterion.category === CriterionCategory.HARD_EXCLUSION),
    );
    const exclusions = loadingCriteria.then((criteria) =>
        criteria.filter((criterion) => criterion.category === CriterionCategory.EXCLUSION),
    );
    const inclusions = loadingCriteria.then((criteria) =>
        criteria.filter((criterion) => criterion.category === CriterionCategory.INCLUSION),
    );
</script>

<CriteriaList
    listTitle="Hard Exclusion"
    {inReviewMode}
    {reviewers}
    criteria={hardExclusions}
    emptyHint="No hard exclusion criteria."
/>
<CriteriaList
    listTitle="Soft Exclusion"
    {inReviewMode}
    {reviewers}
    criteria={exclusions}
    emptyHint="No soft exclusion criteria."
/>
<CriteriaList
    listTitle="Inclusion"
    {inReviewMode}
    {reviewers}
    criteria={inclusions}
    emptyHint="No inclusion criteria."
/>

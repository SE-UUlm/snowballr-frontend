<script lang="ts">
    import CriteriaList from "$lib/components/composites/criteria/CriteriaList.svelte";
    import { CriterionCategory } from "$lib/model/api/criterion";
    import { type User } from "$lib/model/api/user";
    import type { CriterionWithReviews } from "$lib/model/general";

    export interface ReviewCriteriaListProps {
        reviewers: Promise<User[]>;
        criteriaWithReviews: Promise<CriterionWithReviews[]>;
    }

    let { reviewers, criteriaWithReviews: loadingCriteria }: ReviewCriteriaListProps = $props();

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

<div class="flex flex-[1_1_0] flex-col gap-5 overflow-hidden">
    <CriteriaList
        criteria={hardExclusions}
        emptyHint="No hard exclusion criteria."
        listTitle="Hard Exclusion"
        {reviewers}
    />
    <CriteriaList
        criteria={exclusions}
        emptyHint="No soft exclusion criteria."
        listTitle="Soft Exclusion"
        {reviewers}
    />
    <CriteriaList
        criteria={inclusions}
        emptyHint="No inclusion criteria."
        listTitle="Inclusion"
        {reviewers}
    />
</div>

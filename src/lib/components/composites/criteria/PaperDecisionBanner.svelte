<script lang="ts">
    import { PaperDecision, Project_Paper } from "$lib/model/api/project";
    import type { User } from "$lib/model/api/user";
    import { resource } from "$lib/resource.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import UserAvatar from "../user-avatar/UserAvatar.svelte";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import UserAvatarSkeleton from "../user-avatar/UserAvatarSkeleton.svelte";
    import ErrorIndicator from "../utils/ErrorIndicator.svelte";
    import { getStatusColor, getStatusText } from "$lib/utils/common-helper";

    export interface PaperDecisionBannerProps {
        reviewers: Promise<User[]>;
        loadingProjectPaper: Promise<Project_Paper>;
    }

    const { reviewers: loadingReviewers, loadingProjectPaper }: PaperDecisionBannerProps = $props();

    const bannerColor = resource<Project_Paper, string>(loadingProjectPaper, {
        initialValue: "bg-unreviewed-gray",
        onSuccess: (paper) => getStatusColor(getStatusText(paper.decision), "bg"),
        onErrorValue: "bg-unreviewed-gray",
    });
    const bannerLabel = resource<Project_Paper, string>(loadingProjectPaper, {
        initialValue: "",
        onSuccess: (paper) => getStatusText(paper.decision),
        onErrorValue: "Couldn't load paper decision",
    });
</script>

<div
    class={cn(
        "flex w-full flex-row flex-wrap items-center justify-center gap-3 rounded-2xl p-2.5 sm:gap-5",
        bannerColor.value,
    )}
>
    {#await Promise.all([loadingReviewers, loadingProjectPaper])}
        <Skeleton class="h-6 w-28 rounded-full" />
        <div class="flex flex-row gap-2">
            <UserAvatarSkeleton size="small" />
            <UserAvatarSkeleton size="small" />
        </div>
    {:then [reviewers, projectPaper]}
        <h2 class={projectPaper.decision === PaperDecision.ACCEPTED ? "text-black" : "text-white"}>
            {bannerLabel.value}
        </h2>
        <div class="flex flex-row flex-wrap justify-center gap-3">
            {#each projectPaper.reviews as review (review.id)}
                <UserAvatar
                    reviewDecision={review.decision}
                    size="small"
                    user={reviewers.find((reviewer) => review.userId === reviewer.id)}
                />
            {/each}
        </div>
    {:catch error}
        {console.error(`Couldn't load paper decision: ${error}`)}
        <ErrorIndicator errorMessage="Couldn't load paper decision" />
    {/await}
</div>

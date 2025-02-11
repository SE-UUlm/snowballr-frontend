<script lang="ts">
    import { PaperDecision, Project_Paper } from "$lib/model/api/project";
    import type { User } from "$lib/model/api/user";
    import { resource } from "$lib/resource.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import UserAvatar from "../user-avatar/UserAvatar.svelte";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import UserAvatarSkeleton from "../user-avatar/UserAvatarSkeleton.svelte";

    export interface PaperDecisionBannerProps {
        reviewers: Promise<User[]>;
        loadingProjectPaper: Promise<Project_Paper>;
    }

    const { reviewers: loadingReviewers, loadingProjectPaper }: PaperDecisionBannerProps = $props();

    const bannerColor = resource<Project_Paper, string>(loadingProjectPaper, {
        initialValue: "bg-unreviewed-gray",
        onSuccess: (paper) => getDecisionColor(paper.decision),
        onErrorValue: "bg-unreviewed-gray",
    });
    const bannerLabel = resource<Project_Paper, string>(loadingProjectPaper, {
        initialValue: "",
        onSuccess: (paper) => getDecisionLabel(paper.decision),
        onErrorValue: "Couldn't load Paper Decision",
    });

    function getDecisionLabel(decision: PaperDecision) {
        switch (decision) {
            case PaperDecision.ACCEPTED:
                return "Accepted";
            case PaperDecision.DECLINED:
                return "Declined";
            default:
                return "Undecided";
        }
    }

    function getDecisionColor(decision: PaperDecision) {
        switch (decision) {
            case PaperDecision.ACCEPTED:
                return "bg-accept-green";
            case PaperDecision.DECLINED:
                return "bg-decline-red";
            default:
                return "bg-unreviewed-gray";
        }
    }
</script>

<div
    class={cn(
        "flex flex-row w-full rounded-2xl items-center justify-center p-2.5 gap-5",
        bannerColor.value,
    )}
>
    {#await Promise.all([loadingReviewers, loadingProjectPaper])}
        <Skeleton class="h-6 w-28 rounded-full" />
        <div class="flex flex-row gap-2">
            <UserAvatarSkeleton />
            <UserAvatarSkeleton />
        </div>
    {:then [reviewers, projectPaper]}
        <h2 class={projectPaper.decision === PaperDecision.ACCEPTED ? "text-black" : "text-white"}>
            {bannerLabel.value}
        </h2>
        <div class="flex flex-row gap-2">
            {#each projectPaper.reviews as review (review.id)}
                <UserAvatar
                    reviewDecision={review.decision}
                    user={reviewers.find((reviewer) => review.userId === reviewer.id)}
                />
            {/each}
        </div>
    {:catch error}
        {console.error(`Failed to load paper decision: ${error}`)}
        <span class="text-error text-white">Couldn't load Paper Decision</span>
    {/await}
</div>

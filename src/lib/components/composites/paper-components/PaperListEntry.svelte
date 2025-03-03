<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import { asPaper, type PaperListEntryInterface } from "$lib/model/general";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
    import { goto } from "$app/navigation";
    import { PaperDecision } from "$lib/model/api/project";
    import { backendService } from "$lib/grpc-api";
    import type { User } from "$lib/model/api/user";
    import { exhaustiveCheck } from "$lib/utils/common-helper";
    import { cn } from "$lib/utils/shadcn-helper";

    type PaperListEntryProps = PaperListEntryInterface & {
        onClick?: () => void;
    };

    const navigateToPaperView = () => {
        const paperId = asPaper(paper).id;
        const paperLink =
            projectId !== undefined
                ? `/project/${projectId}/paper/${paperId}`
                : `/paper/${paperId}`;
        goto(paperLink);
    };

    const {
        paper,
        projectId,
        showReviewStatus,
        onClick = navigateToPaperView,
    }: PaperListEntryProps = $props();

    // Mapping of review decision to border color of paper list entry
    function getReviewDecisionColor(
        decisionStatus: PaperDecision,
        numberOfReviews: number,
    ): string {
        switch (decisionStatus) {
            case PaperDecision.ACCEPTED:
                return "border-accept-green";
            case PaperDecision.DECLINED:
                return "border-decline-red";
            case PaperDecision.UNDECIDED:
                return numberOfReviews > 0 ? "border-maybe-yellow" : "border-unreviewed-gray";
            case PaperDecision.UNSPECIFIED:
                return "border-unreviewed-gray";
            default:
                exhaustiveCheck(decisionStatus);
        }
    }

    async function getReviewUserById(id: string): Promise<User | undefined> {
        let reviewingUser: undefined | User = undefined;
        try {
            reviewingUser = await backendService.getUserById({ id: id }).response;
        } catch (error) {
            console.error(`Couldn't load review user with: ${id} (error: ${error})`);
        }

        return reviewingUser;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    /**
     * Handles the click event of the paper entry component by checking
     * whether it was a single click (so no further click after 350ms) or a double click
     * and call the corresponding functions:
     *  - single click => onClick() (possible overridden, otherwise navigateToPaperView())
     *  - double click => navigateToPaperView() (default)
     */
    const handleClick = () => {
        if (timeoutId === null) {
            timeoutId = setTimeout(() => {
                timeoutId = null;
                onClick();
            }, 350);
        } else {
            clearTimeout(timeoutId);
            timeoutId = null;
            navigateToPaperView();
        }
    };
</script>

<!--
@component
Container displaying important paper information, optionally with review information.

This component shows the
  - paper id
  - title
  - authors (or 'unknown authors' if none are specified)
as well as, if not in review mode, the review information about this paper.

Furthermore this component is clickable and navigates to the corresponding paper view,
if the onClick() event handler is not overridden.

Usage:
```svelte
    <PaperListEntry paper={paper} projectId={"1"} showReviewStatus={true} />
```
-->
<button
    class="border-container-border-grey highlight-on-hover group/paper-list-entry flex w-full flex-row items-center justify-end gap-3 rounded-md border pe-3"
    class:border-l-0={showReviewStatus}
    onclick={handleClick}
    type="button"
>
    <div
        class={cn(
            "flex flex-auto rounded-md px-3 py-1.5",
            showReviewStatus
                ? `border-l-4 ${getReviewDecisionColor(paper.decision, paper.reviews.length)}`
                : "",
        )}
    >
        <PaperInfo loadingPaper={Promise.resolve(asPaper(paper))} />
    </div>
    {#if showReviewStatus}
        {#each paper.reviews as review (review.id)}
            {#await getReviewUserById(review.userId) then user}
                <UserAvatar reviewDecision={review.decision} {user} />
            {/await}
        {/each}
    {/if}
</button>

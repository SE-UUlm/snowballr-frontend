<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
    import { goto } from "$app/navigation";
    import { backendService } from "$lib/grpc-api";
    import type { User } from "$lib/model/api/user";
    import { getStatusColor, getStatusText } from "$lib/utils/common-helper";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { PaperListEntryInterface } from "$lib/model/component-interfaces";
    import { asPaper } from "$lib/utils/model-helper";

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
     *  - single click =\> onClick() (possible overridden, otherwise navigateToPaperView())
     *  - double click =\> navigateToPaperView() (default)
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
            showReviewStatus ? `border-l-4 ${getStatusColor(getStatusText(paper), "border")}` : "",
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

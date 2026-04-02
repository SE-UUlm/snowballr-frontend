<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
    import { goto } from "$app/navigation";
    import { backendService } from "$lib/grpc-api";
    import type { User } from "$api/user";
    import {
        getDisplayPaperId,
        getStatusColor,
        handleSingleOrDoubleClick,
    } from "$lib/utils/common-helper";
    import { cn } from "$lib/utils/shadcn-helper";
    import { asPaper, isProjectPaper } from "$lib/utils/model-helper";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import type { Paper } from "$api/paper";
    import type { Project_Paper } from "$api/project";
    import ExternalLink from "@lucide/svelte/icons/external-link";

    /**
     * Interface for the paper list entries.
     *
     * It either takes a Paper or a Project_Paper object.
     * According to this the projectId is either undefined or a string.
     */
    export type PaperListEntryInterface =
        | {
              projectId: undefined;
              paper: Paper;
          }
        | {
              projectId: string;
              paper: Project_Paper;
          };

    type PaperListEntryProps = PaperListEntryInterface & {
        onClick?: () => void;
    };
    const { paper, projectId, onClick }: PaperListEntryProps = $props();
    const paperId = $derived(getDisplayPaperId(paper));
    const href = $derived(
        isProjectPaper(paper) ? `/project/${projectId}/paper/${paperId}` : `/paper/${paperId}`,
    );

    async function getReviewUserById(id: string): Promise<User | undefined> {
        let reviewingUser: undefined | User = undefined;
        try {
            reviewingUser = await backendService.getUserById({ id: id }).response;
        } catch (error) {
            console.error(`Couldn't load review user with: ${id} (error: ${error})`);
        }

        return reviewingUser;
    }
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
if the onClick() event handler is not overridden. Otherwise it executes the custom event handler
on a single click. A double click always causes the navigation to the paper view.
If an onClick event handler is provided, a link icon is shown to open the paper.

Usage:
```svelte
    <PaperListEntry {paper} projectId={"1"} {onClick} />
```
-->
<svelte:element
    this={!onClick ? "a" : "button"}
    class="border-container-border-grey highlight-on-hover group/paper-list-entry flex w-full flex-row items-center justify-end gap-3 rounded-md border pe-3"
    class:border-l-0={!reviewMode.isActivated}
    data-testid="paper-list-entry"
    onclick={handleSingleOrDoubleClick(onClick ?? (() => {}), () => goto(href))}
    {...!onClick ? { href: href } : { type: "button" }}
>
    <div
        class={cn(
            "flex flex-auto gap-2 rounded-md px-3 py-2",
            !reviewMode.isActivated && isProjectPaper(paper)
                ? `border-l-4 ${getStatusColor(paper.decision, "border")}`
                : "",
        )}
    >
        <PaperInfo
            loadingPaper={Promise.resolve(asPaper(paper))}
            loadingPaperId={Promise.resolve(paperId)}
        />
        {#if onClick}
            <a
                class="text-muted-foreground self-start"
                {href}
                onclick={(e) => e.stopPropagation()}
                title="Open Paper"
            >
                <ExternalLink class="mt-1.5 size-4" />
            </a>
        {/if}
    </div>
    {#if !reviewMode.isActivated && isProjectPaper(paper)}
        {#each paper.reviews as review (review.id)}
            {#await getReviewUserById(review.userId) then user}
                <UserAvatar reviewDecision={review.decision} {user} />
            {/await}
        {/each}
    {/if}
</svelte:element>

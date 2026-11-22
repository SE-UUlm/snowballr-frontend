<script lang="ts">
    import ArrowLeft from "@lucide/svelte/icons/arrow-left";
    import ArrowRight from "@lucide/svelte/icons/arrow-right";
    import Tooltip from "../../utils/Tooltip.svelte";
    import type { Project, Project_Paper } from "#lib/api/types.js";
    import { reviewMode } from "#lib/global-state/review-mode-state.svelte.js";
    import {
        getNextPaper,
        getNextPaperToReview,
        getPreviousPaper,
    } from "#lib/api/project-paper.js";
    import { navigatePaper } from "#lib/utils/paper-navigation.js";
    import { loadingWrapper } from "#lib/utils/common-helper.js";
    import { projectPaperLoading } from "#lib/global-state/project-paper-loading-state.svelte.js";
    import { isApiError } from "#lib/api/errors.js";
    import { toast } from "svelte-sonner";

    interface Props {
        direction: "left" | "right";
        loadingProject?: Promise<Project>;
        loadingProjectPaper: Promise<Project_Paper | undefined>;
        paperQueue?: Project_Paper[];
        nextProjectPaper?: Project_Paper;
        previousProjectPaper?: Project_Paper;
    }

    let {
        direction,
        loadingProject,
        loadingProjectPaper,
        paperQueue = $bindable([]),
        nextProjectPaper = $bindable(undefined),
        previousProjectPaper = $bindable(undefined),
    }: Props = $props();
    let buttonLeftDisabled: boolean = $state(true);
    let buttonRightDisabled: boolean = $state(true);

    let buttonStillLoading: boolean = $state(true);

    const isLoading: boolean = $derived(projectPaperLoading.isLoading || buttonStillLoading);
    const isDisabled: boolean = $derived(
        isLoading || (direction === "right" ? buttonRightDisabled : buttonLeftDisabled),
    );

    // The direction is hardcoded and should never be changed at runtime.
    // svelte-ignore state_referenced_locally
    const tooltipText = direction === "left" ? "Previous Paper" : "Next Paper";

    /**
     * Fetches the neighbouring paper of the given paper.
     *
     * @returns the neighbouring paper, or undefined if there is none or it could not be loaded
     */
    async function fetchNeighbour(
        fetch: (projectPaperId: string) => Promise<Project_Paper>,
        paper: Project_Paper,
    ): Promise<Project_Paper | undefined> {
        try {
            return await fetch(paper.id);
        } catch (error) {
            // The backend signals that there is no such paper with a failed precondition.
            if (!isApiError(error, "failed-precondition")) {
                toast.error(
                    `Could not load the ${direction === "right" ? "next" : "previous"} paper.`,
                );
                console.error("Could not load the neighbouring paper:", error);
            }
            return undefined;
        }
    }

    /**
     * Loads the next or previous paper of the paper that `loadingCurrentPaper` resolves to.
     *
     * @returns the neighbouring paper, or undefined if there is none or it could not be loaded
     */
    async function loadNeighbour(
        loadingCurrentPaper: Promise<Project_Paper | undefined>,
    ): Promise<Project_Paper | undefined> {
        let paper: Project_Paper | undefined;
        try {
            paper = await loadingCurrentPaper;
        } catch (error) {
            console.error("Could not load the current paper:", error);
            return undefined;
        }
        if (!paper) return undefined;

        if (direction === "right") {
            return fetchNeighbour(
                reviewMode.isActivated ? getNextPaperToReview : getNextPaper,
                paper,
            );
        }
        if (reviewMode.isActivated) {
            return paperQueue[paperQueue.length - 1];
        }
        return fetchNeighbour(getPreviousPaper, paper);
    }

    // Counts the prefetches, so that a late response for an earlier paper is ignored
    let latestPrefetch = 0;

    /**
     * Pre-fetches the next and the previous paper to find out if the according button is enabled or
     * disabled and the according paper does not have to be loaded on clicking of the button, but
     * before. Loads the next or previous paper only if all necessary information is available.
     */
    $effect(() => {
        const prefetch = ++latestPrefetch;
        buttonStillLoading = true;
        // Forget the neighbour of the earlier paper, so nothing navigates to it meanwhile
        if (direction === "right") {
            nextProjectPaper = undefined;
            buttonRightDisabled = true;
        } else {
            previousProjectPaper = undefined;
            buttonLeftDisabled = true;
        }
        loadNeighbour(loadingProjectPaper).then((neighbour) => {
            if (prefetch !== latestPrefetch) return;

            if (direction === "right") {
                nextProjectPaper = neighbour;
                buttonRightDisabled = neighbour === undefined;
            } else {
                previousProjectPaper = neighbour;
                buttonLeftDisabled = neighbour === undefined;
            }
            buttonStillLoading = false;
        });
    });

    /**
     * Handles the navigation of the navigation button depending on the direction.
     */
    async function navigate() {
        await navigatePaper(
            direction,
            loadingProjectPaper,
            paperQueue,
            loadingProject,
            nextProjectPaper,
            previousProjectPaper,
        );
    }
</script>

<!--
@component
Button that navigates to the next or previous paper.

This component is used in the PaperView component to navigate between papers.
The loadingProjectPaper has to be the Promise of the project paper or undefined if no
such paper could be found.

Usage:
```svelte
    <PaperNavigationButton
        direction="right"
        {loadingProject}
        {loadingProjectPaper}
        bind:loading
        bind:paperQueue
        bind:nextProjectPaper
    />
```
-->
<Tooltip
    class="text-primary max-w-xs min-w-32 grow bg-slate-200 shadow-lg hover:bg-slate-400"
    aria-label={tooltipText}
    data-testid="navigation-button"
    disabled={isDisabled}
    loading={isLoading}
    onclick={(args) => loadingWrapper({ value: false }, navigate, args)}
    triggerSize="default"
    triggerVariant="link"
>
    {#snippet trigger()}
        {#if !isLoading}
            {#if direction === "left"}
                <ArrowLeft />
            {:else}
                <ArrowRight />
            {/if}
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>

<script lang="ts">
    import ArrowLeft from "@lucide/svelte/icons/arrow-left";
    import ArrowRight from "@lucide/svelte/icons/arrow-right";
    import Tooltip from "../../utils/Tooltip.svelte";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import { backendService } from "$lib/grpc-api";
    import { navigatePaper } from "$lib/utils/paper-navigation";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";

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

    const tooltipText = direction === "left" ? "Previous Paper" : "Next Paper";

    async function getNextProjectPaperToReview(paper: Project_Paper) {
        await backendService
            .getNextPaperToReview({ id: paper.id })
            .response.then((nextPaper) => {
                nextProjectPaper = nextPaper;
            })
            .catch(() => {
                nextProjectPaper = undefined;
            });
    }

    async function getNextProjectPaper(paper: Project_Paper) {
        await backendService
            .getNextPaper({ id: paper.id })
            .response.then((nextPaper) => {
                nextProjectPaper = nextPaper;
            })
            .catch(() => {
                nextProjectPaper = undefined;
            });
    }

    async function getPreviousProjectPaper(paper: Project_Paper) {
        await backendService
            .getPreviousPaper({ id: paper.id })
            .response.then((previousPaper) => {
                previousProjectPaper = previousPaper;
            })
            .catch(() => {
                previousProjectPaper = undefined;
            });
    }

    /**
     * Pre-fetches the next and the previous paper to find out if the according button is enabled or
     * disabled and the according paper does not have to be loaded on clicking of the button, but
     * before. Loads the next or previous paper only if all necessary information is available.
     */
    $effect(() => {
        (async () => {
            buttonStillLoading = true;
            const paper = await loadingProjectPaper;
            if (!paper) return;

            nextProjectPaper = previousProjectPaper = undefined;
            buttonRightDisabled = buttonLeftDisabled = true;
            if (direction === "right") {
                if (reviewMode.isActivated) {
                    await getNextProjectPaperToReview(paper);
                } else {
                    await getNextProjectPaper(paper);
                }
                buttonRightDisabled = nextProjectPaper === undefined;
                buttonStillLoading = false;
            } else if (direction === "left") {
                if (reviewMode.isActivated) {
                    previousProjectPaper = paperQueue[paperQueue.length - 1];
                } else {
                    await getPreviousProjectPaper(paper);
                }
                buttonLeftDisabled = previousProjectPaper === undefined;
                buttonStillLoading = false;
            }
        })();
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

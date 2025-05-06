<script lang="ts">
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import Tooltip from "../../utils/Tooltip.svelte";
    import { goto } from "$app/navigation";
    import type { Project_Paper } from "$lib/model/api/project";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import { backendService } from "$lib/grpc-api";
    import { toast } from "svelte-sonner";

    interface Props {
        direction: "left" | "right";
        loadingProjectPaper: Promise<Project_Paper | undefined>;
        loading: boolean;
        paperQueue: Project_Paper[];
    }

    let { direction, loadingProjectPaper, loading, paperQueue = $bindable() }: Props = $props();
    let buttonLeftDisabled: boolean = $state(true);
    let buttonRightDisabled: boolean = $state(true);
    const tooltipText = direction === "left" ? "Previous Paper" : "Next Paper";
    let nextProjectPaper: Project_Paper | undefined;
    let previousProjectPaper: Project_Paper | undefined;

    $effect(() => {
        (async () => {
            const paper = await loadingProjectPaper;
            if (!paper) return;
            if (reviewMode.isActivated) {
                await backendService
                    .getNextPaperToReview({ id: paper.id })
                    .response.then((nextPaper) => {
                        nextProjectPaper = nextPaper;
                    })
                    .catch((error) => {
                        nextProjectPaper = undefined;
                        if (error.message !== "No%20next%20paper%20available.") {
                            toast("Error, while loading the next paper.");
                        }
                    });
                previousProjectPaper = paperQueue[paperQueue.length - 1];
            } else {
                await backendService
                    .getNextPaper({ id: paper.id })
                    .response.then((nextPaper) => {
                        nextProjectPaper = nextPaper;
                    })
                    .catch((error) => {
                        nextProjectPaper = undefined;
                        if (error.message !== "No%20next%20paper%20available.") {
                            toast("Error, while loading the next paper.");
                        }
                    });
                await backendService
                    .getPreviousPaper({ id: paper.id })
                    .response.then((previousPaper) => {
                        previousProjectPaper = previousPaper;
                    })
                    .catch((error) => {
                        previousProjectPaper = undefined;
                        if (error.message !== "No%20previous%20paper%20available.") {
                            toast("Error, while loading the next paper.");
                        }
                    });
            }
            console.log(previousProjectPaper);
            console.log(nextProjectPaper);
            console.log(loading);
            buttonRightDisabled = nextProjectPaper === undefined || loading;
            buttonLeftDisabled = previousProjectPaper === undefined || loading;
        })();
    });

    /**
     * Handles the navigation of the button with the direction "right". Therefore, it is checked whether the
     * review mode is activated or not.
     */
    const navigate = async function () {
        if (direction === "right" && nextProjectPaper) {
            const paper = await loadingProjectPaper;
            if (paper) paperQueue.push(paper);
            await goto(
                `/project/${nextProjectPaper.id.split("-")[0]}/paper/${nextProjectPaper.localId}`,
            );
        }
        if (direction === "left" && previousProjectPaper) {
            paperQueue.pop();
            await goto(
                `/project/${previousProjectPaper.id.split("-")[0]}/paper/${previousProjectPaper.localId}`,
            );
        }
    };
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
        direction="left"
        {loadingProjectPaper}
    />
```
-->
<Tooltip
    class="text-primary max-w-xs min-w-32 grow bg-slate-200 shadow-lg hover:bg-slate-400"
    aria-label={tooltipText}
    data-testid="navigation-button"
    disabled={loading || (direction === "right" ? buttonRightDisabled : buttonLeftDisabled)}
    onclick={() => navigate()}
    triggerSize="default"
    triggerVariant="link"
>
    {#snippet trigger()}
        {#if direction === "left"}
            <ArrowLeft />
        {:else}
            <ArrowRight />
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>

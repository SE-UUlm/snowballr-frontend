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
    }

    let { direction, loadingProjectPaper }: Props = $props();
    let buttonLeftDisabled: boolean = $state(false);
    let buttonRightDisabled: boolean = $state(false);
    const tooltipText = direction === "left" ? "Previous Paper" : "Next Paper";
    let nextProjectPaper: Project_Paper;

    $effect(() => {
        (async () => {
            const paper = await loadingProjectPaper;
            if (!paper) return;
            if (reviewMode.isActivated) {
                nextProjectPaper = await backendService.getNextPaperToReview({ id: paper.id })
                    .response;
            } else {
                nextProjectPaper = await backendService.getNextPaper({ id: paper.id }).response;
                if (nextProjectPaper.id === paper.id) {
                    buttonRightDisabled = true;
                }
            }
        })();
    });

    /**
     * Handles the navigation of the button with the direction "right". Therefore, it is checked whether the
     * review mode is activated or not.
     */
    const navigateRight = async function () {
        if (!loadingProjectPaper) {
            return;
        }
        const currentPaper = await loadingProjectPaper;
        if (
            nextProjectPaper &&
            nextProjectPaper.localId == currentPaper!.localId &&
            reviewMode.isActivated
        ) {
            await goto("/");
            toast("No more papers to review for this project");
            return;
        }
        if (nextProjectPaper) {
            await goto(
                `/project/${nextProjectPaper.id.split("-")[0]}/paper/${nextProjectPaper.localId}`,
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
    disabled={direction === "right" ? buttonRightDisabled : buttonLeftDisabled}
    onclick={() => {
        if (direction === "left") {
            goto("");
        } else if (direction === "right") {
            navigateRight();
        }
    }}
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

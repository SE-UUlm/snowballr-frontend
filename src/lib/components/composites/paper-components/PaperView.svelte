<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard from "$lib/components/composites/paper-components/cards/PaperResearchContextCard.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import type { Paper, User } from "../../../../app";

    interface Props {
        user: User;
        paper: Paper;
    }

    const { user, paper }: Props = $props();
</script>

<div class="flex flex-row justify-between bg-red-200 h-fit w-full gap-4">
    <PaperNavigationBar {user} backRef="/" {paper} />
    <div class="bg-amber-400">
        <div class="w-8 h-8 bg-slate-400">BB</div>
    </div>
</div>
<main class="flex flex-col h-full w-full px-2 py-4 gap-5">
    <div class="flex flex-row w-full h-full gap-5">
        <PaperDetailsCard />
        <PaperResearchContextCard />
    </div>
    <div class="flex flex-row w-full h-fit justify-between">
        <Button>Button to left</Button>
        <Button>Button to right</Button>
    </div>
</main>

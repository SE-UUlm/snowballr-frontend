<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { PaperData, User } from "../../../../app";

    interface Props {
        user: User;
        backRef?: string | undefined;
        paper: { id: number | undefined; data: PaperData };
    }

    const { user, backRef, paper }: Props = $props();
</script>

<NavigationBar {user} {backRef} tabs={[]} defaultTabValue="">
    <PaperInfo {paper} />
</NavigationBar>

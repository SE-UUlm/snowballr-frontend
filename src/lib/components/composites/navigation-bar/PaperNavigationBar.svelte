<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper, User } from "../../../../app";

    interface Props {
        user: User;
        backRef?: string | undefined;
        paper: Omit<Paper, "id"> & { id: number | undefined };
    }

    const { user, backRef, paper }: Props = $props();
</script>

<NavigationBar {user} {backRef} tabs={[]} defaultTabValue="">
    <PaperInfo {paper} />
</NavigationBar>

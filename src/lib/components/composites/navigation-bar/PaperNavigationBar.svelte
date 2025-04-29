<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import type { User } from "$lib/model/api/user";

    interface Props {
        user: User;
        backRef?: string | undefined;
        loadingPaper: Promise<Omit<Paper, "id">>;
        loadingPaperId?: Promise<string>;
    }

    const { user, backRef, loadingPaper, loadingPaperId }: Props = $props();
</script>

<NavigationBar {backRef} {user}>
    <PaperInfo {loadingPaper} {loadingPaperId} />
</NavigationBar>

<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper } from "$lib/model/api/paper";

    interface Props {
        backRef?: string | undefined;
        loadingPaper: Promise<Omit<Paper, "id">>;
        loadingPaperId?: Promise<string>;
    }

    const { backRef, loadingPaper, loadingPaperId }: Props = $props();
</script>

<NavigationBar {backRef}>
    <PaperInfo {loadingPaper} {loadingPaperId} />
</NavigationBar>

<script lang="ts">
    import type { Project } from "$lib/model/api/project";
    import DeleteProjectSettingsDialog from "./DeleteProjectSettingsDialog.svelte";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();
</script>

<!--
@component
Settings to delete the current project.

Usage:
```svelte
    <DeleteProjectSettings {loadingProject} {projectId} />
```
-->
<div class="flex flex-row items-center justify-between gap-2">
    <div class="flex flex-col">
        <span class="font-bold">Delete Project</span>
        <span>This will make the project unaccessible to all project members.</span>
    </div>
    <DeleteProjectSettingsDialog {loadingProject} {projectId} />
</div>

<script lang="ts">
    import LeaveProjectDialog from "./LeaveProjectDialog.svelte";

    interface Props {
        projectId: string;
        isLastAdmin?: boolean;
    }

    const { projectId, isLastAdmin = false }: Props = $props();
</script>

<!--
@component
Settings to leave the current project.

Usage:
```svelte
    <LeaveProjectSettings {isLastAdmin} {projectId} />
```
-->
<div class="flex flex-row items-center justify-between gap-2">
    <div class="flex flex-col">
        <span class="font-bold">Leave Project</span>
        <span>You will lose access to this project. A project admin can re-invite you later.</span>
    </div>
    <LeaveProjectDialog {isLastAdmin} {projectId} />
</div>

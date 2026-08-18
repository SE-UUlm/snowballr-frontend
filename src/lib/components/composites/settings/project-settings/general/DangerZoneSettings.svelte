<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Separator from "$lib/components/primitives/separator/separator.svelte";
    import type { Project } from "$api/project";
    import DeleteProjectSettings from "./DeleteProjectSettings.svelte";
    import LeaveProjectSettings from "./LeaveProjectSettings.svelte";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
        isLastAdmin?: boolean;
    }

    const { projectId, loadingProject, isLastAdmin = false }: Props = $props();
</script>

<!--
@component
SettingsSection for dangerous actions that require explicit confirmation.

Usage:
```svelte
    <DangerZoneSettings {isLastAdmin} {loadingProject} {projectId} />
```
-->
<SettingsSection sectionTitle="Danger Zone" variant="destructive">
    <div class="flex flex-col gap-4 px-4">
        <LeaveProjectSettings {isLastAdmin} {projectId} />
        <Separator />
        <DeleteProjectSettings {loadingProject} {projectId} />
    </div>
</SettingsSection>

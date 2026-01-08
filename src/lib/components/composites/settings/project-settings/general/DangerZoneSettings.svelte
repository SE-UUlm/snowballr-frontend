<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import type { Project } from "$lib/model/api/project";
    import DeleteProjectSettings from "./DeleteProjectSettings.svelte";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
    }

    const { projectId, loadingProject }: Props = $props();
</script>

<!--
@component
SettingsSection for dangerous actions that require explicit confirmation.

Usage:
```svelte
    <DangerZoneSettings {loadingProject} {projectId} />
```
-->
<SettingsSection sectionTitle="Danger Zone" variant="destructive">
    <div class="px-4">
        <DeleteProjectSettings {loadingProject} {projectId} />
    </div>
</SettingsSection>

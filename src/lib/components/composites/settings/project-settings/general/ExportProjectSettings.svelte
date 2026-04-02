<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Nothing } from "$api/base";
    import { ExportRequest } from "$api/export";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { downloadBlob } from "$lib/utils/download-file";
    import SingleSelect from "$lib/components/composites/select/SingleSelect.svelte";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { onMount } from "svelte";

    interface Props {
        projectId: string;
    }

    const { projectId }: Props = $props();

    let loadingFormats = $state(true);
    let formats = $state<string[]>([]);
    let selectedFormat = $state<string | undefined>(undefined);
    const loadingExport = $state({ value: false });
    let exportProjectError: ActionError = $state(undefined);

    onMount(() => {
        backendService
            .getAvailableExportFormats(Nothing)
            .response.then((availableFormats) => {
                formats = availableFormats.formats;
            })
            .catch((error) => {
                exportProjectError = createActionError(
                    "Failed to Load the Export Formats",
                    {
                        action: "loading the export formats",
                    },
                    error,
                );
            })
            .finally(() => {
                loadingFormats = false;
            });
    });

    async function exportProject() {
        if (!selectedFormat) {
            return;
        }

        loadingExport.value = true;
        exportProjectError = undefined;

        const request: ExportRequest = {
            id: projectId,
            format: selectedFormat,
        };

        await backendService
            .exportProject(request)
            .response.then(({ data, fileName }) => {
                downloadBlob(data, fileName);
            })
            .catch((error) => {
                exportProjectError = createActionError(
                    "Failed to Export the Project",
                    {
                        action: "exporting the project",
                    },
                    error,
                );
            })
            .finally(() => {
                loadingExport.value = false;
            });
    }
</script>

<!--
@component
Component for exporting the project in a selected format.

Usage:
```svelte
    <ExportProjectSettings {projectId} />
```
-->
<SettingsSection sectionTitle="Export Project">
    <div class="flew-row flex">
        <SingleSelect
            categoryLabel="format"
            disabled={loadingFormats}
            options={formats.map((f) => ({ label: f, value: f }))}
            bind:selectedValue={selectedFormat}
        />
        <LoadingButton
            class="w-44"
            disabled={!selectedFormat}
            label="Export Project"
            loading={loadingExport.value}
            loadingLabel="Exporting Project"
            onclick={(args) => loadingWrapper(loadingExport, exportProject, args)}
        />
    </div>
    <ActionErrorAlert class="max-w-100 md:max-w-150" error={exportProjectError} />
</SettingsSection>

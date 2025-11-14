<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Nothing } from "$lib/model/api/base";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import MultiSelect from "$lib/components/composites/select/MultiSelect.svelte";
    import { ExportRequest } from "$lib/model/api/export";
    import { loadingWrapper, pluralize } from "$lib/utils/common-helper";
    import { downloadBlob } from "$lib/utils/download-file";

    interface Props {
        projectId: string;
    }

    const { projectId }: Props = $props();

    let loadingFormats = $state(true);
    let formats = $state<string[]>([]);
    let selectedFormats = $state<string[]>([]);
    const loadingExport = $state({ value: false });

    const formatsPromise = backendService
        .getAvailableExportFormats(Nothing)
        .response.then((availableFormats) => {
            formats = availableFormats.formats;
        })
        .finally(() => {
            loadingFormats = false;
        });

    async function exportProject() {
        loadingExport.value = false;

        const promises = selectedFormats.map((format) => {
            const request: ExportRequest = {
                id: projectId,
                format,
            };
            return backendService.exportProject(request).response;
        });

        await Promise.all(promises).then((exportResponses) => {
            for (const response of exportResponses) {
                downloadBlob(response.data, response.fileName);
            }
        });
    }
</script>

<SettingsSection sectionTitle="Export Project">
    {#await formatsPromise}
        <span class="italic">Loading formats ...</span>
    {:then}
        <span>
            You can export the project in the following
            {pluralize(formats, "format", "formats")}:
            {formats.join(", ")}.
        </span>
    {:catch}
        <ErrorIndicator errorMessage="Failed loading formats"></ErrorIndicator>
    {/await}
    <div class="flew-row flex">
        <MultiSelect
            categoryLabel="Formats"
            disabled={loadingFormats}
            noSelectIsAllSelect={false}
            options={formats.map((f) => ({ label: f, value: f }))}
            bind:selectedValues={selectedFormats}
        />
        <LoadingButton
            class="w-fit"
            disabled={selectedFormats.length === 0}
            label="Export Project"
            loading={loadingExport.value}
            loadingLabel="Exporting Project"
            onclick={(args) => loadingWrapper(loadingExport, exportProject, args)}
        />
    </div>
</SettingsSection>

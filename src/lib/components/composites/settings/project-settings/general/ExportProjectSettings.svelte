<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Nothing } from "$lib/model/api/base";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import { ExportRequest } from "$lib/model/api/export";
    import { loadingWrapper, pluralize } from "$lib/utils/common-helper";
    import { downloadBlob } from "$lib/utils/download-file";
    import SingleSelect from "$lib/components/composites/select/SingleSelect.svelte";

    interface Props {
        projectId: string;
    }

    const { projectId }: Props = $props();

    let loadingFormats = $state(true);
    let formats = $state<string[]>([]);
    let selectedFormat = $state<string | undefined>(undefined);
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
        if (!selectedFormat) {
            return;
        }

        loadingExport.value = true;

        const request: ExportRequest = {
            id: projectId,
            format: selectedFormat,
        };

        await backendService
            .exportProject(request)
            .response.then(({ data, fileName }) => {
                downloadBlob(data, fileName);
            })
            .finally(() => {
                loadingExport.value = false;
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
</SettingsSection>

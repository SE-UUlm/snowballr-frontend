<script lang="ts" module>
    import { SnowballingType } from "$api/project";
    import type { ProjectSettingDescriptor } from "$lib/model/project-setting";

    /**
     * Which references are fetched when a paper is accepted.
     *
     * Held as a string because that is what the radio group binds to. Defaults to
     * {@link SnowballingType.UNSPECIFIED} if the project does not define one.
     */
    export const snowballingTypeSetting: ProjectSettingDescriptor<string> = {
        read: (project) => String(project.settings?.snowballingType ?? SnowballingType.UNSPECIFIED),
        toPatch: (value) => ({ settings: { snowballingType: Number(value) as SnowballingType } }),
        action: "updating the Snowballing Type",
    };
</script>

<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import * as RadioGroup from "$lib/components/primitives/radio-group/index";
    import type { Project } from "$api/project";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { projectSetting } from "$lib/model/project-setting.svelte";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
        slrSettingsLocked?: boolean;
    }

    const { projectId, loadingProject, slrSettingsLocked = false }: Props = $props();

    interface RadioItemProp {
        id: string;
        label: string;
        description: string;
    }
    const options: RadioItemProp[] = [
        {
            id: String(SnowballingType.FORWARD),
            label: "Forward",
            description: "Only forward references are fetched",
        },
        {
            id: String(SnowballingType.BACKWARD),
            label: "Backward",
            description: "Only backward references are fetched",
        },
        {
            id: String(SnowballingType.BOTH),
            label: "Both",
            description: "Both forward and backward references are fetched",
        },
    ];

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    // A settings section belongs to exactly one project for as long as it is mounted, so these props
    // are read once. This mirrors the previous `onMount` behaviour.
    // svelte-ignore state_referenced_locally
    const setting = projectSetting(snowballingTypeSetting, {
        projectId,
        loadingProject,
        settingsLocked: () => slrSettingsLocked,
        isArchived: () => isProjectArchived,
    });
</script>

<!--
@component
This component renders a section within the SLR project settings. It allows administrators to specify the Snowballing
Type. Depending on the selected type, different types of references are fetched when accepting a paper.

The `slrSettingsLocked` prop can be used to disable the switch if the SLR settings are locked, preventing any changes to
this setting.

Usage:
```svelte
  <SnowballingTypeSettings {projectId} {slrSettingsLocked} {loadingProject} />
```
-->
<SettingsSection locked={setting.locked} sectionTitle="Snowballing Type">
    <p>
        The type of Snowballing defines which references (forward and/or backward) are fetched when
        a paper is accepted. A backward reference is defined as a paper that is cited by the paper
        in question. A forward reference is defined as a paper that cites the paper in question,
        i.e., a paper where the paper in question is a backward reference. (<a
            class="underline"
            href="https://dl.acm.org/doi/10.1145/2601248.2601268"
        >
            Wohlin et. al 2014
        </a>)
    </p>
    <RadioGroup.Root bind:value={setting.value}>
        {#each options as option (option.id)}
            <div class="flex items-center space-x-2">
                {#if setting.loading && setting.value === option.id}
                    <LoaderCircle class="size-4 animate-spin" />
                {:else}
                    <RadioGroup.Item
                        id={option.id}
                        class="hover:cursor-pointer"
                        disabled={setting.disabled}
                        onclick={() => void setting.commit(option.id)}
                        value={option.id}
                    />
                {/if}
                <Label class="hover:cursor-pointer" for={option.id}>{option.label}</Label>
                <p class="text-description">{option.description}</p>
            </div>
        {/each}
    </RadioGroup.Root>
    <ActionErrorAlert error={setting.error} />
</SettingsSection>

<script lang="ts">
    import { Button } from "$lib/components/primitives/button";
    import { Label } from "$lib/components/primitives/label";
    import Switch from "$lib/components/primitives/switch/switch.svelte";
    import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";
    import SettingsSection from "../SettingsSection.svelte";
</script>

<!--
@component
Component for changing the shortcuts visibility setting.

Usage:
```svelte
    <ShortcutsVisibilitySettings />
```
-->
<SettingsSection sectionTitle="Shortcuts Visibility">
    <div class="flex space-x-2">
        <Switch id="shortcuts-visibility-switch" bind:checked={shortcuts.isVisible} />
        <div class="grid w-full max-w-100 gap-1.5 pt-0.25 md:max-w-200">
            <Label
                class="text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="shortcuts-visibility-switch"
            >
                Display Shortcuts
            </Label>
            <p class="text-description">
                Shortcuts are displayed next to their respective element.
            </p>
            <div class="flex w-full flex-col flex-wrap gap-3 pt-1.5 md:flex-row">
                <Button class="text-md">Button without Shortcut</Button>
                <Button class="text-md">
                    Button with Shortcut
                    <span class="text-md text-gray-400"> Ctrl+D </span>
                </Button>
            </div>
        </div>
    </div>
</SettingsSection>

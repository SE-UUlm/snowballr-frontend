<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import { Switch } from "$lib/components/primitives/switch";
</script>

<!--
@component
Component for changing the review mode setting.

Usage:
```svelte
    <ReviewModeSettings />
```
-->
<SettingsSection sectionTitle="Review mode">
    <div class="items-top flex flex-row space-x-2">
        <Switch id="review-mode-switch" bind:checked={reviewMode.isActivated} />
        <div class="grid gap-1.5 pt-1 leading-none">
            <Label
                class="text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="review-mode-switch"
            >
                Activate the "Review" mode
            </Label>
            <p class="text-description">
                When turned on, all information regarding other reviews are hidden and review
                decisions can be made.
            </p>
        </div>
    </div>
</SettingsSection>

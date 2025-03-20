<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Checkbox } from "$lib/components/primitives/checkbox";
    import { Label } from "$lib/components/primitives/label";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte.js";
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
        <Checkbox id="review-mode-checkbox" bind:checked={reviewMode.isActivated} />
        <div class="grid gap-1.5 leading-none">
            <Label
                class="text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="review-mode-checkbox"
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

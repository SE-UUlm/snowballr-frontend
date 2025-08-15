<script lang="ts">
    import type { Snippet } from "svelte";
    import { Separator } from "$lib/components/primitives/separator";
    import { LoaderCircle } from "lucide-svelte";

    interface SettingsSectionProps {
        sectionTitle: string;
        children: Snippet;
        loading?: boolean;
    }

    const { sectionTitle, children, loading = false }: SettingsSectionProps = $props();
</script>

<!--
@component
A generic component for sections in the settings.
The component consists of a heading, "underlined" by a horizontal line and the section content.

It can be used to apply a consistent layout to all section on the settings pages.

Usage:
```svelte
    <SettingsSection
        sectionTitle="Keywords"
    >
        ... (= content)
    </SettingsSection>
```
-->
<section
    class="flex h-fit w-full flex-col gap-3 overflow-y-auto"
    data-testid={`settings-section-${sectionTitle.toLowerCase().replace(" ", "-")}`}
>
    <div class="flex flex-row items-center gap-3">
        <h2>{sectionTitle}</h2>
        {#if loading}
            <LoaderCircle class="animate-spin" />
        {/if}
    </div>
    <Separator />
    {@render children?.()}
</section>

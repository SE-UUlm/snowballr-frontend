<script lang="ts" module>
    export const settingsSectionVariants = tv({
        base: "flex w-full flex-col gap-3",
        variants: {
            variant: {
                default: "",
                destructive: "border-error rounded-xl border py-4",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    });

    export type SettingsSectionVariant = VariantProps<typeof settingsSectionVariants>["variant"];

    export interface SettingsSectionProps {
        sectionTitle: string;
        children: Snippet;
        loading?: boolean;
        variant?: SettingsSectionVariant;
        locked?: boolean;
        lockedDescription?: string;
    }
</script>

<script lang="ts">
    import type { Snippet } from "svelte";
    import { Separator } from "$lib/components/primitives/separator";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import { tv, type VariantProps } from "tailwind-variants";
    import { cn } from "$lib/utils/shadcn-helper";
    import Lock from "@lucide/svelte/icons/lock";

    const {
        sectionTitle,
        children,
        loading = false,
        variant = "default",
        locked = false,
        lockedDescription = "This settings section is locked.",
    }: SettingsSectionProps = $props();

    // The variant is hardcoded and should never be changed at runtime.
    // svelte-ignore state_referenced_locally
    const hasSeparator = variant === "default";
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
    class="flex h-fit w-full flex-col gap-3"
    data-testid={`settings-section-${sectionTitle.toLowerCase().replace(" ", "-")}`}
>
    <div class="flex flex-row items-center gap-3">
        <h2 class:text-error={variant !== "default"}>{sectionTitle}</h2>
        {#if locked}
            <span title={lockedDescription}><Lock /></span>
        {/if}
        {#if loading}
            <LoaderCircle class="animate-spin" />
        {/if}
    </div>
    {#if hasSeparator}
        <Separator />
    {/if}
    <div class={cn(settingsSectionVariants({ variant }))}>
        {@render children?.()}
    </div>
</section>

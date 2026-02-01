<script lang="ts">
    import { Slider as SliderPrimitive, type WithoutChildrenOrChild } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    type Props = WithoutChildrenOrChild<SliderPrimitive.RootProps> & {
        /**
         * - "none" - shows no ticks
         * - "all" - shows all ticks
         * - "min-max" - shows only the minimum and maximum tick
         */
        tickLabels?: "none" | "all" | "min-max";
        /**
         * - "invisible" - thumb label is never shown
         * - "visible" - thumb label is always shown
         * - "on-slide" - thumb label is only shown when using the slider
         */
        thumbLabelVisibility?: "invisible" | "visible" | "on-slide";
    };

    let {
        ref = $bindable(null),
        value = $bindable(),
        orientation = "horizontal",
        tickLabels = "none",
        thumbLabelVisibility = "invisible",
        class: className,
        ...restProps
    }: Props = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
    class={cn(
        "group/slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
    )}
    data-slot="slider"
    {orientation}
    bind:ref
    bind:value={value as never}
    {...restProps}
>
    {#snippet children({ tickItems, thumbItems })}
        <span
            class={cn(
                "bg-muted relative grow overflow-hidden rounded-full hover:cursor-pointer data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
            )}
            data-orientation={orientation}
            data-slot="slider-track"
        >
            <SliderPrimitive.Range
                class={cn(
                    "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
                )}
                data-slot="slider-range"
            />
        </span>
        {#each thumbItems as thumb (thumb)}
            <SliderPrimitive.Thumb
                class="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:cursor-pointer hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                data-slot="slider-thumb"
                index={thumb.index}
            />
            {#if thumbLabelVisibility !== "invisible"}
                <SliderPrimitive.ThumbLabel
                    class={cn(
                        "bg-muted text-foreground mt-1.5 rounded-md px-2 py-1 text-nowrap hover:cursor-pointer",
                        thumbLabelVisibility === "on-slide"
                            ? "hidden group-hover/slider:block"
                            : "",
                    )}
                    index={thumb.index}
                    position="bottom"
                >
                    {thumb.value}
                </SliderPrimitive.ThumbLabel>
            {/if}
        {/each}
        {#if tickLabels !== "none"}
            {#each tickItems as { value, index } (index)}
                {#if tickLabels === "all" || (tickLabels === "min-max" && (index === 0 || index === tickItems.length - 1))}
                    <SliderPrimitive.Tick {index} />
                    <SliderPrimitive.TickLabel
                        class={cn(
                            "top-4! hover:cursor-pointer",
                            thumbItems.map((t) => t.value).includes(value)
                                ? "group-hover/slider:hidden"
                                : "",
                        )}
                        {index}
                        position="bottom"
                    >
                        {value}
                    </SliderPrimitive.TickLabel>
                {/if}
            {/each}
        {/if}
    {/snippet}
</SliderPrimitive.Root>

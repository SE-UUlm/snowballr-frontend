import { tv, type VariantProps } from "tailwind-variants";

export const paperDecisionButtonVariants = tv({
    variants: {
        variant: {
            accept: "bg-accept-green hover:bg-accept-green-hover",
            decline: "bg-decline-red hover:bg-decline-red-hover",
            maybe: "bg-maybe-yellow hover:bg-maybe-yellow-hover",
            selected_accept: "bg-accept-green ring-1 ring-offset-1 disabled:opacity-90",
            selected_decline: "bg-decline-red-selected ring-1 ring-offset-1 disabled:opacity-90",
            selected_maybe: "bg-maybe-yellow-selected ring-1 ring-offset-1 disabled:opacity-90",
        },
    },
});
export type PaperDecisionButtonVariant = VariantProps<
    typeof paperDecisionButtonVariants
>["variant"];

import { tv, type VariantProps } from "tailwind-variants";

export const paperDecisionButtonVariants = tv({
    variants: {
        variant: {
            accepted: "bg-accept-green hover:bg-accept-green-hover",
            declined: "bg-decline-red hover:bg-decline-red-hover",
            maybe: "bg-maybe-yellow hover:bg-maybe-yellow-hover",
            selected_accepted: "bg-accept-green ring-1 ring-offset-1 disabled:opacity-90",
            selected_declined: "bg-decline-red ring-1 ring-offset-1 disabled:opacity-90",
            selected_maybe: "bg-maybe-yellow ring-1 ring-offset-1 disabled:opacity-90",
        },
    },
});
export type PaperDecisionButtonVariant = VariantProps<
    typeof paperDecisionButtonVariants
>["variant"];

import { tv, type VariantProps } from "tailwind-variants";

export const paperDecisionButtonVariants = tv({
    variants: {
        variant: {
            accept: "bg-accept-green hover:bg-accept-green-hover",
            decline: "bg-decline-red hover:bg-decline-red-hover",
            maybe: "bg-maybe-yellow hover:bg-maybe-yellow-hover",
        },
    },
});
export type PaperDecisionButtonVariant = VariantProps<
    typeof paperDecisionButtonVariants
>["variant"];

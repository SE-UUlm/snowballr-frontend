import type { Action } from "svelte/action";

/**
 * Dispatches 'clickedOutsideOrEscape' event when the user clicks outside the element or pressed the 'ESC' key.
 *
 * @param node - The node this action refers to
 */
const clickOutsideOrEscape: Action<
    HTMLElement,
    unknown,
    { onClickedOutsideOrEscape?: (event: CustomEvent) => void }
> = (node: Element) => {
    const handleClick = (event: Event) => {
        if (!node.contains(<Node>event.target)) {
            node.dispatchEvent(new CustomEvent("ClickedOutsideOrEscape"));
        }
    };

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            node.dispatchEvent(new CustomEvent("ClickedOutsideOrEscape"));
        }
    };

    $effect(() => {
        document.addEventListener("click", handleClick, true);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("keydown", handleEscape);
        };
    });
};

export { clickOutsideOrEscape };

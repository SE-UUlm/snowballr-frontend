import type { Attachment } from "svelte/attachments";

/**
 * Attaches two event listeners that call the passed function when the user clicks outside the element
 * or presses the escape key.
 *
 * @param onClickedOutsideOrEscape - The callback to be called when the user clicks outside the element or presses the escape key.
 */
function clickOutsideOrEscape(onClickedOutsideOrEscape: () => void): Attachment<Element> {
    return (element: Element) => {
        const handleClick = (event: Event) => {
            if (!element.contains(<Node>event.target)) {
                onClickedOutsideOrEscape();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClickedOutsideOrEscape();
            }
        };

        document.addEventListener("click", handleClick, true);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("keydown", handleEscape);
        };
    };
}

export { clickOutsideOrEscape };

import type { Action } from "svelte/action";

/**
 * This action has the sole purpose of preventing the textarea from growing outside of the card it is in.
 * This is achieved by setting the max height of the textarea to the remaining space in the card.
 *
 * Previous attempts to find a dynamic solution to this problem have failed, so this action is a workaround by
 * using hard coded padding values that might change in the future.
 */
export const maxHeight: Action<
    HTMLTextAreaElement,
    { showButtonBar: boolean; showAdditionalInfos: boolean }
> = (node, { showButtonBar, showAdditionalInfos }) => {
    setMaxHeight(node, showButtonBar, showAdditionalInfos);

    // Autosize action sets overflow X to scroll, so we need to reset it
    node.addEventListener("input", () => {
        node.style.overflowX = "hidden";
    });

    window.addEventListener("resize", () => {
        setMaxHeight(node, showButtonBar, showAdditionalInfos);
    });

    return {
        update({ showButtonBar, showAdditionalInfos }) {
            setMaxHeight(node, showButtonBar, showAdditionalInfos);
        },
        destroy() {
            window.removeEventListener("resize", () => {
                setMaxHeight(node, showButtonBar, showAdditionalInfos);
            });
        },
    };
};

/**
 * Sets the max height of the textarea element based on the padding and position of the element.
 *
 * @param node - the textarea element
 * @param showButtonBar - whether the button bar is shown
 * @param showAdditionalInfos - whether the additional infos are shown
 */
function setMaxHeight(
    node: HTMLTextAreaElement,
    showButtonBar: boolean,
    showAdditionalInfos: boolean,
) {
    // Calculate max height based on the window height
    // node.getBoundingClientRect().top gives the top y position of the element i.e. the start of the element
    // 113/53 is the sum of all the paddings the button bar and a border
    const padding =
        (showButtonBar ? 113 : 53) + // 40 Pixels of button bar + 20 pixels of gap
        (showAdditionalInfos ? 5 : 0); // somehow there's a 5px change when the additional infos are shown
    const maxHeight = window.innerHeight - node.getBoundingClientRect().top - padding;
    node.style.maxHeight = `${maxHeight}px`;
    node.style.overflowY = "auto";
    node.style.overflowX = "hidden";
}

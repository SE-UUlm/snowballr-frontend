import type { Attachment } from "svelte/attachments";
import { ProjectStatus } from "$lib/model/api/project";

/**
 * Attaches two event listeners that call the passed function when the user clicks outside the element
 * or presses the escape key.
 *
 * @param onClickedOutsideOrEscape - The callback to be called when the user clicks outside the element or presses the escape key.
 */
function clickOutsideOrEscape(onClickedOutsideOrEscape: () => void): Attachment {
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

/**
 * Attaches a disabled attribute to all child elements that are interactive if the project is archived.
 *
 * @param projectStatus - The current status of the project.
 */
function disableIfProjectArchived(projectStatus: ProjectStatus): Attachment {
    return (element: Element) => {
        const interactiveChildren = element.querySelectorAll("input,button,select,textarea");

        const isProjectArchived = projectStatus === ProjectStatus.ARCHIVED;
        if (isProjectArchived) {
            element.setAttribute("disabled", "true");
            interactiveChildren.forEach((child) => {
                child.setAttribute("disabled", "true");
            });
        }
    };
}

export { clickOutsideOrEscape, disableIfProjectArchived };

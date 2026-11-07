import "@testing-library/jest-dom/vitest";

/*
jsdom has no layout engine, so `getClientRects()` always returns an empty list. bits-ui (>= 2.20)
treats an anchor without client rects as detached and hides its floating content (select, popover,
tooltip) with `visibility: hidden`, which makes it inaccessible to role queries. Report one rect for
every connected element instead.
 */
Element.prototype.getClientRects = function (this: Element) {
    return (this.isConnected ? [this.getBoundingClientRect()] : []) as unknown as DOMRectList;
};

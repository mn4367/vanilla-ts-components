import { ANodeComponent, ComponentFactory } from "@vanilla-ts/core";


////////////////////////////////////////////////////////////////////////////////////////////////////
// Only here because in this branch `Canvas` is not yet part of the dependency `@vanilla-ts/dom`!
////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Text component (for DOM text nodes).
 */
export class Text<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends ANodeComponent<globalThis.Text, EventMap> {
    // @ts-expect-error ---
    #brand;

    /**
     * Create instance based on the `Text` interface.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Text
     * @param text The text for the text node. If `undefined` or omitted, the text content of the
     * node will be an empty string.
     */
    constructor(text?: string) {
        super();
        this._dom = document.createTextNode(text ?? "");
    }
}

/**
 * Factory for `Text` components.
 */
export class TextFactory<T> extends ComponentFactory<Text> {
    /**
     * Create, set up and return Text component.
     * @param text The text for the text node. If `undefined` or omitted, the text content of the
     * node will be an empty string.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Text component.
     */
    public text(text?: string, data?: T): Text {
        return this.setupComponent(new Text(text), data);
    }
}

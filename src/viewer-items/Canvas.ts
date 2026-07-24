import { ComponentFactory, ElementComponentWithChildren, INodeComponent, mixinDOMProperties, WidthHeightAttr } from "@vanilla-ts/core";
import { Text } from "./Text.js";


////////////////////////////////////////////////////////////////////////////////////////////////////
// Only here because in this branch `Canvas` is not yet part of the dependency `@vanilla-ts/dom`!
////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Canvas component (`<canvas>`).
 */
export class Canvas<Child extends INodeComponent<Node> = INodeComponent<Node>, EventMap extends HTMLElementEventMap = HTMLElementEventMap, Children extends (Child | string)[] = (Child | string)[]> extends ElementComponentWithChildren<HTMLCanvasElement, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    // @ts-expect-error ---
    #brand;

    /**
     * Create Canvas component.
     * @param alternativeContent Alternative content for the `<canvas>` element.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas#alternative_content
     */
    constructor(...alternativeContent: Children) {
        super("canvas");
        this.append(...alternativeContent.map(child => typeof child === "string" ? <Child><unknown>new Text(child) : child));
    }

    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(
            this,
            WidthHeightAttr<HTMLCanvasElement>
        );
    }
}

// Augment class definition with the DOM attributes/properties introduced by `mixinDOMProperties()`
// above.
export interface Canvas<Child extends INodeComponent<Node> = INodeComponent<Node>, EventMap extends HTMLElementEventMap = HTMLElementEventMap, Children extends (Child | string)[] = (Child | string)[]> extends // eslint-disable-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-unused-vars,jsdoc/require-jsdoc
    WidthHeightAttr<HTMLCanvasElement, EventMap> { }

/**
 * Factory for `Canvas` components.
 */
export class CanvasFactory<Child extends INodeComponent<Node> = INodeComponent<Node>, T = unknown, Children extends (Child | string)[] = (Child | string)[]> extends ComponentFactory<Canvas<Child>> {
    /**
     * Create, set up and return Canvas component.
     * @param alternativeContent Alternative content for the `<canvas>` element.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas#alternative_content
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Canvas component.
     */
    public canvas(alternativeContent?: string | Child | Children, data?: T): Canvas<Child> {
        return this.setupComponent(
            !alternativeContent
                ? new Canvas<Child>()
                : Array.isArray(alternativeContent)
                    ? new Canvas<Child>(...alternativeContent)
                    : new Canvas<Child>(alternativeContent),
            data
        );
    }
}

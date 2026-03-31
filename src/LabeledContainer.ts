import { AChildren, ComponentFactory, FlowContent, IChildrenMixin, IElementWithChildrenComponent, mixin, Phrase, Phrases } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentGroup, LabelPosition } from "./LabeledComponents.js";


/**
 * LabeledContainer component.
 *
 * Usage notes:
 *
 * - Although it may seem that `LabeledContainer` is a simple replacement for `Div` components (it
 *   implements `IChildren` like `Div`), this is not the case (see following points).
 * - The property `Component`or `Container` __must not be used to add/remove/... components__,
 *   instead use the respective functions of `LabeledContainer` itself! `Component` should only be
 *   used for styling  or other (readonly) purposes!
 * - `clear()` is a destryoing operation(!), for an alternative see `clearContent()`.
 * - Children of `LabeledContainer` _may_ traverse the component hierarchy with `someChild.Parent`,
 *   but a single call to `Parent` is not enough. Due to the internal component tree and the use of
 *   `AElementComponentWithInternalUI` (through the inheritance chain),
 *   `someChild.Parent?.Parent?.Parent` must be called to reach the containing `LabeledContainer`
 *   instance!
 */
export class LabeledContainer<Child extends FlowContent = FlowContent, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponentGroup<Div, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    /**
     * Create LabeledContainer component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
        this
            // !! Mandatory.
            .setContent(new Div())
            // Set target DOM for the `IChildren` mixin!!
            .setChildrenDOMTarget(this.component.DOM);
    }

    /**
     * Get Container component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get Container(): IElementWithChildrenComponent<HTMLElement> {
        return this.component;
    }

    /**
     * Removes _and disposes_ of all children from the labeled container (except the label).
     * @returns This instance.
     */
    public clearContent(): this {
        const extracted: Child[] = [];
        this.extract(extracted);
        for (const component of extracted) {
            component.dispose();
        }
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.component`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface LabeledContainer<Child extends FlowContent = FlowContent> extends IChildrenMixin<Child> { } // eslint-disable-line jsdoc/require-jsdoc,@typescript-eslint/no-empty-object-type

/**
 * Factory for `LabeledContainer` components.
 */
export class LabeledContainerFactory<Child extends FlowContent = FlowContent, T = unknown> extends ComponentFactory<LabeledContainer<Child>> {
    /**
     * Create, set up and return LabeledContainer component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledContainer component.
     */
    public labeledContainer(labelPhrase: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledContainer<Child> {
        return this.setupComponent(new LabeledContainer<Child>(labelPhrase, lblPosition, lblAlignment), data);
    }
}

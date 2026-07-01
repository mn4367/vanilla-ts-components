import { ComponentFactory, DefaultEventMap, Phrase, Phrases, TargetAttributeValues } from "@vanilla-ts/core";
import { A } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithSpan, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled anchor component.
 */
export class LabeledAnchor<EventMap extends DefaultEventMap = DefaultEventMap> extends LabeledComponentWithSpan<A, EventMap> {
    /**
     * Create LabeledAnchor component.
     * @param href The `href` attribute for the `<a>` element.
     * @param labelPhrase The phrasing content for the label.
     * @param anchorPhrase The phrasing content for the `<a>` element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(href: string, labelPhrase: Phrase | Phrases, anchorPhrase?: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(
            new A(href, ...[anchorPhrase ?? []].flat()),
            labelPhrase,
            lblPosition,
            lblAlignment
        );
    }

    /**
     * Get A component of this component. Equivalent to `Component`, just with a more descriptive
     * name.
     */
    public get Anchor(): A {
        return this._component;
    }

    /**
     * Access the internal `A` component via a callback function. Useful for seamless chaining when
     * creating instances of this component.
     * @param cb A callback function that receives the current `A` component instance and this
     * instance as parameters.
     * @returns This instance.
     */
    public anchor(cb: (anchor: A, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Get/set the `href` attribute of the anchor component (re-exported for easier direct access).
     */
    public get Href(): string {
        return this._component.Href;
    }
    /** @inheritdoc */
    public set Href(v: string) {
        this._component.Href = v;
    }

    /**
     * Sets the `href` attribute of the anchor component (re-exported for easier direct access).
     * @param v The value to be set.
     * @returns This instance.
     */
    public href(v: string): this {
        this._component.href(v);
        return this;
    }

    /**
     * Get/set the `target` attribute of the anchor component (re-exported for easier direct
     * access).
     */
    public get Target(): TargetAttributeValues {
        return this._component.Target;
    }
    /** @inheritdoc */
    public set Target(v: TargetAttributeValues) {
        this._component.Target = v;
    }

    /**
     * Sets the `target` attribute of the anchor component (re-exported for easier direct access).
     * @param v The value to be set.
     * @returns This instance.
     */
    public target(v: TargetAttributeValues): this {
        this._component.target(v);
        return this;
    }

    /**
     * Set the phrasing content of the components anchor. __The setter `Phrase` here is an alias for
     * the property `this.Anchor.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrases) {
        this._component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components anchor. __The function `phrase()` here is an
     * alias for the function `this.Anchor.phrase()` but it returns _this_ instance instead of the
     * 'Anchor' instance.__
     * @param phrase The phrasing content to be set for the anchor.
     * @returns This instance.
     */
    public phrase(...phrase: Phrases): this {
        this._component.phrase(...phrase);
        return this;
    }

    /**
     * Set the phrasing content of the components anchor. __The setter `Rephrase` here is an alias
     * for the property `this.Anchor.Rephrase`.__
     */
    public set Rephrase(phrase: Phrase | Phrases) {
        this._component.Rephrase = phrase;
    }

    /**
     * Set the phrasing content of the the components anchor. __The function `rephrase()` here is an
     * alias for the function `this.Anchor.rephrase()` but it returns _this_ instance instead of the
     * 'Anchor' instance.__
     * @param phrase The phrasing content to be set for the anchor.
     * @returns This instance.
     */
    public rephrase(...phrase: Phrases): this {
        this._component.rephrase(...phrase);
        return this;
    }
}

/**
 * Factory for `LabeledAnchor` components.
 */
export class LabeledAnchorFactory<T> extends ComponentFactory<LabeledAnchor> {
    /**
     * Create, set up and return LabeledAnchor component.
     * @param href The `href` attribute for the `<a>` element.
     * @param labelPhrase The phrasing content for the label.
     * @param anchorPhrase The phrasing content for the `<a>` element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledAnchor component.
     */
    public labeledAnchor(href: string, labelPhrase: Phrase | Phrases, anchorPhrase?: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledAnchor {
        return this.setupComponent(new LabeledAnchor(href, labelPhrase, anchorPhrase, lblPosition, lblAlignment), data);
    }
}

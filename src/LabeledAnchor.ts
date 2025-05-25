import { ComponentFactory, Phrase } from "@vanilla-ts/core";
import { A, Div, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled anchor component.
 */
export class LabeledAnchor<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, A, EventMap> {
    /**
     * Create LabeledAnchor component.
     * @param href The `href` attribute for the `<a>` element.
     * @param labelPhrase The phrasing content for the label.
     * @param anchorPhrase The phrasing content for the `<a>` element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(href: string, labelPhrase: Phrase | Phrase[], anchorPhrase?: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition, lblAlignment);
        this.initialize(undefined, href);
        Array.isArray(anchorPhrase)
            ? this.component.phrase(...anchorPhrase)
            : !anchorPhrase || this.component.phrase(anchorPhrase);
    }

    /**
     * Get A component of this component. Equivalent to `Component`, just with a more descriptive
     * name.
     */
    public get Anchor(): A {
        return this.component;
    }

    /**
     * Get/set the `href` attribute of the anchor component (re-exported for easier direct access).
     */
    public get Href(): string {
        return this.component.Href;
    }
    /** @inheritdoc */
    public set Href(v: string) {
        this.component.Href = v;
    }

    /**
     * Sets the `href` attribute of the anchor component (re-exported for easier direct access).
     * @param v The value to be set.
     * @returns This instance.
     */
    public href(v: string): this {
        this.component.href(v);
        return this;
    }

    /**
     * Set the phrasing content of the components anchor. __The setter `Phrase` here is an alias for
     * the property `this.Anchor.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrase[]) {
        this.component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components anchor. __The function `phrase()` here is an
     * alias for the function `this.Anchor.phrase()` but it returns _this_ instance instead of the
     * 'Anchor' instance.__
     * @param phrase The phrasing content to be set for the anchor.
     * @returns This instance.
     */
    public phrase(...phrase: Phrase[]): this {
        this.component.phrase(...phrase);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(href: string): this {
        this.ui = (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? new Div()
                .append(
                    this.label = new Span(),
                    this.component = new A(href)
                )
            : new Div()
                .append(
                    this.component = new A(href),
                    this.label = new Span()
                );
        return this;
    }
}

/**
 * Factory for LabeledAnchor components.
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
    public labeledAnchor(href: string, labelPhrase: Phrase | Phrase[], anchorPhrase?: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledAnchor {
        return this.setupComponent(new LabeledAnchor(href, labelPhrase, anchorPhrase, lblPosition, lblAlignment), data);
    }
}

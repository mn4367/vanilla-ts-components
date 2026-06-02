import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { P } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithSpan, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled paragraph component. Can be used to display short text information which has a label,
 * e.g. in info panels like
 * ```
 * First name: John
 * Last name:  Doe
 * Role:       User
 * ```
 * The contained paragraph element itself is a compoment (`P`) so it can be used to display styled
 * text by, for example, appending `Span`, `Em` and other components to it. The same applies for the
 * label, which is a `Span` component.
 */
export class LabeledParagraph<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponentWithSpan<P, EventMap> {
    /**
     * Create LabeledParagraph component.
     * @param labelPhrase The phrasing content for the label.
     * @param paragraphPhrase The phrasing content for the p element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrases, paragraphPhrase: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(
            new P().phrase(...[paragraphPhrase ?? []].flat()),
            labelPhrase,
            lblPosition,
            lblAlignment
        );
    }

    /**
     * Get P component of this component. Equivalent to `Component`, just with a more descriptive
     * name.
     */
    public get Paragraph(): P {
        return this._component;
    }

    /**
     * Access the internal `P` component via a callback function. Useful for seamless chaining when
     * creating instances of this component.
     * @param cb A callback function that receives the current `P` component instance and this
     * instance as parameters.
     * @returns This instance.
     */
    public paragraph(cb: (paragraph: P, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Set the phrasing content of the components paragraph. __The setter `Phrase` here is an alias
     * for the property `this.Paragraph.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrases) {
        this._component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components paragraph. __The function `phrase()` here is
     * an alias for the function `this.Paragraph.phrase()` but it returns _this_ instance instead of
     * the 'Paragraph' instance.__
     * @param phrase The phrasing content to be set for the paragraph.
     * @returns This instance.
     */
    public phrase(...phrase: Phrases): this {
        this._component.phrase(...phrase);
        return this;
    }

    /**
     * Set the phrasing content of the components paragraph. __The setter `Rephrase` here is an
     * alias for the property `this.Paragraph.Rephrase`.__
     */
    public set Rephrase(phrase: Phrase | Phrases) {
        this._component.Rephrase = phrase;
    }

    /**
     * Set the phrasing content of the the components paragraph. __The function `rephrase()` here is
     * an alias for the function `this.Paragraph.rephrase()` but it returns _this_ instance instead
     * of the 'Paragraph' instance.__
     * @param phrase The phrasing content to be set for the paragraph.
     * @returns This instance.
     */
    public rephrase(...phrase: Phrases): this {
        this._component.rephrase(...phrase);
        return this;
    }
}

/**
 * Factory for `LabeledParagraph` components.
 */
export class LabeledParagraphFactory<T> extends ComponentFactory<LabeledParagraph> {
    /**
     * Create, set up and return LabeledParagraph component.
     * @param labelPhrase The phrasing content for the label.
     * @param paragraphPhrase The phrasing content for the p element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledParagraph component.
     */
    public labeledParagraph(labelPhrase: Phrase | Phrases, paragraphPhrase: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledParagraph {
        return this.setupComponent(new LabeledParagraph(labelPhrase, paragraphPhrase, lblPosition, lblAlignment), data);
    }
}

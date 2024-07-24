import { ComponentFactory, Phrase } from "@vanilla-ts/core";
import { Div, P, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


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
export class LabeledParagraph<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, P, EventMap> {
    /**
     * Create LabeledParagraph component.
     * @param labelPhrase The phrasing content for the label.
     * @param paragraphPhrase The phrasing content for the p element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrase[], paragraphPhrase: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.START, lblAlignment);
        this.initialize();
        Array.isArray(paragraphPhrase)
            ? this.component.phrase(...paragraphPhrase)
            : this.component.phrase(paragraphPhrase);
    }

    /**
     * Get P component of this component. Equivalent to `Component`, just with a more descriptive
     * name.
     */
    public get Paragraph(): P {
        return this.component;
    }

    /**
     * Set the phrasing content of the components paragraph. __The setter `Phrase` here is an alias
     * for the property `this.Paragraph.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrase[]) {
        this.component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components paragraph. __The function `phrase()` here is
     * an alias for the function `this.Paragraph.phrase()` but it returns _this_ instance instead of
     * the 'Paragraph' instance.__
     * @param phrase The phrasing content to be set for the paragraph.
     * @returns This instance.
     */
    public phrase(...phrase: Phrase[]): this {
        this.component.phrase(...phrase);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label = new Span(),
                    this.component = new P()
                )
            : this.ui = new Div()
                .append(
                    this.component = new P(),
                    this.label = new Span()
                );
        return this;
    }
}

/**
 * Factory for LabeledParagraph components.
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
    public labeledParagraph(labelPhrase: Phrase | Phrase[], paragraphPhrase: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledParagraph {
        return this.setupComponent(new LabeledParagraph(labelPhrase, paragraphPhrase, lblPosition, lblAlignment), data);
    }
}

import { ComponentFactory } from "@vanilla-ts/core";
import { P, Span } from "@vanilla-ts/dom";
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
 * text by, for example, appending `Span`, `Em` and other components to it.
 */
export class LabeledParagraph extends LabeledComponent<Span> {
    protected paragraph: P;

    /**
     * Builds the labeled paragraph component.
     * @param labelText The text for the label.
     * @param text The text content for the contained `P` component.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, text?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super("div", lblPosition ?? LabelPosition.LEFT, lblAlignment);
        this.append(
            this.label = new Span(labelText),
            this.paragraph = new P(text)
        );
    }

    /**
     * Get the paragraph component of this component.
     */
    public get Paragraph(): P {
        return this.paragraph;
    }
}

/**
 * Factory for LabeledParagraph components.
 */
export class LabeledParagraphFactory<T> extends ComponentFactory<LabeledParagraph> {
    /**
     * Create, set up and return LabeledParagraph component.
     * @param labelText The text for the label.
     * @param text The text content for the contained `P` component.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledParagraph component.
     */
    public labeledParagraph(labelText: string, text?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledParagraph {
        return this.setupComponent(new LabeledParagraph(labelText, text, lblPosition, lblAlignment), data);
    }
}

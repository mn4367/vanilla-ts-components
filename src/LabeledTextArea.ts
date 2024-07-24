import { ComponentFactory } from "@vanilla-ts/core";
import { Label, TextArea } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled TextArea component.
 */
export class LabeledTextArea extends LabeledComponent<Label> {
    protected textArea: TextArea;

    /**
     * Builds the labeled text area component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the textarea component.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the control.
     * @param cols The visible width of the text control, in average character widths.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the textarea component, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, id?: string, text?: string, rows?: number, cols?: number, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super("div", lblPosition, lblAlignment);
        this.append(
            this.label = new Label(
                labelText,
                id && (labelAction === undefined || labelAction === true)
                    ? id
                    : undefined
            ),
            this.textArea = new TextArea(text, rows, cols).id(id ? id : null)
        );
    }

    /**
     * Get textarea component of this component.
     */
    public get TextArea(): TextArea {
        return this.textArea;
    }
}

/**
 * Factory for LabeledTextArea components.
 */
export class LabeledTextAreaFactory<T> extends ComponentFactory<LabeledTextArea> {
    /**
     * Create, set up and return LabeledTextArea component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the textarea component.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the control.
     * @param cols The visible width of the text control, in average character widths.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the textarea component, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextArea component.
     */
    public labeledTextArea(labelText: string, id?: string, text?: string, rows?: number, cols?: number, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledTextArea {
        return this.setupComponent(new LabeledTextArea(labelText, id, text, rows, cols, labelAction, lblPosition, lblAlignment), data);
    }
}

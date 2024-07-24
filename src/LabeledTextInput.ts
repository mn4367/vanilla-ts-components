import { ComponentFactory } from "@vanilla-ts/core";
import { TextInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled text input component.
 */
export class LabeledTextInput extends LabeledInputComponent<TextInput> {
    /**
     * Builds the labeled text input component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the text input.
     * @param value The value of the text input.
     * @param name The `name` attribute of the text input.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the text input, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelText, id, labelAction, lblPosition, lblAlignment);
        this.append(
            this.label,
            this.input = new TextInput(id, value, name)
        );
    }

    /**
     * Alternative property to 'Input' for accessing the contained text input with a descriptive
     * name.
     */
    public get TextInput(): TextInput {
        return this.input;
    }
}

/**
 * Factory for LabeledTextInput components.
 */
export class LabeledTextInputFactory<T> extends ComponentFactory<LabeledTextInput> {
    /**
     * Create, set up and return LabeledTextInput component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the text input.
     * @param value The value of the text input.
     * @param name The `name` attribute of the text input.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the text input, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextInput component.
     */
    public labeledTextInput(labelText: string, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledTextInput {
        return this.setupComponent(new LabeledTextInput(labelText, id, value, name, labelAction, lblPosition, lblAlignment), data);
    }
}

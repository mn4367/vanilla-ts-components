import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { TextInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled text input component.
 */
export class LabeledTextInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<TextInput, EventMap> {
    /**
     * Create LabeledTextInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the text input element.
     * @param value The value of the text input element.
     * @param name The `name` attribute of the text input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `lblAction` is `true` or `undefined`, a click on the label focuses
     *   the text input element, if `lblAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        super(
            new TextInput(id, value, name),
            labelPhrase,
            id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get TextInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get TextInput(): TextInput {
        return this.component;
    }
}

/**
 * Factory for `LabeledTextInput` components.
 */
export class LabeledTextInputFactory<T> extends ComponentFactory<LabeledTextInput> {
    /**
     * Create, set up and return LabeledTextInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the text input element.
     * @param value The value of the text input element.
     * @param name The `name` attribute of the text input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `lblAction` is `true` or `undefined`, a click on the label focuses
     *   the text input element, if `lblAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextInput component.
     */
    public labeledTextInput(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledTextInput {
        return this.setupComponent(new LabeledTextInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

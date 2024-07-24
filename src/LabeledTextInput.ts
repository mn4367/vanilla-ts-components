import { ComponentFactory, Phrase } from "@vanilla-ts/core";
import { TextInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


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
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the text input element, if `labelAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrase[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition, lblAlignment, labelAction);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component = new TextInput(id, value, name))
            : this.ui.insert(0, this.component = new TextInput(id, value, name));
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
 * Factory for LabeledTextInput components.
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
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the text input element, if `labelAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextInput component.
     */
    public labeledTextInput(labelPhrase: Phrase | Phrase[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledTextInput {
        return this.setupComponent(new LabeledTextInput(labelPhrase, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}

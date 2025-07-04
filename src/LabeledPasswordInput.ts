import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { PasswordInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled password input component.
 */
export class LabeledPasswordInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<PasswordInput, EventMap> {
    /**
     * Create LabeledPasswordInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the password input element.
     * @param value The value of the password input element.
     * @param name The `name` attribute of the password input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the password input element, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition, lblAlignment, labelAction);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component = new PasswordInput(id, value, name))
            : this.ui.insert(0, this.component = new PasswordInput(id, value, name));
    }

    /**
     * Get PasswordInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get PasswordInput(): PasswordInput {
        return this.component;
    }
}

/**
 * Factory for LabeledPasswordInput components.
 */
export class LabeledPasswordInputFactory<T> extends ComponentFactory<LabeledPasswordInput> {
    /**
     * Create, set up and return LabeledPasswordInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the password input element.
     * @param value The value of the password input element.
     * @param name The `name` attribute of the password input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the password input element, if `labelAction` is `false`, clicking on the label does
     * nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledPasswordInput component.
     */
    public labeledPasswordInput(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledPasswordInput {
        return this.setupComponent(new LabeledPasswordInput(labelPhrase, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}

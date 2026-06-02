import { cid, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { EmailInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled email input component.
 */
export class LabeledEmailInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<EmailInput, EventMap> {
    /**
     * Create LabeledEmailInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the email input element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the email input element.
     * @param name The `name` attribute of the email input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the email input element (a unique ID has been
     *   set automatically on the email input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the email input element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new EmailInput(_id, value, name),
            labelPhrase,
            _id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get EmailInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get EmailInput(): EmailInput {
        return this._component;
    }

    /**
     * Access the internal `EmailInput` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `EmailInput` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    public emailInput(cb: (emailInput: EmailInput, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }
}

/**
 * Factory for `LabeledEmailInput` components.
 */
export class LabeledEmailInputFactory<T> extends ComponentFactory<LabeledEmailInput> {
    /**
     * Create, set up and return LabeledEmailInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the email input element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the email input element.
     * @param name The `name` attribute of the email input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the email input element (a unique ID has been
     *   set automatically on the email input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the email input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledEmailInput component.
     */
    public labeledEmailInput(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledEmailInput {
        return this.setupComponent(new LabeledEmailInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

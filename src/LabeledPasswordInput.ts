import { cid, ComponentFactory, DefaultEventMap, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { PasswordInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled password input component.
 */
export class LabeledPasswordInput<EventMap extends DefaultEventMap = DefaultEventMap> extends LabeledInputComponent<PasswordInput, EventMap> {
    /**
     * Create LabeledPasswordInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the password input element. If `id` is `undefined` or
     * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
     * string, no id attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the password input element.
     * @param name The `name` attribute of the password input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the password input element (a unique ID has
     *   been set automatically on the password input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the password input element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new PasswordInput(_id, value, name),
            labelPhrase,
            _id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get PasswordInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get PasswordInput(): PasswordInput {
        return this._component;
    }

    /**
     * Access the internal `PasswordInput` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `PasswordInput` component instance
     * and this instance as parameters.
     * @returns This instance.
     */
    public passwordInput(cb: (passwordInput: PasswordInput, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }
}

/**
 * Factory for `LabeledPasswordInput` components.
 */
export class LabeledPasswordInputFactory<T> extends ComponentFactory<LabeledPasswordInput> {
    /**
     * Create, set up and return LabeledPasswordInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the password input element. If `id` is `undefined` or
     * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
     * string, no id attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the password input element.
     * @param name The `name` attribute of the password input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the password input element (a unique ID has
     *   been set automatically on the password input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the password input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledPasswordInput component.
     */
    public labeledPasswordInput(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledPasswordInput {
        return this.setupComponent(new LabeledPasswordInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

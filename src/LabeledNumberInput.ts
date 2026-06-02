import { cid, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { NumberInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled number input component.
 */
export class LabeledNumberInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<NumberInput, EventMap> {
    /**
     * Create LabeledNumberInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the number input element. If `id` is `undefined` or omitted,
     * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the number input element.
     * @param name The `name` attribute of the number input element.
     * @param min The minimum value (attribute) of the number input.
     * @param max The maximum value (attribute) of the number input.
     * @param step The step value (attribute) of the number input.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the number input element (a unique ID has been
     *   set automatically on the number input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the number input element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, min?: string, max?: string, step?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new NumberInput(_id, value, name, min, max, step),
            labelPhrase,
            _id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get NumberInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get NumberInput(): NumberInput {
        return this._component;
    }

    /**
     * Access the internal `NumberInput` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `NumberInput` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    public numberInput(cb: (numberInput: NumberInput, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }
}

/**
 * Factory for `LabeledNumberInput` components.
 */
export class LabeledNumberInputFactory<T> extends ComponentFactory<LabeledNumberInput> {
    /**
     * Create, set up and return LabeledNumberInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the number input element. If `id` is `undefined` or omitted,
     * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the number input element.
     * @param name The `name` attribute of the number input element.
     * @param min The minimum value (attribute) of the number input.
     * @param max The maximum value (attribute) of the number input.
     * @param step The step value (attribute) of the number input.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the number input element (a unique ID has been
     *   set automatically on the number input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the number input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledNumberInput component.
     */
    public labeledNumberInput(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, min?: string, max?: string, step?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledNumberInput {
        return this.setupComponent(new LabeledNumberInput(labelPhrase, id, value, name, min, max, step, lblPosition, lblAlignment, lblAction), data);
    }
}

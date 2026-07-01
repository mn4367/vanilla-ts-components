import { cid, ComponentFactory, DefaultEventMap, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { RangeInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled range input component.
 */
export class LabeledRangeInput<EventMap extends DefaultEventMap = DefaultEventMap> extends LabeledInputComponent<RangeInput, EventMap> {
    /**
     * Create LabeledRangeInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the range input element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the range input element.
     * @param name The `name` attribute of the range input element.
     * @param min The minimum value (attribute) of the range input.
     * @param max The maximum value (attribute) of the range input.
     * @param step The step value (attribute) of the range input.
     * @param vertical `true` if the range input is to be displayed with a vertical orientation,
     * otherwise `false`.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the range input element (a unique ID has been
     *   set automatically on the range input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the range input element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, min: string = "0", max: string = "100", step: string | "any" = "1", vertical: boolean = false, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) { // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new RangeInput(_id, value, name, min, max, step, vertical),
            labelPhrase,
            _id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get RangeInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get RangeInput(): RangeInput {
        return this._component;
    }

    /**
     * Access the internal `RangeInput` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `RangeInput` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    public rangeInput(cb: (rangeInput: RangeInput, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }
}

/**
 * Factory for `LabeledRangeInput` components.
 */
export class LabeledRangeInputFactory<T> extends ComponentFactory<LabeledRangeInput> {
    /**
     * Create, set up and return LabeledRangeInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the range input element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the range input element.
     * @param name The `name` attribute of the range input element.
     * @param min The minimum value (attribute) of the range input.
     * @param max The maximum value (attribute) of the range input.
     * @param step The step value (attribute) of the range input.
     * @param vertical `true` if the range input is to be displayed with a vertical orientation,
     * otherwise `false`.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the range input element (a unique ID has been
     *   set automatically on the range input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the range input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRangeInput component.
     */
    public labeledRangeInput(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, min: string = "0", max: string = "100", step: string | "any" = "1", vertical: boolean = false, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledRangeInput { // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
        return this.setupComponent(new LabeledRangeInput(labelPhrase, id, value, name, min, max, step, vertical, lblPosition, lblAlignment, lblAction), data);
    }
}

import { cid, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { TemporalInput, TemporalType } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled temporal input component.
 */
export class LabeledTemporalInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<TemporalInput, EventMap> {
    /**
     * Create LabeledTemporalInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param temporalType The type (attribute) of the temporal input element.
     * @param id The id (attribute) of the temporal input element. If `id` is `undefined` or
     * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
     * string, no id attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the temporal input element.
     * @param name The name (attribute) of the temporal input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the temporal input element (a unique ID has
     *   been set automatically on the temporal input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the temporal input element).
     */
    constructor(labelPhrase: Phrase | Phrases, temporalType: TemporalType, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new TemporalInput(temporalType, _id, value, name),
            labelPhrase,
            _id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get TemporalInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get TemporalInput(): TemporalInput {
        return this._component;
    }

    /**
     * Access the internal `TemporalInput` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `TemporalInput` component instance
     * and this instance as parameters.
     * @returns This instance.
     */
    public temporalInput(cb: (temporalInput: TemporalInput, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Get/set the setp attribute value of the component (re-exported for easier direct access).
     */
    public get Step(): string {
        return this._component.Step;
    }
    /** @inheritdoc */
    public set Step(v: string) {
        this._component.Step = v;
    }

    /**
     * Set step attribute value of the component (re-exported for easier direct access).
     * @param step The step attribute value to be set.
     * @returns This instance.
     */
    public step(step: string): this {
        this._component.step(step);
        return this;
    }

    /**
     * Increments the input control's value by the value given by the `Step` attribute. If the
     * optional parameter is used, it will will increment the input control's value by that value
     * (re-exported for easier direct access).
     * @param n Value to decrement the value by.
     * @returns This instance.
     */
    public stepUp(n?: number): this {
        this._component.stepUp(n);
        return this;
    }

    /**
     * Decrements the input control's value by the value given by the `Step` attribute. If the
     * optional parameter is used, it will will decrement the input control's value by that value
     * (re-exported for easier direct access).
     * @param n Value to decrement the value by.
     * @returns This instance.
     */
    public stepDown(n?: number): this {
        this._component.stepDown(n);
        return this;
    }
}

/**
 * Factory for `LabeledTemporalInput` components.
 */
export class LabeledTemporalInputFactory<T> extends ComponentFactory<LabeledTemporalInput> {
    /**
     * Create, set up and return LabeledTemporalInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param temporalType The type (attribute) of the temporal input element.
     * @param id The id (attribute) of the temporal input element. If `id` is `undefined` or
     * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
     * string, no id attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the temporal input element.
     * @param name The name (attribute) of the temporal input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the temporal input element (a unique ID has
     *   been set automatically on the temporal input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the temporal input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTemporalInput component.
     */
    public labeledTemporalInput(labelPhrase: Phrase | Phrases, temporalType: TemporalType, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledTemporalInput {
        return this.setupComponent(new LabeledTemporalInput(labelPhrase, temporalType, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

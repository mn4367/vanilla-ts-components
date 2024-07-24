import { ComponentFactory } from "@vanilla-ts/core";
import { TemporalInput, TemporalType } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled temporal input component.
 */
export class LabeledTemporalInput extends LabeledInputComponent<TemporalInput> {
    /**
     * Builds the labeled temporal input component.
     * @param labelText The text for the label.
     * @param temporalType The type (attribute) of the temporal input.
     * @param id The id (attribute) of the temporal input.
     * @param value The value of the temporal input.
     * @param name The name (attribute) of the temporal input.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the temporal input, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, temporalType: TemporalType, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelText, id, labelAction, lblPosition, lblAlignment);
        this.append(
            this.label,
            this.input = new TemporalInput(temporalType, id, value, name)
        );
    }

    /**
     * Alternative property to 'Input' for accessing the contained temporal input with a descriptive
     * name.
     */
    public get TemporalInput(): TemporalInput {
        return this.input;
    }

    /**
     * Get/set the setp attribute value of the component (re-exported for easier direct access).
     */
    public get Step(): string {
        return this.input.Step;
    }
    /** @inheritdoc */
    public set Step(v: string) {
        this.input.Step = v;
    }

    /**
     * Set step attribute value of the component (re-exported for easier direct access).
     * @param step The step attribute value to be set.
     * @returns This instance.
     */
    public step(step: string): this {
        this.input.step(step);
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
        this.input.stepUp(n);
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
        this.input.stepDown(n);
        return this;
    }
}

/**
 * Factory for LabeledTemporalInput components.
 */
export class LabeledTemporalInputFactory<T> extends ComponentFactory<LabeledTemporalInput> {
    /**
     * Create, set up and return LabeledTemporalInput component.
     * @param labelText The text for the label.
     * @param temporalType The type (attribute) of the temporal input.
     * @param id The id (attribute) of the temporal input.
     * @param value The value of the temporal input.
     * @param name The name (attribute) of the temporal input.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the temporal input, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTemporalInput component.
     */
    public labeledTemporalInput(labelText: string, temporalType: TemporalType, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledTemporalInput {
        return this.setupComponent(new LabeledTemporalInput(labelText, temporalType, id, value, name, labelAction, lblPosition, lblAlignment), data);
    }
}

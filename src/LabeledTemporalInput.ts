import { ComponentFactory, Phrase } from "@vanilla-ts/core";
import { TemporalInput, TemporalType } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled temporal input component.
 */
export class LabeledTemporalInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<TemporalInput, EventMap> {
    /**
     * Create LabeledTemporalInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param temporalType The type (attribute) of the temporal input element.
     * @param id The id (attribute) of the temporal input element.
     * @param value The value of the temporal input element.
     * @param name The name (attribute) of the temporal input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the temporal input element, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     */
    constructor(labelPhrase: Phrase | Phrase[], temporalType: TemporalType, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition ?? LabelPosition.START, lblAlignment, labelAction);
        this.ui.append(this.component = new TemporalInput(temporalType, id, value, name));
    }

    /**
     * Get TemporalInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get TemporalInput(): TemporalInput {
        return this.component;
    }

    /**
     * Get/set the setp attribute value of the component (re-exported for easier direct access).
     */
    public get Step(): string {
        return this.component.Step;
    }
    /** @inheritdoc */
    public set Step(v: string) {
        this.component.Step = v;
    }

    /**
     * Set step attribute value of the component (re-exported for easier direct access).
     * @param step The step attribute value to be set.
     * @returns This instance.
     */
    public step(step: string): this {
        this.component.step(step);
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
        this.component.stepUp(n);
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
        this.component.stepDown(n);
        return this;
    }
}

/**
 * Factory for LabeledTemporalInput components.
 */
export class LabeledTemporalInputFactory<T> extends ComponentFactory<LabeledTemporalInput> {
    /**
     * Create, set up and return LabeledTemporalInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param temporalType The type (attribute) of the temporal input element.
     * @param id The id (attribute) of the temporal input element.
     * @param value The value of the temporal input element.
     * @param name The name (attribute) of the temporal input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the temporal input element, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTemporalInput component.
     */
    public labeledTemporalInput(labelPhrase: Phrase | Phrase[], temporalType: TemporalType, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledTemporalInput {
        return this.setupComponent(new LabeledTemporalInput(labelPhrase, temporalType, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}

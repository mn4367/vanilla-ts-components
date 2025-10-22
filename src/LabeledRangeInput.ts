import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { RangeInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled range input component.
 */
export class LabeledRangeInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<RangeInput, EventMap> {
    /**
     * Create LabeledRangeInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the range input element.
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
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `lblAction` is `true` or `undefined`, a click on the label focuses
     *   the range input element, if `lblAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, min: string = "0", max: string = "100", step: string | "any" = "1", vertical: boolean = false, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) { // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
        super(
            new RangeInput(id, value, name, min, max, step, vertical),
            labelPhrase,
            id,
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
        return this.component;
    }
}

/**
 * Factory for `LabeledRangeInput` components.
 */
export class LabeledRangeInputFactory<T> extends ComponentFactory<LabeledRangeInput> {
    /**
     * Create, set up and return LabeledRangeInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the range input element.
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
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `lblAction` is `true` or `undefined`, a click on the label focuses
     *   the range input element, if `lblAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRangeInput component.
     */
    public labeledRangeInput(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, min: string = "0", max: string = "100", step: string | "any" = "1", vertical: boolean = false, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledRangeInput { // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
        return this.setupComponent(new LabeledRangeInput(labelPhrase, id, value, name, min, max, step, vertical, lblPosition, lblAlignment, lblAction), data);
    }
}

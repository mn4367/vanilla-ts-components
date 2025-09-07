import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { NumberInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled number input component.
 */
export class LabeledNumberInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<NumberInput, EventMap> {
    /**
     * Create LabeledNumberInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the number input element.
     * @param value The value of the number input element.
     * @param name The `name` attribute of the number input element.
     * @param min The minimum value (attribute) of the number input.
     * @param max The maximum value (attribute) of the number input.
     * @param step The step value (attribute) of the number input.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the number input element, if `labelAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, min?: string, max?: string, step?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition, lblAlignment, labelAction);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component = new NumberInput(id, value, name, min, max, step))
            : this.ui.insert(0, this.component = new NumberInput(id, value, name, min, max, step));
    }

    /**
     * Get NumberInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get NumberInput(): NumberInput {
        return this.component;
    }
}

/**
 * Factory for `LabeledNumberInput` components.
 */
export class LabeledNumberInputFactory<T> extends ComponentFactory<LabeledNumberInput> {
    /**
     * Create, set up and return LabeledNumberInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the number input element.
     * @param value The value of the number input element.
     * @param name The `name` attribute of the number input element.
     * @param min The minimum value (attribute) of the number input.
     * @param max The maximum value (attribute) of the number input.
     * @param step The step value (attribute) of the number input.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the number input element, if `labelAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledNumberInput component.
     */
    public labeledNumberInput(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, min?: string, max?: string, step?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledNumberInput {
        return this.setupComponent(new LabeledNumberInput(labelPhrase, id, value, name, min, max, step, lblPosition, lblAlignment, labelAction), data);
    }
}

import { ComponentFactory } from "@vanilla-ts/core";
import { ISelectValues, Label, SelectInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled TextArea component.
 */
export class LabeledSelectInput extends LabeledComponent<Label> {
    protected _select: SelectInput;

    /**
     * Builds the labeled select input component.
     * @param labelText The text for the label.
     * @param values The values to be displayed in the select input.
     * @param id The id (attribute) of the select input.
     * @param value The value of the select input.
     * @param name The name (attribute) of the select input.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the select input component, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, values: ISelectValues[], id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super("div", lblPosition, lblAlignment);
        this.append(
            this.label = new Label(
                labelText,
                id && (labelAction === undefined || labelAction === true)
                    ? id
                    : undefined
            ),
            this._select = new SelectInput(values, id, value, name)
        );
    }

    /**
     * Get select component of this component.
     */
    public get SelectInput(): SelectInput {
        return this._select;
    }
}

/**
 * Factory for LabeledSelectInput components.
 */
export class LabeledSelectInputFactory<T> extends ComponentFactory<LabeledSelectInput> {
    /**
     * Create, set up and return LabeledSelectInput component.
     * @param labelText The text for the label.
     * @param values The values to be displayed in the select input.
     * @param id The id (attribute) of the select input.
     * @param value The value of the select input.
     * @param name The name (attribute) of the select input.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the select input component, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSelectInput component.
     */
    public labeledSelectInput(labelText: string, values: ISelectValues[], id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledSelectInput {
        return this.setupComponent(new LabeledSelectInput(labelText, values, id, value, name, labelAction, lblPosition, lblAlignment), data);
    }
}

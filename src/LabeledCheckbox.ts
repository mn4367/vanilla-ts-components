import { ComponentFactory } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled checkbox component.
 */
export class LabeledCheckbox extends LabeledInputComponent<Checkbox> {
    /**
     * Builds the labeled checkbox component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the checkbox.
     * @param value The value of the checkbox.
     * @param name The `name` attribute of the checkbox.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the checkbox, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelText, id, labelAction, lblPosition, lblAlignment);
        this.append(
            this.input = new Checkbox(id, value, name),
            this.label
        );
    }

    /**
     * Alternative property to 'Input' for accessing the contained checkbox with a descriptive name.
     */
    public get Checkbox(): Checkbox {
        return this.input;
    }

    /**
     * Get/set the checked state of the checkbox (re-exported for easier direct access).
     */
    public get Checked(): boolean {
        return this.input.Checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this.input.Checked = v;
    }

    /**
     * Get/set the indeterminate state of the checkbox (re-exported for easier direct access).
     */
    public get Indeterminate(): boolean {
        return this.input.Indeterminate;
    }
    /** @inheritdoc */
    public set Indeterminate(v: boolean) {
        this.input.Indeterminate = v;
    }

    /**
     * Set the the checked state of the checkbox to checked/unchecked (re-exported for easier direct
     * access).
     * @param checked `true`, if the checkbox should be checked, otherwise false.
     * @returns This instance.
     */
    public checked(checked: boolean): this {
        this.input.Checked = checked;
        return this;
    }

    /**
     * Sets the indeterminate state of the checkbox to indeterminate/determinate (re-exported for
     * easier direct access).
     * @param indeterminate `true`, if the state of the checkbox should be indeterminate, otherwise
     * false.
     * @returns This instance.
     */
    public indeterminate(indeterminate: boolean): this {
        this.input.indeterminate(indeterminate);
        return this;
    }
}

/**
 * Factory for LabeledCheckbox components.
 */
export class LabeledCheckboxFactory<T> extends ComponentFactory<LabeledCheckbox> {
    /**
     * Create, set up and return LabeledCheckbox component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the checkbox.
     * @param value The value of the checkbox.
     * @param name The `name` attribute of the checkbox.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the checkbox, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledCheckbox component.
     */
    public labeledCheckbox(labelText: string, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledCheckbox {
        return this.setupComponent(new LabeledCheckbox(labelText, id, value, name, labelAction, lblPosition, lblAlignment), data);
    }
}

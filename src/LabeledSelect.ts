import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { ISelectValues, Select } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithLabel, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled select component.
 */
export class LabeledSelect<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponentWithLabel<Select, EventMap> {
    /**
     * Create LabeledSelect component.
     * @param labelPhrase The phrasing content for the label.
     * @param values The values to be displayed in the select element.
     * @param id The `id` attribute of the select element.
     * @param value The value of the select element.
     * @param name The `name` attribute of the select element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `lblAction` is `true` or `undefined`, a click on the label focuses
     *   the select element, if `lblAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, values: ISelectValues[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        super(
            new Select(values, id, value, name),
            labelPhrase,
            id,
            lblPosition,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get select component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get Select(): Select {
        return this.component;
    }

    /**
     * __The property `Value` here is an alias for the property `this.Select.Value`.__
     */
    public get Value(): string {
        return this.component.Value;
    }
    /** @inheritdoc */
    public set Value(v: string) {
        this.component.Value = v;
    }

    /**
     * __The function `value()` here is an alias for the function `this.Select.value()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @param v The value to be set.
     * @returns This instance.
     */
    public value(v: string): this {
        this.component.value(v);
        return this;
    }
}

/**
 * Factory for `LabeledSelect` components.
 */
export class LabeledSelectFactory<T> extends ComponentFactory<LabeledSelect> {
    /**
     * Create, set up and return LabeledSelect component.
     * @param labelPhrase The phrasing content for the label.
     * @param values The values to be displayed in the select element.
     * @param id The `id` attribute of the select element.
     * @param value The value of the select element.
     * @param name The `name` attribute of the select element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `lblAction` is `true` or `undefined`, a click on the label focuses
     *   the select element, if `lblAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSelect component.
     */
    public labeledSelect(labelPhrase: Phrase | Phrases, values: ISelectValues[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledSelect {
        return this.setupComponent(new LabeledSelect(labelPhrase, values, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

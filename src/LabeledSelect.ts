import { ComponentFactory, Phrase } from "@vanilla-ts/core";
import { Div, ISelectValues, Label, Select } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled select component.
 */
export class LabeledSelect<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Label, Select, EventMap> {
    /**
     * Create LabeledSelect component.
     * @param labelPhrase The phrasing content for the label.
     * @param values The values to be displayed in the select element.
     * @param id The `id` attribute of the select element.
     * @param value The value of the select element.
     * @param name The `name` attribute of the select element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the select element, if `labelAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrase[], values: ISelectValues[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, lblPosition ?? LabelPosition.START, lblAlignment);
        this.initialize(undefined, values, id, value, name, labelAction);
    }

    /**
     * Get select component of this component.
     */
    public get Select(): Select {
        return this.component;
    }

    /** @inheritdoc */
    protected override buildUI(values: ISelectValues[], id?: string, value?: string, name?: string, labelAction?: boolean): this {
        this.label = new Label(
            id && (labelAction === undefined || labelAction === true)
                ? id
                : undefined
        );
        this.component = new Select(values, id, value, name);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label,
                    this.component
                )
            : this.ui = new Div()
                .append(
                    this.component,
                    this.label
                );
        return this;
    }
}

/**
 * Factory for LabeledSelect components.
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
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the select element, if `labelAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSelect component.
     */
    public labeledSelect(labelPhrase: Phrase | Phrase[], values: ISelectValues[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledSelect {
        return this.setupComponent(new LabeledSelect(labelPhrase, values, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}

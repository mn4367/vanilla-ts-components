import { cid, ComponentFactory, DefaultEventMap, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { Select, SelectChild } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithLabel, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled select component.
 */
export class LabeledSelect<EventMap extends DefaultEventMap = DefaultEventMap> extends LabeledComponentWithLabel<Select, EventMap> {
    /**
     * Create LabeledSelect component.
     * @param labelPhrase The phrasing content for the label.
     * @param options The option elements to be displayed in the select element.
     * @param id The id (attribute) of the select element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the select element.
     * @param name The `name` attribute of the select element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the select element (a unique ID has been set
     *   automatically on the select element), if `lblAction` is `false`, clicking on the label does
     *   nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the select element).
     */
    constructor(labelPhrase: Phrase | Phrases, options: SelectChild[], id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new Select(options, _id, value, name),
            labelPhrase,
            _id,
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
        return this._component;
    }

    /**
     * Access the internal `Select` component via a callback function. Useful for seamless chaining
     * when creating instances of this component.
     * @param cb A callback function that receives the current `Select` component instance and this
     * instance as parameters.
     * @returns This instance.
     */
    public select(cb: (select: Select, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * __The property `Value` here is an alias for the property `this.Select.Value`.__
     */
    public get Value(): string {
        return this._component.Value;
    }
    /** @inheritdoc */
    public set Value(v: string) {
        this._component.Value = v;
    }

    /**
     * __The function `value()` here is an alias for the function `this.Select.value()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @param v The value to be set.
     * @returns This instance.
     */
    public value(v: string): this {
        this._component.value(v);
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
     * @param options The option elements to be displayed in the select element.
     * @param id The id (attribute) of the select element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the select element.
     * @param name The `name` attribute of the select element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the select element (a unique ID has been set
     *   automatically on the select element), if `lblAction` is `false`, clicking on the label does
     *   nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the select element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSelect component.
     */
    public labeledSelect(labelPhrase: Phrase | Phrases, options: SelectChild[], id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledSelect {
        return this.setupComponent(new LabeledSelect(labelPhrase, options, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

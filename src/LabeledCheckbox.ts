import { CheckedEvent, cid, ComponentFactory, DefaultEventMap, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/** Additional event(s) for `LabeledCheckbox`. */
export interface LabeledCheckboxEventMap extends DefaultEventMap {
    /** A checkbox is checked/unchecked. */
    "checked": CheckedEvent<Checkbox>;
}

/**
 * Labeled checkbox component.
 */
export class LabeledCheckbox<EventMap extends LabeledCheckboxEventMap = LabeledCheckboxEventMap> extends LabeledInputComponent<Checkbox, EventMap> {
    /**
     * Create LabeledCheckbox component.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
     * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
     * will be set. Any other value will be used as the id attribute.
     * @param value The value of the checkbox input element.
     * @param name The `name` attribute of the checkbox input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label toggles the checkbox input element (a unique ID has
     *   been set automatically on the checkbox input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the checkbox input element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new Checkbox(_id, value, name)
                // Forward this event to make handling of the component easier.
                .on("checked", (ev) => {
                    // ev.preventDefault();
                    ev.stopImmediatePropagation();
                    this.emit(new CheckedEvent("checked", this, { Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
                }),
            labelPhrase,
            _id,
            lblPosition ?? LabelPosition.END,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get Checkbox component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get Checkbox(): Checkbox {
        return this._component;
    }

    /**
     * Access the internal `Checkbox` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `Checkbox` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    public checkbox(cb: (checkbox: Checkbox, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Get/set the checked state of the checkbox (re-exported for easier direct access).
     */
    public get Checked(): boolean {
        return this._component.Checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this._component.Checked = v;
    }

    /**
     * Set the the checked state of the checkbox to checked/unchecked (re-exported for easier direct
     * access).
     * @param checked `true`, if the checkbox should be checked, otherwise false.
     * @returns This instance.
     */
    public checked(checked: boolean): this {
        this._component.Checked = checked;
        return this;
    }

    /**
     * Get/set the indeterminate state of the checkbox (re-exported for easier direct access).
     */
    public get Indeterminate(): boolean {
        return this._component.Indeterminate;
    }
    /** @inheritdoc */
    public set Indeterminate(v: boolean) {
        this._component.Indeterminate = v;
    }

    /**
     * Sets the indeterminate state of the checkbox to indeterminate/determinate (re-exported for
     * easier direct access).
     * @param indeterminate `true`, if the state of the checkbox should be indeterminate, otherwise
     * false.
     * @returns This instance.
     */
    public indeterminate(indeterminate: boolean): this {
        this._component.indeterminate(indeterminate);
        return this;
    }
}

/**
 * Factory for `LabeledCheckbox` components.
 */
export class LabeledCheckboxFactory<T> extends ComponentFactory<LabeledCheckbox> {
    /**
     * Create, set up and return LabeledCheckbox component.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
     * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
     * will be set. Any other value will be used as the id attribute.
     * @param value The value of the checkbox input element.
     * @param name The `name` attribute of the checkbox input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label toggles the checkbox input element (a unique ID has
     *   been set automatically on the checkbox input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the checkbox input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledCheckbox component.
     */
    public labeledCheckbox(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledCheckbox {
        return this.setupComponent(new LabeledCheckbox(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }

    /**
     * Create, set up and return LabeledCheckbox component. Identical to {@link labeledCheckbox()},
     * but the class name `switch` is added to the inner checkbox.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
     * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
     * will be set. Any other value will be used as the id attribute.
     * @param value The value of the checkbox input element.
     * @param name The `name` attribute of the checkbox input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label toggles the checkbox input element (a unique ID has
     *   been set automatically on the checkbox input element), if `lblAction` is `false`, clicking
     *   on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the checkbox input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledCheckbox component.
     */
    public labeledSwitch(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledCheckbox {
        const ls = new LabeledCheckbox(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction);
        ls.Checkbox.addClass("switch");
        return this.setupComponent(ls, data);
    }
}

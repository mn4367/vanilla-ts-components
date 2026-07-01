import { CheckedEvent, cid, ComponentFactory, DEFAULT_EVENT_INIT_DICT, DefaultEventMap, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { RadioButton } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/** Additional event(s) for `LabeledRadioButton`. */
export interface LabeledRadioButtonEventMap extends DefaultEventMap {
    /** A radio button is checked/unchecked. */
    "checked": CheckedEvent<RadioButton>;
}

/**
 * Labeled radio button component.
 */
export class LabeledRadioButton<EventMap extends LabeledRadioButtonEventMap = LabeledRadioButtonEventMap> extends LabeledInputComponent<RadioButton, EventMap> {
    /**
     * Create LabeledRadioButton component.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the radio button element. If `id` is `undefined` or omitted,
     * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the radio button element.
     * @param name The `name` attribute of the radio button element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses/toggles the radio button element (a unique ID
     *   has been set automatically on the radio button element), if `lblAction` is `false`,
     *   clicking on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the radio button element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new RadioButton(_id, value, name)
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
        // Support toggling also on label clicks.
        this._label.on("click", (ev: PointerEvent) => {
            if (this._component.Toggle) {
                ev.preventDefault();
                this._component.checked(!this._component.Checked);
                this._component.emit(new Event("input", DEFAULT_EVENT_INIT_DICT));
                this._component.emit(new Event("change", DEFAULT_EVENT_INIT_DICT));
            }
        });
    }

    /**
     * Alternative property to 'Input' for accessing the contained radio button with a descriptive
     * name.
     */
    public get RadioButton(): RadioButton {
        return this._component;
    }

    /**
     * Access the internal `RadioButton` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `RadioButton` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    public radioButton(cb: (radioButton: RadioButton, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Get/set the checked state of the radio button (re-exported for easier direct access).
     */
    public get Checked(): boolean {
        return this._component.Checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this._component.Checked = v;
    }

    /**
     * Set the the checked state of the radio button to checked/unchecked (re-exported for easier
     * direct access).
     * @param checked `true`, if the radio button should be checked, otherwise false.
     * @returns This instance.
     */
    public checked(checked: boolean): this {
        this._component.Checked = checked;
        return this;
    }

    /**
     * Allow toggling the radio button state (re-exported for easier direct access).
     */
    public get Toggle(): boolean {
        return this._component.Toggle;
    }
    /** @inheritdoc */
    public set Toggle(v: boolean) {
        this._component.Toggle = v;
    }

    /**
     * Allow or disallow toggling the radio button state (re-exported for easier direct access).
     * @param toggle `true`, if the radio button can be toggled, otherwise false.
     * @returns This instance.
     */
    public toggle(toggle: boolean): this {
        this._component.Toggle = toggle;
        return this;
    }
}

/**
 * Factory for `LabeledRadioButton` components.
 */
export class LabeledRadioButtonFactory<T> extends ComponentFactory<LabeledRadioButton> {
    /**
     * Create, set up and return LabeledRadioButton component.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the radio button element. If `id` is `undefined` or omitted,
     * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the radio button element.
     * @param name The `name` attribute of the radio button element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses/toggles the radio button element (a unique ID
     *   has been set automatically on the radio button element), if `lblAction` is `false`,
     *   clicking on the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the radio button element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButton component.
     */
    public labeledRadioButton(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledRadioButton {
        return this.setupComponent(new LabeledRadioButton(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}

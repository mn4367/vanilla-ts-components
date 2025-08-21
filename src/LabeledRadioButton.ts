import { CheckedEvent, ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { RadioButton } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/** Additional event(s) for `LabeledRadioButton`. */
export interface LabeledRadioButtonEventMap extends HTMLElementEventMap {
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
     * @param id The `id` attribute of the radio button input element.
     * @param value The value of the radio button input element.
     * @param name The `name` attribute of the radio button input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the radio button input element (if toggling is enabled), if `labelAction` is `false`,
     *   clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition ?? LabelPosition.END, lblAlignment, labelAction);
        this.component = new RadioButton(id, value, name)
            // Forward this event to make handling of the component easier.
            .on("checked", (ev) => {
                // ev.preventDefault();
                ev.stopImmediatePropagation();
                this.emit(new CheckedEvent("checked", this, { Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
            });
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component)
            : this.ui.insert(0, this.component);
    }

    /**
     * Alternative property to 'Input' for accessing the contained radio button with a descriptive
     * name.
     */
    public get RadioButton(): RadioButton {
        return this.component;
    }

    /**
     * Get/set the checked state of the radio button (re-exported for easier direct access).
     */
    public get Checked(): boolean {
        return this.component.Checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this.component.Checked = v;
    }

    /**
     * Set the the checked state of the radio button to checked/unchecked (re-exported for easier
     * direct access).
     * @param checked `true`, if the radio button should be checked, otherwise false.
     * @returns This instance.
     */
    public checked(checked: boolean): this {
        this.component.Checked = checked;
        return this;
    }

    /**
     * Allow toggling the radio button state (re-exported for easier direct access).
     */
    public get Toggle(): boolean {
        return this.component.Toggle;
    }
    /** @inheritdoc */
    public set Toggle(v: boolean) {
        this.component.Toggle = v;
    }

    /**
     * Allow or disallow toggling the radio button state (re-exported for easier direct access).
     * @param toggle `true`, if the radio button can be toggled, otherwise false.
     * @returns This instance.
     */
    public toggle(toggle: boolean): this {
        this.component.Toggle = toggle;
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
     * @param id The `id` attribute of the radio button input element.
     * @param value The value of the radio button input element.
     * @param name The `name` attribute of the radio button input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the radio button input element (if toggling is enabled), if `labelAction` is `false`,
     *   clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButton component.
     */
    public labeledRadioButton(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledRadioButton {
        return this.setupComponent(new LabeledRadioButton(labelPhrase, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}

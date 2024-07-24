import { ACustomComponentEvent, ComponentFactory, NullableString } from "@vanilla-ts/core";
import { RadioButton, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";
import { LabeledRadioButton } from "./LabeledRadioButton.js";


/**
 * An array of data to be passed to the constructor of `LabeledRadioButtonGroup`.
 */
export interface LabeledRadioButtons extends Array<{
    /** The label text to be displayed for a radio button. */
    Label: string;
    /** The `id` attribute of a radio button. */
    ID: string;
    /** The value of a radio button. */
    Value: string;
    /** The label position of a radio button. */
    LabelPosition?: LabelPosition;
    /** The label alignmnent of a radio button. */
    LabelAlignment?: LabelAlignment;
}> { }

/**
 * Custom 'checked' event for radio button group.
 */
export class CheckedEvent<D extends object = {
    /** The radio button which is checked/unchecked. */
    RadioButton: RadioButton;
    /** `true`, if the radio button is checked, otherwise `false`. */
    Checked: boolean;
}> extends ACustomComponentEvent<"checked", LabeledRadioButtonGroup, D> { }

/**
 * Additional event(s) for `LabeledRadioButtonGroup`.
 */
export interface LabeledRadioButtonGroupEventMap extends HTMLElementEventMap {
    /** A radio button in a radio button group has been checked/uncheked. */
    "checked": CheckedEvent;
}

/**
 * Labeled radio button group component.
 */
export class LabeledRadioButtonGroup extends LabeledComponent<Span, LabeledRadioButtonGroupEventMap> {
    protected _name: string;
    protected _toggle: boolean;

    /**
     * Builds the labeled radio button group component.
     * @param labelText The label text for the LabeledRadioButtonGroup component.
     * @param name The `name` property for all radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param items An array of radio button data used to create the buttons.
     */
    constructor(labelText: string, name: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, ...items: LabeledRadioButtons) {
        super("div", lblPosition, lblAlignment);
        this._name = name;
        this.append(
            this.label = new Span(labelText),
            ...items.map(item => {
                const lrb = new LabeledRadioButton(
                    item.Label,
                    item.ID,
                    item.Value,
                    this._name,
                    undefined,
                    item.LabelPosition,
                    item.LabelAlignment
                );
                lrb.RadioButton.on("checked", (ev) => {
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                    this._dom.dispatchEvent(new CheckedEvent("checked", this, { RadioButton: lrb, Checked: ev.detail.Checked })); // eslint-disable-line jsdoc/require-jsdoc
                });
                return lrb;
            })
        );
    }

    /**
     * Get an array of all contained labeled radio buttons (buttons only). Modifying this array has
     * no effect on the internal list of radio buttons.
     */
    public get RadioButtons(): LabeledRadioButton[] {
        return this._children.filter(e => e instanceof LabeledRadioButton);
    }

    /**
     * Gets/sets the value of this radio button group. For `get` this is the value of the first
     * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
     * it is found, its status is set to checked.
     */
    public get Value(): string {
        for (const item of this._children) {
            if ((item instanceof LabeledRadioButton) && (item.Checked)) {
                return item.Value;
            }
        }
        return "";
    }
    /** @inheritdoc */
    public set Value(v: NullableString) {
        this.value(v);
    }

    /**
     * Set the value of this radio button group.
     * @param v The value to be set.
     * @see Property `Value`.
     * @returns This instance.
     */
    public value(v: NullableString): this {
        if (v === null) {
            for (const item of this._children) {
                if (item instanceof LabeledRadioButton) {
                    item.Checked = false;
                    break;
                }
            }
        } else {
            for (const item of this._children) {
                if ((item instanceof LabeledRadioButton) && (item.Value === v)) {
                    item.Checked = true;
                    break;
                }
            }
        }
        return this;
    }

    /**
     * Allow toggling the radio button state of all contained radio buttons.
     */
    public get Toggle(): boolean {
        return this._toggle;
    }
    /** @inheritdoc */
    public set Toggle(v: boolean) {
        this.toggle(v);
    }

    /**
     * Allow or disallow toggling the radio button state of all contained radio buttons.
     * @param toggle `true`, if the radio buttons can be toggled, otherwise false.
     * @returns This instance.
     */
    public toggle(toggle: boolean): this {
        this._toggle = toggle;
        for (const item of this._children) {
            if (item instanceof LabeledRadioButton) {
                item.RadioButton.toggle(toggle);
            }
        }
        return this;
    }
}

/**
 * Factory for LabeledRadioButtonGroup components.
 */
export class LabeledRadioButtonGroupFactory<T> extends ComponentFactory<LabeledRadioButtonGroup> {
    /**
     * Create, set up and return LabeledRadioButtonGroup component.
     * @param labelText The label text for the LabeledRadioButtonGroup component.
     * @param name The `name` property for all radio buttons.
     * @param items An array of data used to create radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButtonGroup component.
     */
    public labeledRadioButtonGroup(labelText: string, name: string, items: LabeledRadioButtons, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledRadioButtonGroup {
        return this.setupComponent(new LabeledRadioButtonGroup(labelText, name, lblPosition, lblAlignment, ...items), data);
    }
}

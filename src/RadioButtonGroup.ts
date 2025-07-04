import { AElementComponentWithInternalUI, CheckedEvent, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { Div, RadioButton } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledRadioButton } from "./LabeledRadioButton.js";


/**
 * An array of data to be passed to the constructor of `RadioButtonGroup`.
 */
export interface LabeledRadioButtons extends Array<{
    /** The phrasing content for the label of a radio button. */
    Label: Phrase | Phrases;
    /** The `id` attribute of a radio button. */
    ID: string;
    /** The value of a radio button. */
    Value: string;
    /** The label position of a radio button. */
    LabelPosition?: LabelPosition;
    /** The label alignmnent of a radio button. */
    LabelAlignment?: LabelAlignment;
}> { }

/** Custom 'checked' event for radio button group. */
export interface RadioButtonGroupEventMap extends HTMLElementEventMap {
    /** A radio button in a radio button group has been checked/uncheked. */
    "checked": CheckedEvent<RadioButton, {
        /** The radio button which is checked/unchecked. */
        RadioButton: RadioButton;
        /** `true`, if the radio button is checked, otherwise `false`. */
        Checked: boolean;
    }>;
}

/**
 * Alignment of the radio buttons.
 */
export enum RadioButtonGroupAlignment {
    HORIZONTAL = 1,
    VERTICAL
}

/**
 * A component that holds a group of labeled radio buttons inside a `<div>` container.
 */
export class RadioButtonGroup<EventMap extends RadioButtonGroupEventMap = RadioButtonGroupEventMap> extends AElementComponentWithInternalUI<Div, EventMap> {
    protected radioButtons: LabeledRadioButton[];
    protected _alignment: RadioButtonGroupAlignment;
    protected _toggle: boolean;

    /**
     * Create RadioButtonGroup component.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param alignment The alignment of the labeled radio buttons.
     */
    constructor(radioButtons: LabeledRadioButtons, name: string, alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL) {
        super();
        super.initialize(undefined, radioButtons, name, alignment);
    }

    /**
     * Get an array of all contained labeled radio buttons (as a copy).
     */
    public get RadioButtons(): LabeledRadioButton[] {
        return this.radioButtons.slice();
    }

    /**
     * Gets/sets the value of this radio button group. For `get` this is the value of the first
     * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
     * it is found, its status is set to checked.
     */
    public get Value(): string {
        for (const radioButton of this.radioButtons) {
            if (radioButton.Checked) {
                return radioButton.Value;
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
     * @see {@link RadioButtonGroup.Value}.
     * @returns This instance.
     */
    public value(v: NullableString): this {
        for (const radioButton of this.radioButtons) {
            radioButton.checked(false);
        }
        if (v !== null) {
            for (const radioButton of this.radioButtons) {
                if (radioButton.Value === v) {
                    radioButton.checked(true);
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
        if (toggle !== this._toggle) {
            this._toggle = toggle;
            for (const radioButton of this.radioButtons) {
                radioButton.RadioButton.toggle(toggle);
            }
        }
        return this;
    }

    /**
     * Gets/sets the alignment of the contained labeled radio buttons.
     */
    public get Alignment(): RadioButtonGroupAlignment {
        return this._alignment;
    }
    /** @inheritdoc */
    public set Alignment(v: RadioButtonGroupAlignment) {
        this.alignment(v);
    }

    /**
     * Sets the alignment of the contained labeled radio buttons.
     * @param alignment The alignment of the labeled radio buttons.
     * @returns This instance.
     */
    public alignment(alignment: RadioButtonGroupAlignment): this {
        if (alignment !== this._alignment) {
            this._alignment = alignment;
            this._alignment === RadioButtonGroupAlignment.VERTICAL
                ? this.replaceClass("horizontal", "vertical")
                : this.replaceClass("vertical", "horizontal");
        }
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(radioButtons: LabeledRadioButtons, name: string, alignment: RadioButtonGroupAlignment): this {
        this.radioButtons = radioButtons.map(item => {
            const lrb = new LabeledRadioButton(
                item.Label,
                item.ID,
                item.Value,
                name,
                item.LabelPosition,
                item.LabelAlignment,
                undefined
            ).addClass(LabeledRadioButton.DefaultCSSClassName);
            lrb.RadioButton.on("input", (ev) => {
                // ev.preventDefault();
                ev.stopImmediatePropagation();
                this.emit(new Event("input", ev));
            });
            lrb.RadioButton.on("change", (ev) => {
                // ev.preventDefault();
                ev.stopImmediatePropagation();
                this.emit(new Event("change", ev));
            });
            lrb.RadioButton.on("checked", (ev) => {
                // ev.preventDefault();
                ev.stopImmediatePropagation();
                this.emit(new CheckedEvent("checked", this, { RadioButton: lrb, Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
            });
            return lrb;
        });
        this._alignment = alignment;
        this.ui = new Div()
            .addClass(this._alignment === RadioButtonGroupAlignment.VERTICAL ? "vertical" : "horizontal")
            .append(...this.radioButtons);
        return this;
    }

    /** @inheritdoc */
    public override focus(options?: FocusOptions): this {
        (this.radioButtons.find(e => e.Checked) || this.radioButtons[0]).focus(options);
        return this;
    }

    /** @inheritdoc */
    public override blur(): this {
        (this.radioButtons.find(e => e.Checked) || this.radioButtons[0]).blur();
        return this;
    }
}

/**
 * Factory for RadioButtonGroup components.
 */
export class RadioButtonGroupFactory<T> extends ComponentFactory<RadioButtonGroup> {
    /**
     * Create, set up and return RadioButtonGroup component.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param alignment The alignment of the labeled radio buttons.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns RadioButtonGroup component.
     */
    public radioButtonGroup(radioButtons: LabeledRadioButtons, name: string, alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL, data?: T): RadioButtonGroup {
        return this.setupComponent(new RadioButtonGroup(radioButtons, name, alignment), data);
    }
}

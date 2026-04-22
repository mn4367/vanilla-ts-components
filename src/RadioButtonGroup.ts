import { AElementComponentWithInternalUI, CheckedEvent, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponents.js";
import { LabeledRadioButton } from "./LabeledRadioButton.js";


/**
 * An array of data to be passed to the constructor of `RadioButtonGroup`.
 */
export type LabeledRadioButtons = Array<{
    /** The phrasing content for the label of a radio button. */
    Label: Phrase | Phrases;
    /**
     * The `id` attribute of a radio button. If `ID` is `undefined` or omitted, a unique ID will be
     * generated. If `ID` is explicitely set to `null` or an empty string, no id attribute will be
     * set. Any other value will be used as the id attribute.
     */
    ID?: NullableString;
    /** The value of a radio button. */
    Value: string;
}>;

/** Custom 'checked' event for a radio button group. */
export interface RadioButtonGroupEventMap extends HTMLElementEventMap {
    /** A radio button in a radio button group has been checked/uncheked. */
    "checked": CheckedEvent<RadioButtonGroup, {
        /** The labeled radio button which is checked/unchecked. */
        LabeledRadioButton: LabeledRadioButton;
        /** `true`, if the labeled radio button is checked, otherwise `false`. */
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
    protected _labeledRadioButtons: LabeledRadioButton[] = [];
    protected _name: string;
    protected _alignment: RadioButtonGroupAlignment;
    protected _labelPosition: LabelPosition = LabelPosition.END;
    protected _labelAlignment: LabelAlignment = LabelAlignment.START;
    protected _toggle: boolean;

    /**
     * Create RadioButtonGroup component.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param alignment The alignment of the labeled radio buttons.\
     * Default: {@link RadioButtonGroupAlignment.VERTICAL}.
     * @param labelPosition The position of the label of the radio buttons.\
     * Default: {@link LabelPosition.END}.
     * @param labelAlignment The alignment of the label of the radio buttons.\
     * Default: {@link LabelAlignment.START}.
     */
    constructor(
        radioButtons: LabeledRadioButtons,
        name: string,
        alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL,
        labelPosition: LabelPosition = LabelPosition.END,
        labelAlignment: LabelAlignment = LabelAlignment.START
    ) {
        super();
        this._name = name;
        super
            .initialize()
            .alignment(alignment)
            .labelPosition(labelPosition)
            .labelAlignment(labelAlignment)
            .radioButtons(radioButtons, name);
    }

    /**
     * Get an array of all contained labeled radio button components. Modifying this array has no
     * effect.\
     * __Note:__ The internal radio button component (property `RadioButton`/`Component`) of each
     * labeled radio button will never fire the event `checked`. Instead, listening for this event
     * must be done on the radio button group instance itself.
     */
    public get LabeledRadioButtons(): LabeledRadioButton[] {
        return this._labeledRadioButtons.slice();
    }

    /**
     * Set the radio buttons of this group.\
     * __Note:__ Setting new radio buttons clears the internal list of radio buttons and also
     * disposes of all previously contained radio buttons, so instances of radio buttons obtained
     * before with the getter `RadioButtons` are unusable after this operation!
     * @param radioButtons The radio buttons to be set.
     * @param name The `name` property for all radio buttons.
     * @param keepValue If `true`, the previous value of the radio button group will be restored (if
     * possible).
     * @returns This instance.
     */
    public radioButtons(radioButtons: LabeledRadioButtons, name: string, keepValue?: boolean): this {
        const oldValue = this.Value;
        this.ui.remove();
        for (const rb of this._labeledRadioButtons) {
            rb.dispose();
        }
        this._name = name;
        this._labeledRadioButtons.length = 0;
        this._labeledRadioButtons.push(
            ...radioButtons.map(item => {
                const lrb = new LabeledRadioButton(
                    item.Label,
                    item.ID,
                    item.Value,
                    this._name,
                    this._labelPosition,
                    this._labelAlignment,
                    undefined
                )
                    .parentDisabled(this.Disabled)
                    .addClass(LabeledRadioButton.DefaultCSSClassName);
                // Listen on `lrb` instead of `lrb.RadioButton` for `checked`. The internal radio
                // button component does not fire this event (propagation is stopped there).
                lrb.on("checked", (ev) => {
                    ev.stopImmediatePropagation();
                    this.emit(new CheckedEvent("checked", this, { LabeledRadioButton: lrb, Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
                });
                return lrb;
            })
        );
        keepValue && oldValue && this.value(oldValue);
        this.ui.append(...this._labeledRadioButtons);
        return this;
    }

    /**
     * Get/set `name` attribute value of the component. Internally the setter sets the `name`
     * attribute on all contained radio buttons. `null` or an empty string removes the attribute.
     */
    public get Name(): string {
        return this._name;
    }
    /** @inheritdoc */
    public set Name(v: NullableString) {
        this.name(v);
    }

    /**
     * Set `name` attribute value of this radio button group. Internally this sets the `name`
     * attribute on all contained radio buttons.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    public name(v: NullableString): this {
        for (const rb of this._labeledRadioButtons) {
            rb.RadioButton.name(v);
        }
        return this;
    }

    /**
     * Gets/sets the value of this radio button group. For `get` this is the value of the first
     * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
     * it is found, its status is set to checked.
     */
    public get Value(): string {
        for (const radioButton of this._labeledRadioButtons) {
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
        for (const radioButton of this._labeledRadioButtons) {
            radioButton.checked(false);
        }
        if (v !== null) {
            for (const radioButton of this._labeledRadioButtons) {
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
            for (const radioButton of this._labeledRadioButtons) {
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
                ? this.removeClass("horizontal").addClass("vertical")
                : this.removeClass("vertical").addClass("horizontal");
        }
        return this;
    }

    /**
     * Gets/sets the label position of the contained labeled radio buttons.
     */
    public get LabelPosition(): LabelPosition {
        return this._labelPosition;
    }
    /** @inheritdoc */
    public set LabelPosition(v: LabelPosition) {
        this.labelPosition(v);
    }

    /**
     * Sets the label position of the contained labeled radio buttons.
     * @param labelPosition The label position of the labeled radio buttons.
     * @returns This instance.
     */
    public labelPosition(labelPosition: LabelPosition): this {
        if (labelPosition !== this._labelPosition) {
            this._labelPosition = labelPosition;
            for (const radioButton of this._labeledRadioButtons) {
                radioButton.labelPosition(labelPosition);
            }
        }
        return this;
    }

    /**
     * Gets/sets the label alignment of the contained labeled radio buttons.
     */
    public get LabelAlignment(): LabelAlignment {
        return this._labelAlignment;
    }
    /** @inheritdoc */
    public set LabelAlignment(v: LabelAlignment) {
        this.labelAlignment(v);
    }

    /**
     * Sets the label alignment of the contained labeled radio buttons.
     * @param labelAlignment The label alignment of the labeled radio buttons.
     * @returns This instance.
     */
    public labelAlignment(labelAlignment: LabelAlignment): this {
        if (labelAlignment !== this._labelAlignment) {
            this._labelAlignment = labelAlignment;
            for (const radioButton of this._labeledRadioButtons) {
                radioButton.labelAlignment(labelAlignment);
            }
        }
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Div();
        return this;
    }

    /** @inheritdoc */
    public override focus(options?: FocusOptions): this {
        (this._labeledRadioButtons.find(e => e.Checked) || this._labeledRadioButtons[0])?.focus(options);
        return this;
    }

    /** @inheritdoc */
    public override blur(): this {
        (this._labeledRadioButtons.find(e => e.Checked) || this._labeledRadioButtons[0])?.blur();
        return this;
    }
}

/**
 * Factory for `RadioButtonGroup` components.
 */
export class RadioButtonGroupFactory<T> extends ComponentFactory<RadioButtonGroup> {
    /**
     * Create, set up and return RadioButtonGroup component.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param alignment The alignment of the labeled radio buttons.\
     * Default: {@link RadioButtonGroupAlignment.VERTICAL}.
     * @param labelPosition The position of the label of the radio buttons.\
     * Default: {@link LabelPosition.END}.
     * @param labelAlignment The alignment of the label of the radio buttons.\
     * Default: {@link LabelAlignment.START}.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns RadioButtonGroup component.
     */
    public radioButtonGroup(
        radioButtons: LabeledRadioButtons,
        name: string,
        alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL,
        labelPosition: LabelPosition = LabelPosition.END,
        labelAlignment: LabelAlignment = LabelAlignment.START,
        data?: T
    ): RadioButtonGroup {
        return this.setupComponent(new RadioButtonGroup(radioButtons, name, alignment, labelPosition, labelAlignment), data);
    }
}

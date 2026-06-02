import { CheckedEvent, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { LabelAlignment, LabelPosition, LabeledComponentGroup } from "./LabeledComponents.js";
import { LabeledRadioButton } from "./LabeledRadioButton.js";
import { LabeledRadioButtons, RadioButtonGroup, RadioButtonGroupAlignment } from "./RadioButtonGroup.js";


/** Custom 'checked' event for a radio button group. */
export interface LabeledRadioButtonGroupEventMap extends HTMLElementEventMap {
    /** A radio button in a radio button group has been checked/uncheked. */
    "checked": CheckedEvent<LabeledRadioButtonGroup, {
        /** The labeled radio button which is checked/unchecked. */
        LabeledRadioButton: LabeledRadioButton;
        /** `true`, if the labeled radio button is checked, otherwise `false`. */
        Checked: boolean;
    }>;
}

/**
 * Labeled radio button group component.
 */
export class LabeledRadioButtonGroup<EventMap extends LabeledRadioButtonGroupEventMap = LabeledRadioButtonGroupEventMap> extends LabeledComponentGroup<RadioButtonGroup, EventMap> {
    /**
     * Create LabeledRadioButtonGroup component.
     * @param labelPhrase The phrasing content for the label.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param alignment The alignment of the labeled radio buttons.
     */
    constructor(
        labelPhrase: Phrase | Phrases,
        radioButtons: LabeledRadioButtons,
        name: string,
        lblPosition: LabelPosition = LabelPosition.TOP,
        lblAlignment: LabelAlignment = LabelAlignment.START,
        alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL
    ) {
        super(labelPhrase, lblPosition, lblAlignment);
        // !! Mandatory.
        this.setContent(new RadioButtonGroup(radioButtons, name, alignment).addClass(RadioButtonGroup.DefaultCSSClassName));
        // Reshape this event to the correct sender (this).
        this._component.on("checked", (ev) => {
            ev.stopImmediatePropagation();
            this.emit(new CheckedEvent("checked", this, { LabeledRadioButton: ev.$.LabeledRadioButton, Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
        });

    }

    /**
     * Get the internal radio button group component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get RadioButtonGroup(): RadioButtonGroup {
        return this._component;
    }

    /**
     * Access the internal `RadioButtonGroup` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `RadioButtonGroup` component instance
     * and this instance as parameters.
     * @returns This instance.
     */
    public radioButtonGroup(cb: (radioButtonGroup: RadioButtonGroup, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Get an array of all contained labeled radio buttons (as a copy). Also available via
     * `RadioButtonGroup`, re-exported here for convenience.
     * __Note:__ The internal radio button component (property `RadioButton`/`Component`) of each
     * labeled radio button will never fire the event `checked`. Instead, listening for this event
     * must be done on the labeled radio button group instance itself.
     */
    public get LabeledRadioButtons(): LabeledRadioButton[] {
        return this._component.LabeledRadioButtons;
    }

    /**
     * Get/set `name` attribute value of the component. Internally the setter sets the `name`
     * attribute on all contained radio buttons. `null` or an empty string removes the attribute.
     * Equivalent to get/set `<instance>.RadioButtonGroup.Name`.
     */
    public get Name(): string {
        return this._component.Name;
    }
    /** @inheritdoc */
    public set Name(v: NullableString) {
        this.name(v);
    }

    /**
     * Set `name` attribute value of this radio button group. Internally this sets the `name`
     * attribute on all contained radio buttons. Equivalent to `<instance>.RadioButtonGroup.name()`.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    public name(v: NullableString): this {
        this._component.name(v);
        return this;
    }

    /**
     * Gets/sets the value of this radio button group. For `get` this is the value of the first
     * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
     * it is found, its status is set to checked. Also available via `RadioButtonGroup`, re-exported
     * here for convenience.
     */
    public get Value(): string {
        return this._component.Value;
    }
    /** @inheritdoc */
    public set Value(v: NullableString) {
        this._component.value(v);
    }

    /**
     * Set the value of this radio button group. Also available via `RadioButtonGroup`, re-exported
     * here for convenience.
     * @param v The value to be set.
     * @see {@link LabeledRadioButtonGroup.Value}
     * @returns This instance.
     */
    public value(v: NullableString): this {
        this._component.value(v);
        return this;
    }

    /**
     * Allow toggling the radio button state of all contained radio buttons. Also available via
     * `RadioButtonGroup`, re-exported here for convenience.
     */
    public get Toggle(): boolean {
        return this._component.Toggle;
    }
    /** @inheritdoc */
    public set Toggle(v: boolean) {
        this._component.toggle(v);
    }

    /**
     * Allow or disallow toggling the radio button state of all contained radio buttons. Also
     * available via `RadioButtonGroup`, re-exported here for convenience.
     * @param toggle `true`, if the radio buttons can be toggled, otherwise false.
     * @returns This instance.
     */
    public toggle(toggle: boolean): this {
        this._component.toggle(toggle);
        return this;
    }

    /** @inheritdoc */
    public override focus(options?: FocusOptions): this {
        this._component.focus(options);
        return this;
    }

    /** @inheritdoc */
    public override blur(): this {
        this._component.blur();
        return this;
    }
}

/**
 * Factory for `LabeledRadioButtonGroup` components.
 */
export class LabeledRadioButtonGroupFactory<T> extends ComponentFactory<LabeledRadioButtonGroup> {
    /**
     * Create, set up and return LabeledRadioButtonGroup component.
     * @param labelPhrase The phrasing content for the label.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param alignment The alignment of the labeled radio buttons.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButtonGroup component.
     */
    public labeledRadioButtonGroup(
        labelPhrase: Phrase | Phrases,
        radioButtons: LabeledRadioButtons,
        name: string,
        lblPosition: LabelPosition = LabelPosition.TOP,
        lblAlignment: LabelAlignment = LabelAlignment.START,
        alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL,
        data?: T
    ): LabeledRadioButtonGroup {
        return this.setupComponent(new LabeledRadioButtonGroup(labelPhrase, radioButtons, name, lblPosition, lblAlignment, alignment), data);
    }
}

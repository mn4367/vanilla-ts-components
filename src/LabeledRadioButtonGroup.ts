import { ComponentFactory, NullableString, Phrase } from "@vanilla-ts/core";
import { Div, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";
import { LabeledRadioButton } from "./LabeledRadioButton.js";
import { LabeledRadioButtons, RadioButtonGroup, RadioButtonGroupAlignment, RadioButtonGroupEventMap } from "./RadioButtonGroup.js";


/**
 * Labeled radio button group component.
 */
export class LabeledRadioButtonGroup<EventMap extends RadioButtonGroupEventMap = RadioButtonGroupEventMap> extends LabeledComponent<Span, RadioButtonGroup, EventMap> {
    /**
     * Create LabeledRadioButtonGroup component.
     * @param labelPhrase The phrasing content for the label.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param alignment The alignment of the labeled radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrase[], radioButtons: LabeledRadioButtons, name: string, alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
        this.initialize(undefined, radioButtons, name, alignment);
    }

    /**
     * Get the internal radio button group component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get RadioButtonGroup(): RadioButtonGroup {
        return this.component;
    }

    /**
     * Get an array of all contained labeled radio buttons (as a copy). Also available via
     * `RadioButtonGroup`, re-exported here for convenience.
     */
    public get RadioButtons(): LabeledRadioButton[] {
        return this.component.RadioButtons;
    }

    /**
     * Gets/sets the value of this radio button group. For `get` this is the value of the first
     * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
     * it is found, its status is set to checked. Also available via `RadioButtonGroup`, re-exported
     * here for convenience.
     */
    public get Value(): string {
        return this.component.Value;
    }
    /** @inheritdoc */
    public set Value(v: NullableString) {
        this.component.value(v);
    }

    /**
     * Set the value of this radio button group. Also available via `RadioButtonGroup`, re-exported
     * here for convenience.
     * @param v The value to be set.
     * @see Property `Value`.
     * @returns This instance.
     */
    public value(v: NullableString): this {
        this.component.value(v);
        return this;
    }

    /**
     * Allow toggling the radio button state of all contained radio buttons. Also available via
     * `RadioButtonGroup`, re-exported here for convenience.
     */
    public get Toggle(): boolean {
        return this.component.Toggle;
    }
    /** @inheritdoc */
    public set Toggle(v: boolean) {
        this.component.toggle(v);
    }

    /**
     * Allow or disallow toggling the radio button state of all contained radio buttons. Also
     * available via `RadioButtonGroup`, re-exported here for convenience.
     * @param toggle `true`, if the radio buttons can be toggled, otherwise false.
     * @returns This instance.
     */
    public toggle(toggle: boolean): this {
        this.component.toggle(toggle);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(radioButtons: LabeledRadioButtons, name: string, alignment: RadioButtonGroupAlignment): this {
        this.component = new RadioButtonGroup(radioButtons, name, alignment)
            .addClass(RadioButtonGroup.DefaultCSSClassName);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label = new Span(),
                    this.component
                )
            : this.ui = new Div()
                .append(
                    this.component,
                    this.label = new Span()
                );
        return this;
    }
}

/**
 * Factory for LabeledRadioButtonGroup components.
 */
export class LabeledRadioButtonGroupFactory<T> extends ComponentFactory<LabeledRadioButtonGroup> {
    /**
     * Create, set up and return LabeledRadioButtonGroup component.
     * @param labelPhrase The phrasing content for the label.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param alignment The alignment of the labeled radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButtonGroup component.
     */
    public labeledRadioButtonGroup(labelPhrase: Phrase | Phrase[], radioButtons: LabeledRadioButtons, name: string, alignment: RadioButtonGroupAlignment = RadioButtonGroupAlignment.VERTICAL, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledRadioButtonGroup {
        return this.setupComponent(new LabeledRadioButtonGroup(labelPhrase, radioButtons, name, alignment, lblPosition, lblAlignment), data);
    }
}

import { CheckedEvent, ComponentFactory, NullableString, Phrase } from "@vanilla-ts/core";
import { Div, RadioButton, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";
import { LabeledRadioButton } from "./LabeledRadioButton.js";


/**
 * An array of data to be passed to the constructor of `LabeledRadioButtonGroup`.
 */
export interface LabeledRadioButtons extends Array<{
    /** The phrasing content for the label of a radio button. */
    Label: Phrase | Phrase[];
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
export interface LabeledRadioButtonGroupEventMap extends HTMLElementEventMap {
    /** A radio button in a radio button group has been checked/uncheked. */
    "checked": CheckedEvent<RadioButton, {
        /** The radio button which is checked/unchecked. */
        RadioButton: RadioButton;
        /** `true`, if the radio button is checked, otherwise `false`. */
        Checked: boolean;
    }>;
}

/**
 * Labeled radio button group component.
 */
export class LabeledRadioButtonGroup<EventMap extends LabeledRadioButtonGroupEventMap = LabeledRadioButtonGroupEventMap> extends LabeledComponent<Span, Div, EventMap> {
    #rbContainer: Div;
    #radioButtons: LabeledRadioButton[];
    #toggle: boolean;

    /**
     * Create LabeledRadioButtonGroup component.
     * @param labelPhrase The phrasing content for the label.
     * @param radioButtons An array of radio button data used to create the buttons.
     * @param name The `name` property for all radio buttons.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrase[], radioButtons: LabeledRadioButtons, name: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
        this.initialize(undefined, radioButtons, name);
    }

    /**
     * Get an array of all contained labeled radio buttons (as a copy).
     */
    public get RadioButtons(): LabeledRadioButton[] {
        return this.#radioButtons.slice();
    }

    /**
     * Get the container which contains all labeled radio buttons.
     */
    public get RadioButtonsContainer(): Div {
        return this.#rbContainer;
    }

    /**
     * Gets/sets the value of this radio button group. For `get` this is the value of the first
     * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
     * it is found, its status is set to checked.
     */
    public get Value(): string {
        for (const radioButton of this.#radioButtons) {
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
     * @see Property `Value`.
     * @returns This instance.
     */
    public value(v: NullableString): this {
        if (v === null) {
            for (const radioButton of this.#radioButtons) {
                radioButton.checked(false);
            }
        } else {
            for (const radioButton of this.#radioButtons) {
                radioButton.checked(false);
            }
            for (const radioButton of this.#radioButtons) {
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
        return this.#toggle;
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
        this.#toggle = toggle;
        for (const radioButton of this.#radioButtons) {
            radioButton.RadioButton.toggle(toggle);
        }
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(radioButtons: LabeledRadioButtons, name: string): this {
        this.#radioButtons = radioButtons.map(item => {
            const lrb = new LabeledRadioButton(
                item.Label,
                item.ID,
                item.Value,
                name,
                item.LabelPosition,
                item.LabelAlignment,
                undefined
            );
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
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label = new Span(),
                    this.#rbContainer = new Div()
                        .addClass("radio-buttons")
                        .append(...this.#radioButtons)
                )
            : this.ui = new Div()
                .append(
                    this.#rbContainer = new Div()
                        .addClass("radio-buttons")
                        .append(...this.#radioButtons),
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
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButtonGroup component.
     */
    public labeledRadioButtonGroup(labelPhrase: Phrase | Phrase[], radioButtons: LabeledRadioButtons, name: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledRadioButtonGroup {
        return this.setupComponent(new LabeledRadioButtonGroup(labelPhrase, radioButtons, name, lblPosition, lblAlignment), data);
    }
}

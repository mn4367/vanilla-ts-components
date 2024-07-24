import { Phrase } from "@vanilla-ts/core";
import { Div, Input, Label } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Abstract class for building labeled input components, e.g. text inputs, checkboxes etc. that have
 * a descriptive label/caption.
 */
export abstract class LabeledInputComponent<I extends Input, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Label, I, EventMap> {
    /**
     * Create LabeledInputComponent component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the target input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label causes
     *   the corresponding action on the input element; if `labelAction` is `false`, clicking on
     *   the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrase[], id?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, lblPosition, lblAlignment);
        this.initialize(undefined, id, labelAction);
    }

    /**
     * Get/set the value of underlying HTML element (re-exported for easier direct access).\
     * __Notes:__
     * - For some input elements the value is the content of the `value` attribute, for others like
     *   `input="text"` there is no `value` attribute.
     * - The getter always returns a string, even if there is no `value` attribute. If, for example,
     *   an `input="checkbox"`has no `value` attribute, the result of the property `Value` is an
     *   empty string.
     * - The setter allows a string or `null` to be passed and uses `attrib()` internally, i.e. if
     *   `null` is set, the `value` attribute is removed. Setting `null` also works for input
     *   elements such as `input="text"` (no `value` attribute). Ultimately, this means that calling
     *   `<input>.value(null).value` always results in an empty string for all input types.
     * - The property `Value` must be overridden by input elements of type `image` since `value`
     *   isn't avaliable for this type, so using `Value` should do nothing.
     */
    public get Value(): string {
        return this.component.Value;
    }
    /** @inheritdoc */
    public set Value(v: string) {
        this.component.Value = v;
    }

    /**
     * Set the value of the underlying HTML element (re-exported for easier direct access).\
     * __Note:__ The property `Value` must be overridden by input elements of type `image` since
     * `value` isn't avaliable for this type, so using `value()` should do nothing.
     * @param v The value to be set.
     * @see Property `Value`.
     * @returns This instance.
     */
    public value(v: string): this {
        this.component.value(v);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(id?: string, labelAction?: boolean): this {
        this.ui = new Div()
            .append(
                this.label = new Label(
                    id && (labelAction === undefined || labelAction === true)
                        ? id
                        : undefined
                )
            );
        return this;
    }
}

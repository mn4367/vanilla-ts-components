import { Input, Label } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Abstract class for building labeled input components, e.g. text inputs, checkboxes etc. that have
 * a descriptive label/caption.
 */
export abstract class LabeledInputComponent<T extends Input> extends LabeledComponent<Label> {
    protected input: T;

    /**
     * Builds a labeled component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the target input component.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label causes
     *   the corresponding action on the input component; if `labelAction` is `false`, clicking on
     *   the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, id?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super("div", lblPosition, lblAlignment);
        this.append(
            this.label = new Label(
                labelText,
                id && (labelAction === undefined || labelAction === true)
                    ? id
                    : undefined
            ),
        );
    }

    /**
     * Get input component.
     */
    public get Input(): T {
        return this.input;
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
        return this.input.Value;
    }
    /** @inheritdoc */
    public set Value(v: string) {
        this.input.Value = v;
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
        this.input.value(v);
        return this;
    }
}

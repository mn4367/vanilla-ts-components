import { cid, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { TextArea } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithLabel, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled textarea component.
 */
export class LabeledTextArea<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponentWithLabel<TextArea, EventMap> {
    /**
     * Create LabeledTextArea component.
     * @param labelPhrase The phrasing content for the label.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the textarea element.
     * @param cols The visible width of the textarea element, in average character widths.
     * @param id The id (attribute) of the textarea element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param name The `name` attribute for the textarea element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the textarea element (a unique ID has been set
     *   automatically on the textarea element), if `lblAction` is `false`, clicking on the label
     *   does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the textarea element).
     */
    constructor(labelPhrase: Phrase | Phrases, text?: string, rows?: number, cols?: number, id?: NullableString, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new TextArea(text, rows, cols, _id, name),
            labelPhrase,
            _id,
            lblPosition ?? LabelPosition.TOP,
            lblAlignment,
            lblAction
        );
    }

    /**
     * Get TextArea component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get TextArea(): TextArea {
        return this._component;
    }

    /**
     * Access the internal `TextArea` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `TextArea` component instance and
     * this
     * instance as parameters.
     * @returns This instance.
     */
    public textArea(cb: (textArea: TextArea, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * __The property `Value` here is an alias for the property `this.TextArea.Value`.__
     */
    public get Value(): string {
        return this._component.DOM.value;
    }
    /** @inheritdoc */
    public set Value(v: string) {
        this._component.DOM.value = v;
    }

    /**
     * __The function `value()` here is an alias for the function `this.TextArea.value()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @param v The value to be set.
     * @returns This instance.
     */
    public value(v: string): this {
        this._component.DOM.value = v;
        return this;
    }

    /**
     * \
     * \
     * __The property `Text` here is an alias for the property `this.TextArea.Text`.__
     * @inheritdoc
     */
    public override get Text(): NullableString {
        return this._component.DOM.textContent;
    }
    /**
     * \
     * \
     * __The property `Text` here is an alias for the property `this.TextArea.Text`.__
     * @inheritdoc
     */
    public override set Text(v: NullableString) {
        this._component.DOM.textContent = v;
    }

    /**
     * \
     * \
     * __The function `text()` here is an alias for the function `this.TextArea.text()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @inheritdoc
     */
    public override text(text: NullableString): this {
        this._component.DOM.textContent = text;
        return this;
    }
}

/**
 * Factory for `LabeledTextArea` components.
 */
export class LabeledTextAreaFactory<T> extends ComponentFactory<LabeledTextArea> {
    /**
     * Create, set up and return LabeledTextArea component.
     * @param labelPhrase The phrasing content for the label.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the textarea element.
     * @param cols The visible width of the textarea element, in average character widths.
     * @param id The id (attribute) of the textarea element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param name The `name` attribute for the textarea element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the textarea element (a unique ID has been set
     *   automatically on the textarea element), if `lblAction` is `false`, clicking on the label
     *   does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the textarea element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextArea component.
     */
    public labeledTextArea(labelPhrase: Phrase | Phrases, text?: string, rows?: number, cols?: number, id?: NullableString, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledTextArea {
        return this.setupComponent(new LabeledTextArea(labelPhrase, text, rows, cols, id, name, lblPosition, lblAlignment, lblAction), data);
    }
}

import { ComponentFactory, NullableString, Phrase } from "@vanilla-ts/core";
import { Div, Label, TextArea } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled textarea component.
 */
export class LabeledTextArea<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Label, TextArea, EventMap> {
    /**
     * Create LabeledTextArea component.
     * @param labelPhrase The phrasing content for the label.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the textarea element.
     * @param cols The visible width of the textarea element, in average character widths.
     * @param id The `id` attribute for the textarea element.
     * @param name The `name` attribute for the textarea element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the textarea element, if `labelAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrase[], text?: string, rows?: number, cols?: number, id?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
        this.initialize(undefined, text, rows, cols, id, name, labelAction);
    }

    /**
     * Get TextArea component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get TextArea(): TextArea {
        return this.component;
    }

    /**
     * \
     * \
     * __The property `Text` here is an alias for the property `this.TextArea.Text`.__
     * @inheritdoc
     */
    public override get Text(): NullableString {
        return this.component.DOM.textContent;
    }
    /**
     * \
     * \
     * __The property `Text` here is an alias for the property `this.TextArea.Text`.__
     * @inheritdoc
     */
    public override set Text(v: NullableString) {
        this.component.DOM.textContent = v;
    }

    /**
     * \
     * \
     * __The function `text()` here is an alias for the function `this.TextArea.text()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @inheritdoc
     */
    public override text(text: NullableString): this {
        this.component.DOM.textContent = text;
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(text?: string, rows?: number, cols?: number, id?: string, name?: string, labelAction?: boolean): this {
        this.label = new Label(
            id && (labelAction === undefined || labelAction === true)
                ? id
                : undefined
        );
        this.component = new TextArea(text, rows, cols, id, name);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label,
                    this.component
                )
            : this.ui = new Div()
                .append(
                    this.component,
                    this.label
                );
        return this;
    }
}

/**
 * Factory for LabeledTextArea components.
 */
export class LabeledTextAreaFactory<T> extends ComponentFactory<LabeledTextArea> {
    /**
     * Create, set up and return LabeledTextArea component.
     * @param labelPhrase The phrasing content for the label.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the textarea element.
     * @param cols The visible width of the textarea element, in average character widths.
     * @param id The `id` attribute for the textarea element.
     * @param name The `name` attribute for the textarea element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the textarea element, if `labelAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextArea component.
     */
    public labeledTextArea(labelPhrase: Phrase | Phrase[], text?: string, rows?: number, cols?: number, id?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledTextArea {
        return this.setupComponent(new LabeledTextArea(labelPhrase, text, rows, cols, id, name, lblPosition, lblAlignment, labelAction), data);
    }
}

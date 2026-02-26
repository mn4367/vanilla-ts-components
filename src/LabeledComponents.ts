import { AElementComponentWithInternalUI, HTMLElementWithChildren, IElementComponent, IElementWithChildrenComponent, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { Div, Input, Label, Span } from "@vanilla-ts/dom";
import { LabeledContainer } from "./LabeledContainer.js";
import { LabeledRadioButtonGroup } from "./LabeledRadioButtonGroup.js";


/**
 * Position of the label.
 */
export enum LabelPosition {
    TOP = 1, // 1 because of `if (LabelPosition) ...`
    END,
    BOTTOM,
    START
}

/**
 * Alignment of the label.
 */
export enum LabelAlignment {
    START = 1, // 1 because of `if (LabelAlignment) ...`
    CENTER,
    END
}

/**
 * Abstract base class for building labeled components that have a descriptive label or span
 * element. The label element itself is a compoment (`Label` or `Span`) so it can be used to display
 * styled text with, for example, `Span`, `Em` and other components appended to it.
 */
export abstract class LabeledComponent<L extends (Label | Span), C extends IElementComponent<HTMLElement>, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<IElementWithChildrenComponent<HTMLElementWithChildren>, EventMap> {
    #initialized = false;
    protected label: L;
    // This member exists only to temporarily store the value given to the contructor to be
    // available in `initialize()`. It will be set to `undefined` again after `initialize()`.
    #labelPhrase?: Phrase | Phrases;
    protected lblPosition: LabelPosition;
    protected lblAlignment: LabelAlignment;
    protected component: C;

    /* The class name which should be set on the label/span of the labeled component. */
    static readonly LCLabelClassname: string = "lc-label";

    /* The class name which should be set on the component of the labeled component. */
    static readonly LCComponentClassname: string = "lc-component";

    /**
     * Create LabeledComponent component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrases, lblPosition: LabelPosition = LabelPosition.START, lblAlignment: LabelAlignment = LabelAlignment.START) {
        super();
        this.#labelPhrase = labelPhrase;
        this.lblPosition = lblPosition;
        this.lblAlignment = lblAlignment;
    }

    /** @inheritdoc */
    protected override initialize(mountUI?: boolean, ...args: Parameters<typeof this.buildUI>): this {
        super
            .initialize(mountUI, ...args) // eslint-disable-line @typescript-eslint/no-unsafe-argument
            .labelPosition(this.lblPosition)
            .labelAlignment(this.lblAlignment);
        Array.isArray(this.#labelPhrase)
            ? this.label.phrase(...this.#labelPhrase)
            : this.label.phrase(this.#labelPhrase!);
        this.#labelPhrase = undefined;
        this.#initialized = true;
        return this;
    }

    /**
     * Get component that is enclosed.
     */
    public get Component(): C {
        return this.component;
    }

    /**
     * Get label component.
     */
    public get Label(): L {
        return this.label;
    }

    /**
     * Set the phrasing content of the components label. __The setter `LabelPhrase` here is an alias
     * for the property `this.Label.Phrase`.__
     */
    public set LabelPhrase(phrase: Phrase | Phrases) {
        this.label.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components label. __The function `labelPhrase()` here is
     * an alias for the function `this.Label.phrase()` but it returns _this_ instance instead of the
     * 'Label' instance.__
     * @param phrase The phrasing content to be set for the label.
     * @returns This instance.
     */
    public labelPhrase(...phrase: Phrases): this {
        this.label.phrase(...phrase);
        return this;
    }

    /**
     * Set the phrasing content of the components label. __The setter `LabelRephrase` here is an
     * alias for the property `this.Label.Rephrase`.__
     */
    public set LabelRephrase(phrase: Phrase | Phrases) {
        this.label.Rephrase = phrase;
    }

    /**
     * Set the phrasing content of the the components label. __The function `labelRephrase()` here
     * is an alias for the function `this.Label.rephrase()` but it returns _this_ instance instead
     * of the 'Label' instance.__
     * @param phrase The phrasing content to be set for the label.
     * @returns This instance.
     */
    public labelRephrase(...phrase: Phrases): this {
        this.label.rephrase(...phrase);
        return this;
    }

    /**
     * Get/set the position of the label.
     */
    public get LabelPosition(): LabelPosition {
        return this.lblPosition;
    }
    /** @inheritdoc */
    public set LabelPosition(v: LabelPosition) {
        this.labelPosition(v);
    }

    /**
     * Set the position of the label.
     * @param v The position of the label.
     * @returns This instance.
     */
    public labelPosition(v: LabelPosition): this {
        if (this.#initialized && v === this.lblPosition) {
            return this;
        }
        this.lblPosition = v;
        this.removeClass("p-top", "p-end", "p-bottom", "p-start");
        switch (v) {
            case LabelPosition.TOP:
                this.ui.Children[0] !== this.label && this.ui.insert(0, this.label);
                this.addClass("p-top");
                break;
            case LabelPosition.END:
                this.ui.Children[1] !== this.label && this.ui.append(this.label);
                this.addClass("p-end");
                break;
            case LabelPosition.BOTTOM:
                this.ui.Children[1] !== this.label && this.ui.append(this.label);
                this.addClass("p-bottom");
                break;
            case LabelPosition.START:
                this.ui.Children[0] !== this.label && this.ui.insert(0, this.label);
                this.addClass("p-start");
                break;
        }
        return this;
    }

    /**
     * Get/set the alignment of the label.
     */
    public get LabelAlignment(): LabelAlignment {
        return this.lblAlignment;
    }
    /** @inheritdoc */
    public set LabelAlignment(v: LabelAlignment) {
        this.labelAlignment(v);
    }

    /**
     * Set the alignment of the label.
     * @param v The alignment of the label.
     * @returns This instance.
     */
    public labelAlignment(v: LabelAlignment): this {
        if (this.#initialized && v === this.lblAlignment) {
            return this;
        }
        this.lblAlignment = v;
        this.removeClass("a-start", "a-center", "a-end");
        switch (v) {
            case LabelAlignment.START:
                this.addClass("a-start");
                break;
            case LabelAlignment.CENTER:
                this.addClass("a-center");
                break;
            case LabelAlignment.END:
                this.addClass("a-end");
                break;
        }
        return this;
    }

    /** @inheritdoc */
    public override focus(options?: FocusOptions): this {
        this.component.focus(options);
        return this;
    }

    /** @inheritdoc */
    public override blur(): this {
        this.component.blur();
        return this;
    }
}

/**
 * Abstract `LabeledComponentWithSpan` class. This class allows to implement components that use a
 * `Span` component for its label.
 */
export abstract class LabeledComponentWithSpan<C extends IElementComponent<HTMLElement>, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, C, EventMap> {
    /**
     * Create LabeledComponentWithSpan component.
     * @param component The inner component of the labeled component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(component: C, labelPhrase: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition, lblAlignment);
        this.component = component.addClass(LabeledComponent.LCComponentClassname);
        this.initialize();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.label = new Span().addClass(LabeledComponent.LCLabelClassname);
        this.ui = (
            (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
                ? new Div().append(this.label, this.component)
                : new Div().append(this.component, this.label)
        ).addClass(LabeledComponent.DefaultCSSClassName);
        return this;
    }
}

/**
 * Abstract `LabeledComponentWithLabel` class. This class allows to implement components that use a
 * `Label` component for its label.
 */
export abstract class LabeledComponentWithLabel<C extends IElementComponent<HTMLElement>, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Label, C, EventMap> {
    /**
     * Create LabeledComponentWithLabel component.
     * @param component The inner component of the labeled component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses/toggles/... the component (a unique ID has
     *   been set automatically on the component), if `lblAction` is `false`, clicking on the label
     *   does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the component).
     */
    constructor(component: C, labelPhrase: Phrase | Phrases, id?: NullableString, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        super(labelPhrase, lblPosition, lblAlignment);
        this.component = component.addClass(LabeledComponent.LCComponentClassname);
        this.initialize(undefined, labelPhrase, id, lblAction);
    }

    /** @inheritdoc */
    protected override buildUI(labelPhrase: Phrase | Phrases, id?: NullableString, lblAction?: boolean): this {
        this.label = new Label(
            id && (lblAction === undefined || lblAction === true)
                ? id
                : undefined
        )
            .phrase(...[labelPhrase ?? []].flat())
            .addClass(LabeledComponent.LCLabelClassname);
        this.ui = (
            (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
                ? new Div().append(this.label, this.component)
                : new Div().append(this.component, this.label)
        ).addClass(LabeledComponent.DefaultCSSClassName);
        return this;
    }
}

/**
 * Abstract class for building labeled _input_ components, e.g. text inputs, checkboxes etc. that
 * have a descriptive label/caption.
 */
export abstract class LabeledInputComponent<I extends Input, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponentWithLabel<I, EventMap> {
    /**
     * Create LabeledInputComponent component.
     * @param input The input component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the target input component. If `id` is `undefined` or
     * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
     * string, no id attribute will be set. Any other value will be used as the id attribute.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses/toggles/... the input component (a unique ID
     *   has been set automatically on the input component), if `lblAction` is `false`, clicking on
     *   the label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the input component).
     */
    constructor(input: I, labelPhrase: Phrase | Phrases, id?: NullableString, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        super(input, labelPhrase, id, lblPosition, lblAlignment, lblAction);
    }

    /**
     * Get/set `name` attribute value of the input component (re-exported for easier direct access).
     * Internally the setter sets the `name` attribute on the input component. `null` or an empty
     * string removes the attribute. Equivalent to get/set `<instance>.Component.Name`.
     */
    public get Name(): string {
        return this.component.Name;
    }
    /** @inheritdoc */
    public set Name(v: NullableString) {
        this.name(v);
    }

    /**
     * Set `name` attribute value of this input component (re-exported for easier direct access).
     * Internally this sets the `name` attribute on the input component. Equivalent to
     * `<instance>.Component.name()`.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    public name(v: NullableString): this {
        this.component.name(v);
        return this;
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
     * @see {@link LabeledInputComponent.Value}
     * @returns This instance.
     */
    public value(v: string): this {
        this.component.value(v);
        return this;
    }
}

/**
 * Abstract `LabeledComponentGroup` class. This class allows to implement components that group
 * other components in a container which itself is decorated with a label. Examples can be found in
 * {@link LabeledContainer} and {@link LabeledRadioButtonGroup}.
 */
export abstract class LabeledComponentGroup<C extends IElementComponent<HTMLElement>, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, C, EventMap> {
    /**
     * Create LabeledComponentGroup component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
        this.initialize();
    }

    /**
     * Sets the inner component of this labeled component group. This __must__ be called by
     * extending classes!
     * @param component The component that makes up the content of the component group. Usually this
     * is an instance of `IElementWithChildrenComponent` containing other components but this is not
     * a requirement, any component instance can be used.
     * @returns This instance.
     */
    protected setContent(component: C): this {
        this.component = component.addClass(LabeledComponent.LCComponentClassname);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component)
            : this.ui.insert(0, this.component);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Div()
            .addClass(LabeledComponentGroup.DefaultCSSClassName)
            .append(this.label = new Span().addClass(LabeledComponent.LCLabelClassname));
        return this;
    }
}

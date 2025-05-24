import { AElementComponentWithInternalUI, HTMLElementWithChildren, IElementComponent, IElementWithChildrenComponent, Phrase, Phrases } from "@vanilla-ts/core";
import { Label, Span } from "@vanilla-ts/dom";

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
    // available in `this.buildUI()`. It will be set to `undefined` again after `initialize()`.
    #labelPhrase?: Phrase | Phrase[];
    protected lblPosition: LabelPosition;
    protected lblAlignment: LabelAlignment;
    protected component: C;

    /**
     * Create LabeledComponent component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrase[], lblPosition: LabelPosition = LabelPosition.START, lblAlignment: LabelAlignment = LabelAlignment.START) {
        super();
        this.#labelPhrase = labelPhrase;
        this.lblPosition = lblPosition;
        this.lblAlignment = lblAlignment;
    }

    /** @inheritdoc */
    protected override initialize(mountUI?: boolean, ...args: Parameters<typeof this.buildUI>): this {
        super.initialize(mountUI, ...args) // eslint-disable-line @typescript-eslint/no-unsafe-argument
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
    public labelPhrase(...phrase: Phrase[]): this {
        this.label.phrase(...phrase);
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
                this.ui.Children[0] === this.label || this.ui.insert(0, this.label);
                this.addClass("p-top");
                break;
            case LabelPosition.END:
                this.ui.Children[1] === this.label || this.ui.append(this.label);
                this.addClass("p-end");
                break;
            case LabelPosition.BOTTOM:
                this.ui.Children[1] === this.label || this.ui.append(this.label);
                this.addClass("p-bottom");
                break;
            case LabelPosition.START:
                this.ui.Children[0] === this.label || this.ui.insert(0, this.label);
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

import { ElementComponentWithChildren, HTMLElementWithChildren, HTMLElementWithChildrenTagName, NullableString } from "@vanilla-ts/core";
import { Label, Span } from "@vanilla-ts/dom";

/**
 * Position of the label.
 */
export enum LabelPosition {
    TOP = 1, // 1 because of `if (LabelPosition) ...`
    RIGHT,
    BOTTOM,
    LEFT
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
 * Abstract class for building labeled components that have a descriptive label/caption.
 */
export abstract class LabeledComponent<L extends (Label | Span), EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends ElementComponentWithChildren<HTMLElementWithChildren, EventMap> {
    protected label: L;
    protected lblPosition: LabelPosition;
    protected lblAlignment: LabelAlignment;

    /**
     * Builds a labeled component.
     * @param tagName Tag name of this (container) HTML element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param is Support creating customized built-in elements:
     * - https://developer.mozilla.org/en-US/docs/Web/Web_Components#custom_elements
     * - https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example.
     * Currently only for completeness, otherwise not used.
     */
    constructor(tagName: HTMLElementWithChildrenTagName, lblPosition: LabelPosition = LabelPosition.TOP, lblAlignment: LabelAlignment = LabelAlignment.START, is?: string) {
        super(tagName, is);
        this.labelPosition(lblPosition);
        this.labelAlignment(lblAlignment);
    }

    /**
     * Get label component.
     */
    public get Label(): L {
        return this.label;
    }

    /**
     * Get/set the caption of the labeled component.
     */
    public get Caption(): NullableString {
        return this.label.Text;
    }
    /** @inheritdoc */
    public set Caption(v: NullableString) {
        this.label.Text = v;
    }

    /**
     * Set the caption of the labeled component.
     * @param v The caption to be set.
     * @returns This instance.
     */
    public caption(v: NullableString): this {
        this.label.Text = v;
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
        if (v === this.LabelPosition) {
            return this;
        }
        this.lblPosition = v;
        this.removeClass("top", "right", "bottom", "left");
        switch (v) {
            case LabelPosition.TOP:
                this.addClass("top");
                break;
            case LabelPosition.RIGHT:
                this.addClass("right");
                break;
            case LabelPosition.BOTTOM:
                this.addClass("bottom");
                break;
            case LabelPosition.LEFT:
                this.addClass("left");
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
        if (v === this.LabelAlignment) {
            return this;
        }
        this.lblAlignment = v;
        this.removeClass("start", "center", "end");
        switch (v) {
            case LabelAlignment.START:
                this.addClass("start");
                break;
            case LabelAlignment.CENTER:
                this.addClass("center");
                break;
            case LabelAlignment.END:
                this.addClass("end");
                break;
        }
        return this;
    }
}

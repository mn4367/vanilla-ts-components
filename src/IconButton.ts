import { AElementComponentWithInternalUI, ComponentFactory, NullableString, Phrase } from "@vanilla-ts/core";
import { Button, Span } from "@vanilla-ts/dom";


/**
 * IconButton component to display buttons with icons and/or text. The component consists of three
 * inner parts:
 * - A `Span` component at the logical start side of the button (on the left side in 'ltr'
 *   direction, otherwise on right side).
 * - A `span` component containing the phrasing content of the button.
 * - A `Span` component at the logical end side of the button (on the right side in 'ltr'
 *   direction, otherwise on left side).
 *
 * The intended use of this component is that the icons (part one and three) are styled by
 * background images or with an icon font like 'Material Icons'. In both cases the properties and
 * functions `IconStart`/`iconStart()` and `IconEnd`/`iconEnd()` are used to set the respective
 * identifier for the icon, so styling should be easy (see the description of both
 * properties/functions).
 *
 * __Notes:__
 * - The properties/functions `Phrase`/`Rephrase`/`phrase()`/`rephrase()` only affect the span
 * component containing the phrasing content of the button (part two). See the corresponding
 * properties and functions in `IElementWithChildrenComponent` in `@vanilla-ts/core`.
 * - The styling in `themes/vts/IconButton.css` is very generic and only handles the basic layout.
 */
export class IconButton<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Button, EventMap> {
    protected _phrase: Span;
    protected _iconStart: Span;
    protected _iconEnd: Span;

    /**
     * Create IconButton component.
     * @param iconStart The identifier for the icon at the logical start side of the button.
     * `iconStart` sets the DOM text content and the class name of the logical inner start `Span`
     * componnent of the button to the value of `iconStart`. If `iconStart` is an empty string or
     * null, the current text content and the class name are removed.
     * @param iconEnd Identical to `iconStart` but for the logical end side of the button.
     * @param phrase The phrasing content for the IconButton component.
     * @param horizontal `true`, for a horizontal alignment of the three inner button parts, `false`
     * for a vertical alignment.
     */
    constructor(iconStart: NullableString, iconEnd: NullableString, phrase: Phrase[], horizontal: boolean = true) {
        super();
        super
            .initialize()
            .iconStart(iconStart)
            .phrase(...phrase)
            .iconEnd(iconEnd)
            .horizontal(horizontal);
    }

    /**
     * Get/set identifier for the icon at the logical start side of the button. The setter sets the
     * DOM text content and the class name of the logical inner start `Span` componnent of the
     * button to the value of `v`. If `v` is an empty string or null, the current text content and
     * the class name are removed.
     */
    public get IconStart(): NullableString {
        return this._iconStart.Text;
    }
    /** @inheritdoc */
    public set IconStart(v: NullableString) {
        this.setIcon(v, true);
    }

    /**
     * Set the identifier for the icon at the logical start side of the button.
     * @param v The identifier for the logical inner start `Span` componnent of the button. If `v`
     * is an empty string or null, the current text content and the class name are removed.
     * @returns This instance.
     */
    public iconStart(v: NullableString): this {
        return this.setIcon(v, true);
    }

    /**
     * Get/set identifier for the icon at the logical end side of the button. The setter sets the
     * DOM text content and the class name of the logical inner end `Span` componnent of the
     * button to the value of `v`. If `v` is an empty string or null, the current text content and
     * the class name are removed.
     */
    public get IconEnd(): NullableString {
        return this._iconEnd.Text;
    }
    /** @inheritdoc */
    public set IconEnd(v: NullableString) {
        this.setIcon(v, false);
    }

    /**
     * Set the identifier for the icon at the logical end side of the button.
     * @param v The identifier for the logical inner end `Span` componnent of the button. If `v`
     * is an empty string or null, the current text content and the class name are removed.
     * @returns This instance.
     */
    public iconEnd(v: NullableString): this {
        return this.setIcon(v, false);
    }

    /**
     * Set the identifier for the icon at the logical start or end side of the button.
     * @param v The identifier for the logical inner start or end `Span` componnent of the button.
     * If `v` is an empty string or null, the current text content and the class name are removed.
     * @param atStart `true` for the logical start icon, `false` for the logical end icon.
     * @returns This instance.
     */
    protected setIcon(v: NullableString, atStart: boolean): this {
        const identifier = v === null ? null : v.trim() || null;
        const icon = atStart ? this._iconStart : this._iconEnd;
        icon.text(identifier).clazz(identifier).addClass(atStart ? "start" : "end");
        return this;
    }

    /**
     * Get/set the alignment of the three inner button parts. `true`, for a horizontal alignment of
     * the three inner button parts, `false` for a vertical alignment.\
     * __Note:__ This only sets the CSS class names `horizontal`/`vertical`.
     */
    public get Horizontal(): boolean {
        return this.hasClass("horizontal");
    }
    /** @inheritdoc */
    public set Horizontal(v: boolean) {
        this.horizontal(v);
    }

    /**
     * Set the alignment of the three inner button parts.\
     * __Note:__ This only sets the CSS class names `horizontal`/`vertical`.
     * @param horizontal `true`, for a horizontal alignment of the three inner button parts, `false`
     * for a vertical alignment.
     * @returns This instance.
     */
    public horizontal(horizontal: boolean): this {
        this
            .removeClass("vertical", "horizontal")
            .addClass(horizontal ? "horizontal" : "vertical");
        return this;
    }

    /* eslint-disable jsdoc/no-undefined-types */
    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.Phrase}
     */
    public get Phrase(): never {
        throw new Error("'Phrase' is a writeonly property.");
    }
    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.Phrase}
     */
    public set Phrase(phrase: Phrase | Phrase[]) {
        this._phrase.Phrase = phrase;
    }

    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.phrase()}
     */
    public phrase(...phrase: Phrase[]): this {
        this._phrase.phrase(...phrase);
        return this;
    }

    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.Rephrase}
     */
    public get Rephrase(): never {
        throw new Error("'Rephrase' is a writeonly property.");
    }
    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.Rephrase}
     */
    public set Rephrase(phrase: Phrase | Phrase[]) {
        this._phrase.Rephrase = phrase;
    }

    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.rephrase()}
     */
    public rephrase(...phrase: Phrase[]): this {
        this._phrase.rephrase(...phrase);
        return this;
    }
    /* eslint-enable */

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Button().append(
            this._iconStart = new Span().style("order", "1").addClass("start"),
            this._phrase = new Span().style("order", "2").addClass("phrase"),
            this._iconEnd = new Span().style("order", "3").addClass("end")
        );
        return this;
    }
}

/**
 * Factory for IconButton components.
 */
export class IconButtonFactory<T> extends ComponentFactory<IconButton> {
    /**
     * Create IconButton component.
     * @param iconStart The identifier for the icon at the logical start side of the button.
     * `iconStart` sets the DOM text content and the class name of the logical inner start `Span`
     * componnent of the button to the value of `iconStart`. If `iconStart` is an empty string or
     * null, the current text content and the class name are removed.
     * @param iconEnd Identical to `iconStart` but for the logical end side of the button.
     * @param phrase The phrasing content for the IconButton component.
     * @param horizontal `true`, for a horizontal alignment of the three inner button parts, `false`
     * for a vertical alignment.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns IconButton component.
     */
    public iconButton(iconStart: NullableString, iconEnd: NullableString, phrase: Phrase[], horizontal: boolean = true, data?: T): IconButton {
        return this.setupComponent(new IconButton(iconStart, iconEnd, phrase, horizontal), data);
    }
}

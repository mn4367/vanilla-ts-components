import { AElementComponentWithInternalUI, ComponentFactory, mixinDOMProperties, NameAttr, NullableString, Phrase, Phrases, ValueAttr } from "@vanilla-ts/core";
import { Button, Span } from "@vanilla-ts/dom";


/**
 * Options for an icon button. The options are used to initialze the icon button _and_ they can be
 * used to completely re-configure an existing instance of an icon button. All option properties are
 * optional, a missing property will be replaced by its default value (when using
 * `new IconButton(options)`) or by the value already existing in the icon buttons options (when
 * reconfiguring an icon button with `someButton.options({...})`).
 * @see {@link IconButton}
 */
export type IconButtonOptions = {
    /** Icon for the logical start icon element of the button. Default: `null`. */
    IconStart?: NullableString;
    /** Caption for the button. Default: []. */
    Caption?: Phrases;
    /** Icon for the logical end icon element of the button. Default: `null`. */
    IconEnd?: NullableString;
    /** Title (tooltip) for the button. Default: `null`. */
    Title?: NullableString;
    /**
     * Alignment of the three inner button parts. `true` for a horizontal alignment, `false` for a
     * vertical alignment. The order of the parts is always the same, `Horizontal` only sets a CSS
     * marker class. Default: `true`.
     */
    Horizontal?: boolean;
};

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
 * background images or with an icon font like 'Material Icons'. In both cases the icon button
 * options are used to set the respective identifier for the icon, so styling should be easy. For
 * both icon spans (part one and three) the following rules apply:
 * - If the value of `IconStart`/`IconEnd` is an empty string or null, the current text content
 *   _and_ the class name of the `Span` component are _removed_.
 * - If the value of `IconStart`/`IconEnd` begins with `-` (minus), the current text content of the
 *   `Span` component is removed and its class name is set to `<value>.substring(1)`, e.g.
 *   `-some-class` results in the class name `some-class`.
 *
 * __Further notes:__
 * - Any component in the array `Caption` of an icon button options object will be disposed of if
 *   the icon button is disposed of!
 * - The properties/functions `Phrase`/`Rephrase`/`phrase()`/`rephrase()` only affect the span
 *   component containing the phrasing content of the button (part two). See the corresponding
 *   properties and functions in `IElementWithChildrenComponent` in `@vanilla-ts/core`.
 * - The styling in `themes/vts/IconButton.css` is very generic and only handles the basic layout.
 * @see {@link IconButtonOptions}
 */
export class IconButton<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Button, EventMap> {
    protected _options: IconButtonOptions = {}; // eslint-disable-line jsdoc/require-jsdoc
    protected btnPhrase: Span;
    protected spanStart: Span;
    protected spanEnd: Span;

    /**
     * Utility function that merges icon button options into existing icon button options. The
     * result contains always _all_ possible members of `IconButtonOptions`. The following rules
     * apply:
     * - A property of `from` that is not equal to `undefined` will replace/create the respective
     * property in `to`.
     * - A property that does exist in `to` but not in `from` remains untouched.
     * - A property that doesn't exist in `from` nor `to`  will be set to its default value in `to`.
     * @param from An object with icon button options that are to be merged into existing options.
     * If `from` is `undefined` or an empty object, `to` will remain untouched, except for missing
     * properties in `to` which will be set to their default values.
     * @param to An object into which the properties from the object `from` are to be merged. If
     * `to` is `undefined`, a _new_ object is returned, otherwise `to` is retained and updated with
     * the properties from the object `from`.
     * @returns An object with complete icon button options. If `to` is `undefined`, this is a _new_
     * object, otherwise the modified object `to` is returned.
     */
    public static mergeOptionsFromTo(from?: IconButtonOptions, to?: IconButtonOptions): IconButtonOptions {
        const result = to ?? {};
        result.IconStart = from?.IconStart !== undefined ? from.IconStart : to?.IconStart ?? null;
        result.IconEnd = from?.IconEnd !== undefined ? from.IconEnd : to?.IconEnd ?? null;
        result.Caption = from?.Caption !== undefined ? [...from.Caption] : to?.Caption ?? [];
        result.Title = from?.Title !== undefined ? from.Title : to?.Title ?? null;
        result.Horizontal = from?.Horizontal !== undefined ? from.Horizontal : to?.Horizontal ?? true;
        return result;
    }

    /**
     * Create IconButton component.
     * @param options The options for the icon button.
     * @see {@link IconButtonOptions}
     */
    constructor(options?: IconButtonOptions) {
        super();
        super
            .initialize()
            .options(options ?? {});
    }

    /** @inheritdoc */
    public override disabled(disabled: boolean): this {
        // Uses the `NativeDisabled` property of `Button`.
        this.ui.disabled(disabled);
        return super.disabled(disabled);
    }

    /**
     * Get/set the icon button options. The returned object is a _copy_, modifying this copy has no
     * effect on the corresponding icon button instance.
     */
    public get Options(): IconButtonOptions {
        return {
            ...this._options,
            Caption: [...this._options.Caption!] // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    public set Options(v: IconButtonOptions) {
        this.options(v);
    }

    /**
     * Sets the options for the icon button. See also the documentation for `IconButtonOptions`.
     * @param options The new icon button options.
     * @returns This instance.
     */
    public options(options: IconButtonOptions) {
        IconButton.mergeOptionsFromTo(options, this._options);
        this
            .setIcon(this._options.IconStart!, true)
            .rephrase(...this._options.Caption!)
            .setIcon(this._options.IconEnd!, false)
            .title(this._options.Title!)
            .removeClass("horizontal", "vertical")
            .addClass(this._options.Horizontal ? "horizontal" : "vertical");
        return this;
    }

    /**
     * Set the identifier for the icon at the logical start or end side of the button.
     * @param v The identifier for the logical inner start or end `Span` componnent of the button.
     * - If `v` is an empty string or null, the current text content and the class name of the
     *   `Span` component are removed.
     * - If `v` begins with `-` (minus), the current text content of the `Span` component is removed
     *   and its class name is set to `v.substring(1)`, e.g. `-some-class` results in the class name
     *   `some-class`.
     * @param atStart `true` for the logical start icon, `false` for the logical end icon.
     * @returns This instance.
     */
    protected setIcon(v: NullableString, atStart: boolean): this {
        v = v === null ? null : v.trim() || null;
        const icon = atStart
            ? this.spanStart
            : this.spanEnd;
        const hasDisabled = icon.hasClass("disabled");
        const hasParentDisabled = icon.hasClass("parent-disabled");
        icon.text(
            v === null || v.startsWith("-")
                ? null
                : v
        ).clazz(
            v === null
                ? null
                : v.startsWith("-")
                    ? v.substring(1)
                    : v
        ).addClass(
            atStart ? "start" : "end",
            hasDisabled ? "disabled" : undefined,
            hasParentDisabled ? "parent-disabled" : undefined
        );
        return this;
    }

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
    public set Phrase(phrase: Phrase | Phrases) {
        this.btnPhrase.Phrase = phrase;
    }

    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.phrase()}
     */
    public phrase(...phrase: Phrases): this {
        this.btnPhrase.phrase(...phrase);
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
    public set Rephrase(phrase: Phrase | Phrases) {
        this.btnPhrase.Rephrase = phrase;
    }

    /**
     * @inheritdoc
     * @see {@link @vanilla-ts/core/Interfaces.ts/IElementWithChildrenComponent.rephrase()}
     */
    public rephrase(...phrase: Phrases): this {
        this.btnPhrase.rephrase(...phrase);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Button()
            .append(
                this.spanStart = new Span().style("order", "1").addClass("start"),
                this.btnPhrase = new Span().style("order", "2").addClass("phrase"),
                this.spanEnd = new Span().style("order", "3").addClass("end")
            );
        return this;
    }

    static {
        /**
         * Mixin additional DOM attributes. Required because `IconButton` is actually just a `Button
         * (with additional child components).
         */
        mixinDOMProperties(
            this,
            NameAttr<HTMLButtonElement>,
            // !! Handled by `public override disabled()`
            // NativeDisabledAttr<HTMLButtonElement>,
            ValueAttr<HTMLButtonElement>
        );
    }
}

/**
 * Factory for `IconButton` components.
 */
export class IconButtonFactory<T> extends ComponentFactory<IconButton> {
    /**
     * Create IconButton component.
     * @param options The options for the icon button.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns IconButton component.
     * @see {@link IconButtonOptions}
     */
    public iconButton(options?: IconButtonOptions, data?: T): IconButton {
        return this.setupComponent(new IconButton(options), data);
    }
}

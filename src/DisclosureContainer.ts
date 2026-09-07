import { AChildren, ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DefaultEventMap, FlowContent, IChildrenMixin, IElementWithChildrenComponent, INodeComponent, mixin } from "@vanilla-ts/core";
import { Div, Span, Text } from "@vanilla-ts/dom";
import { IconButton, IconButtonOptions } from "./IconButton.js";


/**
 * Apperance of the disclosure container.
 */
export enum DisclosureContainerAppearance {
    // START = left in `ltr` direction and right in `rtl` direction.
    // END = right in `ltr` direction and left in `rtl` direction.
    TOP_START = 0,
    TOP_END,
    END_TOP,
    END_BOTTOM,
    BOTTOM_END,
    BOTTOM_START,
    START_BOTTOM,
    START_TOP,
}

/** Custom 'disclose' event for disclosure containers. */
export class DiscloseEvent extends ACustomComponentEvent<"disclose", DisclosureContainer, {
    /** `true`, if the disclosure container is disclosed, otherwise `false`. */
    Disclosed: boolean;
}> {
    /**
     * Create DiscloseEvent event.
     * @param sender The event emitter (always `DisclosureContainer`).
     * @param disclosed `true`, if the DisclosureContainer was disclosed, otherwise `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: DisclosureContainer, disclosed: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("disclose", sender, { Disclosed: disclosed }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `DisclosureContainer`. */
export interface DisclosureContainerEventMap extends DefaultEventMap {
    /**
     * A disclosure container is disclosed/undisclosed. Event handlers can prevent changing the
     * `Disclosed` state by calling `preventDefault()`.
     */
    "disclose": DiscloseEvent;
}

/**
 * Container whose content can be disclosed/undisclosed.
 */
export class DisclosureContainer<Child extends FlowContent = FlowContent, EventMap extends DisclosureContainerEventMap = DisclosureContainerEventMap> extends AElementComponentWithInternalUI<Div, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    protected _initialized = false;
    protected headerContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected _disclosureButton: IconButton;
    protected headerContent: IElementWithChildrenComponent<HTMLDivElement>;
    protected contentContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected _weakUndisclosed: boolean;
    protected _disclosed: boolean;
    protected disclosedBtnOptions: IconButtonOptions = {};
    protected undisclosedBtnOptions: IconButtonOptions = {};
    protected _appearance: DisclosureContainerAppearance;
    protected vertical: boolean;
    protected _animatable: boolean = false;
    protected fncOnTransitionEnd = this.onTransitionEnd.bind(this);

    /**
     * Creates DisclosureContainer component.
     * @param header The header content (components or string). In the case of a single string, the
     * header content is a `Span` component with the string as the content. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param content The content components for the disclosure container. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param disclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _disclosed_ state. Default: `{ Caption: ["-"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param undisclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _undisclosed_ state. Default: `{ Caption: ["+"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param disclosed `true`, if the initial state of the disclosure container is 'disclosed',
     * otherwise `false`. Default: `true`.
     * @param weakUndisclosed There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the class names mentioned above) by _removing/adding_ the
     *   inner content container from/to the internal DOM.
     * If `weakUndisclosed` is `true`, only the mentioned class names are set and the inner content
     * container will be left as is (mounted). If `weakUndisclosed` is `false`, the inner content
     * container will be _removed/added_ from/to the internal DOM.\
     * `weakUndisclosed` can help to animate the states `disclosed`/`undisclosed`. Default: `false`.
     * @param appearance The disclosure container appearance (header position and orientation).
     * @param animatable `true`, to enable animations on disclosed state changes.\
     * __Note:__ If `animated` is `true`, `weakUndisclosed` must also be `true`!\
     *  Default: `false`.
     */
    constructor(
        header?: (FlowContent | string | undefined | null)[] | FlowContent | string | null,
        content?: (Child | string | undefined | null)[] | Child | string | null,
        disclosedBtnOptions: IconButtonOptions = { Caption: ["-"] }, // eslint-disable-line jsdoc/require-jsdoc
        undisclosedBtnOptions: IconButtonOptions = { Caption: ["+"] }, // eslint-disable-line jsdoc/require-jsdoc
        disclosed: boolean = true,
        weakUndisclosed: boolean = false,
        appearance: DisclosureContainerAppearance = DisclosureContainerAppearance.TOP_START,
        animatable: boolean = false
    ) {
        super();
        super.initialize()
            .disclosedButtonOptions(disclosedBtnOptions)
            .undisclosedButtonOptions(undisclosedBtnOptions)
            .appearance(appearance)
            .weakUndisclosed(weakUndisclosed)
            .animatable(animatable)
            .disclosed(disclosed)
            .header(header)
            .append(
                ...(
                    Array.isArray(content)
                        ? content
                        : [content]
                ).map(e => typeof e === "string" ? <Child><unknown>new Text(e) : e),
            );
        if (this._animatable && this._disclosed) {
            this.contentContainer.style({ "width": null, "height": null }); // eslint-disable-line jsdoc/require-jsdoc
        }
        this._initialized = true;
    }

    /**
     * Only for special purposes: Get the disclosure button component.
     * @see {@link IconButton}
     */
    public get DisclosureButton(): IconButton {
        return this._disclosureButton;
    }

    /**
     * Access the internal `IconButton` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `IconButton` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    public disclosureButton(cb: (disclosureButton: IconButton, owner?: this) => void): this {
        cb(this._disclosureButton, this);
        return this;
    }

    /**
     * Get/set the options for the disclosure button in _disclosed_ state. Returns a _copy_ of the
     * current options. Modifying this object has no effect except for the case where components in
     * `Caption` are accessed and modified (which should be avoided!).
     */
    public get DisclosedButtonOptions(): IconButtonOptions {
        return {
            ...this.disclosedBtnOptions,
            Caption: [...this.disclosedBtnOptions.Caption!] // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    public set DisclosedButtonOptions(v: IconButtonOptions) {
        this.disclosedButtonOptions(v);
    }

    /**
     * Set the options for the disclosure button in _disclosed_ state.
     * @param v The new icon button options.
     * @returns This instance.
     */
    public disclosedButtonOptions(v: IconButtonOptions): this {
        IconButton.mergeOptionsFromTo(v, this.disclosedBtnOptions);
        this._disclosed && this._disclosureButton.options(this.disclosedBtnOptions);
        return this;
    }

    /**
     * Get/set the options for the disclosure button in _undisclosed_ state. Returns a _copy_ of the
     * current options. Modifying this object has no effect except for the case where components in
     * `Caption` are accessed and modified (which should be avoided!).
     */
    public get UndisclosedButtonOptions(): IconButtonOptions {
        return {
            ...this.undisclosedBtnOptions,
            Caption: [...this.undisclosedBtnOptions.Caption!] // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    public set UndisclosedButtonOptions(v: IconButtonOptions) {
        this.undisclosedButtonOptions(v);
    }

    /**
     * Set the options for the disclosure button in _undisclosed_ state.
     * @param v The new icon button options.
     * @returns This instance.
     */
    public undisclosedButtonOptions(v: IconButtonOptions): this {
        IconButton.mergeOptionsFromTo(v, this.undisclosedBtnOptions);
        !this._disclosed && this._disclosureButton.options(this.undisclosedBtnOptions);
        return this;
    }

    /**
     * Get the container component, that holds the header content (excluding the disclosure button).
     */
    public get Header(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.headerContent;
    }

    /**
     * Get the container component, that holds the content of the disclosure container.\
     * __Note:__ This property __must not be used to add/remove/... components__, instead use the
     * respective functions of `DisclosureContainer` itself! `Content` should only be used for
     * styling or other (readonly) purposes!
     */
    public get Content(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.contentContainer;
    }

    /**
     * Set new content for the header (the disclosure button is retained). Setting new content for
     * the header _disposes the former content if `extractTo is `undefined`_!
     * @param header The new header content (components or string). In the case of a string, the
     * header content is a `Span` component with the string as the content. If `undefined` or an
     * empty array, the header is emptied.
     * @param extractTo An array, that, if given, will receive the former header component(s).
     * @returns This instance.
     */
    public header(header?: (FlowContent | string | undefined | null)[] | FlowContent | string | null, extractTo?: INodeComponent<Node>[]): this {
        extractTo
            ? this.headerContent.extract(extractTo)
            : this.headerContent.clear();
        this.headerContent.removeClass("header-text");
        this.headerContent.append(
            ...(
                Array.isArray(header)
                    ? header
                    : [typeof header === "string" ? new Span(header).addClass("header-text") : header]
            ).map(e => typeof e === "string" ? new Text(e) : e),
        );
        return this;
    }

    /**
     * Access the internal header content container component via a callback function. Useful for
     * seamless chaining when creating instances of this component.
     * @param cb A callback function that receives the current header content component instance and
     * this instance as parameters. The callback function can be used to modify the header content
     * component.
     * @returns This instance.
     */
    public headerCb(cb: (header: IElementWithChildrenComponent<HTMLDivElement>, owner?: this) => void): this {
        cb(this.headerContent, this);
        return this;
    }

    /**
     * Get/set the disclosed state.
     */
    public get Disclosed(): boolean {
        return this._disclosed;
    }
    /** @inheritdoc */
    public set Disclosed(v: boolean) {
        this.disclosed(v);
    }

    /**
     * Disclose/undisclose this component.
     * @param disclosed `true`, if the state of the disclosure container shall be 'disclosed',
     * otherwise `false`.
     * @returns This instance.
     */
    public disclosed(disclosed: boolean): this {
        if (disclosed !== this._disclosed) {
            if (!this.dispatch(new DiscloseEvent(this, disclosed))) {
                return this;
            }
            this._disclosed = disclosed;
            this._initialized && this._animatable && this.supportAnimation();
            if (this._disclosed) {
                this
                    .removeClass("undisclosed")
                    .addClass("disclosed");
                this._disclosureButton.options(this.disclosedBtnOptions);
                this._weakUndisclosed || this.ui.append(this.contentContainer);
            } else {
                this
                    .removeClass("disclosed")
                    .addClass("undisclosed");
                this._disclosureButton.options(this.undisclosedBtnOptions);
                this._weakUndisclosed || this.ui.remove(this.contentContainer);
            }
        }
        return this;
    }

    /**
     * Toggle the `Disclosed` state of this this component.
     * @returns This instance.
     */
    public toggleDisclosed(): this {
        this.disclosed(!this.Disclosed);
        return this;
    }

    /**
     * Get/set the 'weak undisclosed' property.
     * @see {@link DisclosureContainer.weakUndisclosed()}
     */
    public get WeakUndisclosed(): boolean {
        return this._weakUndisclosed;
    }
    /** @inheritdoc */
    public set WeakUndisclosed(v: boolean) {
        this.weakUndisclosed(v);
    }

    /**
     * Set the 'weak undisclosed' property.
     * @param weak There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the class names mentioned above) by _removing/adding_ the
     *   inner content container from/to the internal DOM.
     * If `weak` is `true`, only the mentioned class names are set and the inner content container
     * will be left as is (mounted). If `weak` is `false`, the inner content container will be
     * _removed/added_ from/to the internal DOM.
     *
     * __Note:__ `WeakUndisclosed` must also be `true` for the disclosure container to be
     * {@link animatable}. If `WeakUndisclosed` is set to `false` the property `Animatable`
     * will automatically be set to `false` as well!
     * @returns This instance.
     */
    public weakUndisclosed(weak: boolean): this {
        if (this._weakUndisclosed !== weak) {
            this._weakUndisclosed = weak;
            if (this._weakUndisclosed) {
                this.addClass("weak");
            } else {
                this.animatable(false);
                this.removeClass("weak");
            }
            if (!this.Disclosed) {
                this._weakUndisclosed
                    ? this.ui.append(this.contentContainer)
                    : this.ui.remove(this.contentContainer);
            }
        }
        return this;
    }

    /**
     * Get/set the appearance of the disclosure container.
     */
    public get Appearance(): DisclosureContainerAppearance {
        return this._appearance;
    }
    /** @inheritdoc */
    public set Appearance(v: DisclosureContainerAppearance) {
        this.appearance(v);
    }

    /**
     * Sets the appearance of the disclosure container.
     * @param appearance The new appearance. `BOTTOM_RIGHT`, for example, should set the header to
     * the bottom and the disclosure button to the right.
     * @returns This instance.
     */
    public appearance(appearance: DisclosureContainerAppearance): this {
        if (this._appearance !== appearance) {
            const wasVertical = this.vertical;
            this._appearance = appearance;
            let clazz: string;
            switch (this._appearance) {
                case DisclosureContainerAppearance.TOP_START:
                    clazz = "top-start";
                    break;
                case DisclosureContainerAppearance.TOP_END:
                    clazz = "top-end";
                    break;
                case DisclosureContainerAppearance.END_TOP:
                    clazz = "end-top";
                    break;
                case DisclosureContainerAppearance.END_BOTTOM:
                    clazz = "end-bottom";
                    break;
                case DisclosureContainerAppearance.BOTTOM_START:
                    clazz = "bottom-start";
                    break;
                case DisclosureContainerAppearance.BOTTOM_END:
                    clazz = "bottom-end";
                    break;
                case DisclosureContainerAppearance.START_TOP:
                    clazz = "start-top";
                    break;
                case DisclosureContainerAppearance.START_BOTTOM:
                    clazz = "start-bottom";
                    break;
                default:
                    clazz = "top-start";
                    break;
            }
            this.vertical = ![
                DisclosureContainerAppearance.START_TOP,
                DisclosureContainerAppearance.START_BOTTOM,
                DisclosureContainerAppearance.END_TOP,
                DisclosureContainerAppearance.END_BOTTOM
            ].includes(this._appearance);
            this.ui
                .removeClass("vertical", "horizontal", "top-start", "top-end", "end-top", "end-bottom", "bottom-start", "bottom-end", "start-top", "start-bottom")
                .addClass(clazz, this.vertical ? "vertical" : "horizontal");
            if (wasVertical !== this.vertical && !this._disclosed && this._animatable) {
                this.removeClass("animatable");
                this.contentContainer.style({ "width": null, "height": null }); // eslint-disable-line jsdoc/require-jsdoc
                this.supportAnimation();
                this.addClass("animatable");
            }
        }
        return this;
    }

    /**
     * Enable/disable disclosure animations on the disclosure container.
     */
    public get Animatable(): boolean {
        return this._animatable;
    }
    /** @inheritdoc */
    public set Animatable(v: boolean) {
        this.animatable(v);
    }

    /**
     * Enable/disable disclosure animations on the disclosure container.
     * @param animatable `true`, if the disclosure container is animatable, otherwise `false`.\
     * __Note:__ If `Animatable` is set to `true`, `WeakUndisclosed` will automatically be set to
     * `true` as well!
     * @returns This instance.
     */
    public animatable(animatable: boolean): this {
        if (this._animatable !== animatable) {
            this._animatable = animatable;
            if (this._animatable) {
                this.weakUndisclosed(true);
                this._disclosed || this.supportAnimation();
                this.contentContainer.on("transitionend", this.fncOnTransitionEnd);
                this.addClass("animatable");
            } else {
                this.contentContainer.off("transitionend", this.fncOnTransitionEnd);
                this.removeClass("animatable");
                this.contentContainer.style({ "height": null, "width": null }); // eslint-disable-line jsdoc/require-jsdoc
            }
        }
        return this;
    }

    /**
     * Removes (_and disposes of_) all children from the disclosure container (except the header).
     * @returns This instance.
     */
    public clearContent(): this {
        const extracted: Child[] = [];
        this.extract(extracted);
        for (const component of extracted) {
            component.dispose();
        }
        return this;
    }

    /**
     * Support disclosure/undisclosure animations by setting the needed size.
     */
    protected supportAnimation(): void {
        const el = this.contentContainer.DOM;
        const size = this.vertical
            ? el.scrollHeight + "px"
            : el.scrollWidth + "px";
        const prop = this.vertical
            ? "height"
            : "width";
        el.style[prop] = size;
        // A variant of the hack shown in https://codepen.io/Sormano/pen/PReMjZ (forcibly prevent
        // render skipping, here without modifying any style).
        this.vertical
            ? el.style.setProperty("", el.scrollHeight + "")
            : el.style.setProperty("", el.scrollWidth + "");
        el.style[prop] = this._disclosed ? size : "0px";
    }

    /**
     * Removes the corresponding property after a width/heigth transitions.
     * @param ev The transition event.
     */
    protected onTransitionEnd(ev: TransitionEvent): void {
        if (this._disclosed && ev.target === this.contentContainer.DOM) {
            ev.propertyName === "height"
                ? this.contentContainer.style("height", null)
                : ev.propertyName === "width" && this.contentContainer.style("width", null);
        }
    }

    /** @inheritdoc */
    protected override clearOwner(): void {
        // Dispose of all components in the two disclosure button options.
        this._disclosureButton.rephrase();
        this.disclosedBtnOptions.Caption!.forEach(e => typeof e === "string" || e.dispose());
        this.undisclosedBtnOptions.Caption!.forEach(e => typeof e === "string" || e.dispose());
        // The content container is always cleared due to the `AChildren` mixin, but it is not
        // disposed of if it is not mounted. This is the case if `_weakUndisclosed` is `false` _and_
        // the `DisclosureContainer` instance is undisclosed.
        this.ui.contains(this.contentContainer) || this.contentContainer.dispose();
        super.clearOwner();
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI(): this {
        this.ui = new Div()
            .append(
                this.headerContainer = new Div()
                    .addClass("header-container")
                    .append(
                        this._disclosureButton = new IconButton()
                            .addClass("disclose", IconButton.DefaultCSSClassName)
                            .on("click", () => this.disclosed(!this.Disclosed)),
                        this.headerContent = new Div()
                            .addClass("header-content")
                        // Support toggling by clicking anywhere on the header content.
                        // .on("pointerup", (_ev: PointerEvent) => this.toggleDisclosed()),
                    ),
                this.contentContainer = new Div()
                    .addClass("content-container")
            );
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }

    /** @inheritdoc */
    public override dispose(): void {
        this._animatable && this.contentContainer.off("transitionend", this.fncOnTransitionEnd);
        super.dispose();
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface DisclosureContainer<Child extends FlowContent = FlowContent> extends IChildrenMixin<Child> { } // eslint-disable-line jsdoc/require-jsdoc,@typescript-eslint/no-empty-object-type

/**
 * Factory for `DisclosureContainer` components.
 */
export class DisclosureContainerFactory<Child extends FlowContent = FlowContent, T = unknown> extends ComponentFactory<DisclosureContainer<Child>> {
    /**
     * Create, set up and return DisclosureContainer component.
     * @param header The header content (components or string). In the case of a single string, the
     * header content is a `Span` component with the string as the content. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param content The content components for the disclosure container. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param disclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _disclosed_ state. Default: `{ Caption: ["-"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param undisclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _undisclosed_ state. Default: `{ Caption: ["+"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param disclosed `true`, if the initial state of the disclosure container is 'disclosed',
     * otherwise `false`. Default: `true`.
     * @param weakUndisclosed There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the class names mentioned above) by _removing/adding_ the
     *   inner content container from/to the internal DOM.
     * If `weakUndisclosed` is `true`, only the mentioned class names are set and the inner content
     * container will be left as is (mounted). If `weakUndisclosed` is `false`, the inner content
     * container will be _removed/added_ from/to the internal DOM.\
     * `weakUndisclosed` can help to animate the states `disclosed`/`undisclosed`. Default: `false`.
     * @param appearance The disclosure container appearance (header position and orientation).
     * @param animatable `true`, to enable animations on disclosed state changes.\
     * __Note:__ If `animated` is `true`, `weakUndisclosed` must also be `true`!\
     *  Default: `false`.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns DisclosureContainer component.
     */
    public disclosureContainer(
        header?: (FlowContent | string | undefined | null)[] | FlowContent | string | null,
        content?: (Child | string | undefined | null)[] | Child | string | null,
        disclosedBtnOptions: IconButtonOptions = { Caption: ["-"] }, // eslint-disable-line jsdoc/require-jsdoc
        undisclosedBtnOptions: IconButtonOptions = { Caption: ["+"] }, // eslint-disable-line jsdoc/require-jsdoc
        disclosed: boolean = true,
        weakUndisclosed: boolean = false,
        appearance: DisclosureContainerAppearance = DisclosureContainerAppearance.TOP_START,
        animatable: boolean = false,
        data?: T
    ): DisclosureContainer<Child> {
        return this.setupComponent(new DisclosureContainer<Child>(header, content, disclosedBtnOptions, undisclosedBtnOptions, disclosed, weakUndisclosed, appearance, animatable), data);
    }
}

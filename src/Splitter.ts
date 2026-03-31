import { ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, CSSPropertyNames, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, FlowContents, getClientRect, getDebouncedFnc, IElementWithChildrenComponent } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";


/**
 * The splitter area which is affected by dragging the splitter handle. Dragging the handle sets the
 * CSS style setting `width`/`height` _only on this area_, not on the opposite area.\
 * Default: `SplitterRefArea.START`.
 */
export enum SplitterActiveArea {
    /** Logical first area. */
    START,
    /** Logical second area. */
    END
}

/** The state of a splitter. */
export enum SplitterState {
    /** The splitter is active. */
    ACTIVE,
    /**
     * The splitter is inactive (the size of the active area cannot be changed manually, only
     * programmatically). Normally, the splitter handle should still be visible.
     */
    INACTIVE,
    /**
     * The splitter is disabled completely (the size of the active area cannot be changed manually,
     * only programmatically). Additionally the splitter handle should be invisible.\
     * __Note:__ With appropriate settings (e.g. if `StartMinSize` is set to a percentage value),
     * the splitter will still adjust its internal layout if its size changes.
     */
    OFF
}

/** The state `Collapsed` of a splitter. */
export enum SplitterCollapsedState {
    /** No splitter area is collapsed. */
    NONE,
    /** The logical start area is collapsed. */
    START,
    /** The logical end area is collapsed. */
    END
}

/**
 * Options for a splitter. The options are used to initialze the splitter _and_ they can be used to
 * completely re-configure an existing instance of a splitter. All option properties are optional, a
 * missing property will be replaced by its default value (when using `new Splitter(options, ...)`)
 * or by the value already existing in the splitter options (when reconfiguring a splitter with
 * `someSplitter.options({...})`).\
 * __Note:__ The options object is never changed by the splitter (with one exception, see below),
 * that means it may not reflect the current splitters state. For example, if `ActiveAreaFixed` is
 * `true` and `ActiveAreaSize` is set to a percentage value like `25%`, `ActiveAreaFixed` won't be
 * switched to `false`. Also, reading CSS properties of the splitters DOM parts may result in other
 * values than those of the options object. The mentioned exception is the function `mirror()`,
 * which swaps the properties `ActiveArea`, `StartMinSize` and `EndMinSize`.
 * @example
 * ```typescript
 * // Get a horizontal splitter with a minimum size of `10rem` for both areas and an inital size of
 * // `30%` for the active area (which is `SplitterActiveArea.START` by default).
 * const splitter = new Splitter({
 *   ActiveAreaSize: "30%",
 *   StartMinSize: "10rem",
 *   EndMinSize: "10rem"
 * })
 *
 * // Switch the splitter orientation to vertical, set the active area to the logical end element,
 * // collapse the logical end element and lock the splitter completely.
 * splitter.options({
 *   Horizontal: false,
 *   ActiveArea: SplitterActiveArea.END,
 *   Collapsed: SplitterCollapsedState.END,
 *   State: SplitterState.OFF
 * })
 * ```
 */
export type SplitterOptions = {
    /**
     * State of the splitter.\
     * Default: `SplitterState.ACTIVE`.
     */
    readonly State?: SplitterState;
    /**
     * `Collapsed` state of a splitter.
     * Default: `SplitterCollapsedState.NONE`.
     * @see {@link SplitterCollapsedState}
     */
    readonly Collapsed?: SplitterCollapsedState;
    /**
     * Alignment of the splitter areas (`true` for horizontal, `false` for vertical). If the
     * alignment is changed during runtime, the splitter attempts to maintain the relative sizes of
     * the inner splitter parts in relation to the splitter size itself.\
     * Default: `true`.
     */
    readonly Horizontal?: boolean;
    /**
     * The splitter area which is affected by dragging the splitter handle.\
     * `Default: SplitterRefArea.START`.
     * @see {@link SplitterActiveArea}
     */
    readonly ActiveArea?: SplitterActiveArea;
    /**
     * The size of the (active) splitter area (as a numeric CSS length, see below).
     *
     * This value defines also how the splitter behaves when it is resized (the whole component, not
     * the active area). If `ActiveAreaSize` ends with `%`, the active area grows/shrinks based on
     * the current percentage value of the width/height of the active area in relation to the
     * width/height of the splitter.
     *
     * If `ActiveAreaSize` ends with another value (like `rem`, e.g. an absolute size), the active
     * area retains its current absolute size if the size of the splitter component is changed (e.g.
     * if the size of the containing window is changed).
     *
     * Absolute sizes are typically used for layouts where the active area is a resizable sidebar
     * that does not change its appearance when the window is resized while percentage based values
     * are more suitable for grids that resize their grid elements proportionally.
     *
     * The following CSS length units can be used:
     *
     * - Percentage values.
     * - Absolute length units:
     *   https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units
     * - Relative length units based on font:
     *   https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_font
     * - Relative length units based on root element's font:
     *   https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_root_elements_font
     *
     * All other length units should be avoided, also the use of other values such as `calc()` or
     * `fit-content` can lead to undefined behavior.\
     * Default: `50%`.
     */
    readonly ActiveAreaSize?: string;
    /**
     * The minimum size of the logical start area (as a numeric CSS length).\
     * Default: `10rem`.
     * @see {@link SplitterOptions.ActiveAreaSize} for valid CSS length units.
     */
    readonly StartMinSize?: string;
    /**
     * The minimum size of the logical end area (as a numeric CSS length).\
     * Default: `10rem`.
     * @see {@link SplitterOptions.ActiveAreaSize} for valid CSS length units.
     */
    readonly EndMinSize?: string;
};

/**
 * The current geometry of a splitter instance.
 */
export type SplitterGeometry = {
    /** Alignment of the splitter areas (`true` for horizontal, `false` for vertical). */
    Horizontal: boolean;
    /** The position and size of the logical start element with regard to the splitter component. */
    Start: DOMRect;
    /** The calculated minimum size in pixels of the logical start element. */
    StartMinSize: number;
    /** Percentage of the size of the logical start element with regard to the splitters size. */
    StartPercentage: number;
    /** The position and size of the logical end element with regard to the splitter component. */
    End: DOMRect;
    /** The calculated minimum size in pixels of the logical end element. */
    EndMinSize: number;
    /** Percentage of the size of the logical end element with regard to the splitters size. */
    EndPercentage: number;
};

/** Custom 'splitter-area-resize-start' event for `Splitter`. */
export class SplitterAreaResizeStartEvent extends ACustomComponentEvent<"splitter-area-resize-start", Splitter> {
    /**
     * Create SplitterAreaResizeStartEvent event. Event handlers can prevent changing the options by
     * calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Splitter, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("splitter-area-resize-start", sender, undefined, customEventInitDict);
    }
}

/** Custom 'splitter-area-resize' event for `Splitter`. */
export class SplitterAreaResizeEvent extends ACustomComponentEvent<"splitter-area-resize", Splitter, {
    /**
     * The new size of the active area in pixels. This size is the actual size after applying the
     * constraints for the minimum sizes given through the options.
     */
    Size: number;
}> {
    /**
     * Create SplitterAreaResizeEvent event. Event handlers can prevent changing the size by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param size The new size of the active area in pixels. This size is the actual size after
     * applying the constraints for the minimum sizes given through the options.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Splitter, size: number, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("splitter-area-resize", sender, { Size: size }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'splitter-area-resize-end' event for `Splitter`. */
export class SplitterAreaResizeEndEvent extends ACustomComponentEvent<"splitter-area-resize-end", Splitter> {
    /**
     * Create SplitterAreaResizeEndEvent event. This event is only informative, it cannot be
     * prevented by calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Splitter, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("splitter-area-resize-end", sender, undefined, customEventInitDict);
    }
}

/** Custom 'splitter-collapsed' event for `Splitter`. */
export class SplitterCollapsedEvent extends ACustomComponentEvent<"splitter-collapsed", Splitter, {
    /** The splitter collapsed state which has been set. */
    State: SplitterCollapsedState;
}> {
    /**
     * Create SplitterCollapsedEvent event. This event is only informative, it cannot be prevented
     * by calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param state The splitter collapsed state which has been set.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Splitter, state: SplitterCollapsedState, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("splitter-collapsed", sender, { State: state }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'splitter-resize' event for `Splitter`. */
export class SplitterResizeEvent extends ACustomComponentEvent<"splitter-resize", Splitter> {
    /**
     * Create SplitterResizeEvent event. This event is only informative, it cannot be prevented by
     * calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     */
    constructor(sender: Splitter) {
        super("splitter-resize", sender, undefined, DEFAULT_EVENT_INIT_DICT);
    }
}

/** Custom 'splitter-options' event for `Splitter`. */
export class SplitterOptionsEvent extends ACustomComponentEvent<"splitter-options", Splitter, {
    /** The new options for the splitter. */
    Options: SplitterOptions;
}> {
    /**
     * Create SplitterOptionsEvent event. Event handlers can prevent changing the options by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param options The new options for the splitter.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Splitter, options: SplitterOptions, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("splitter-options", sender, { Options: options }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional events for `Splitter`. */
export interface SplitterEventMap extends HTMLElementEventMap {
    /**
     * The splitter wants to start a resize operation on the active area (the `pointerdown` event on
     * the handle is triggered). Event handlers can prevent starting the resize operation by calling
     * `preventDefault()`.
     */
    "splitter-area-resize-start": SplitterAreaResizeStartEvent;
    /**
     * The splitter wants to resize the active area. Event handlers can prevent changing the size by
     * calling `preventDefault()`.
     */
    "splitter-area-resize": SplitterAreaResizeEvent;
    /**
     * The splitter terminates a resize operation on the active area (the `pointerup` event is
     * triggered on the handle). This event is only informative, it cannot be prevented by calling
     * `preventDefault()`.
     */
    "splitter-area-resize-end": SplitterAreaResizeEndEvent;
    /**
     * The splitter itself was resized, either directly or implicitly through changes to the parent
     * components or the window itself. This event is only informative, it cannot be prevented by
     * calling `preventDefault()`.
     */
    "splitter-resize": SplitterResizeEvent;
    /**
     * A splitter area has been collapsed. This event is only informative, it cannot be prevented by
     * calling `preventDefault()`.
     */
    "splitter-collapsed": SplitterCollapsedEvent;
    /**
     * The splitter wants to set new options. Event handlers can prevent changing the options by
     * calling `preventDefault()`.
     */
    "splitter-options": SplitterOptionsEvent;
}

/**
 * A Splitter component with two resizable areas. The splitter only ever has one active area, namely
 * the area whose size is being changed (`SplitterOptions.ActiveArea`). The opposite area fills the
 * remaining space of the splitter. Minimum sizes can be defined for both sides with numeric(!) CSS
 * length units. The size of the active area can also be defined programmatically in the constructor
 * or at any later point in time (like all other options). Splitters can be nested for more complex
 * layouts.
 *
 * The splitter always tries to set the size of both areas and a correct minimum size based on the
 * configured settings, but this can fail if the settings are too 'extreme'. This can happen in
 * particular if the minimum sizes (`StartMinSize`, `EndMinSize`) are very large or too large
 * compared to the size of the splitter itself or if the size of the active area plus the minimum
 * size of the opposite area is larger than splitters size itself. The calculated minimum sizes may
 * then 'destroy' the surrounding layout or lead to cut-off inner areas. However, the existing
 * splitter events (`splitter-resize`, `splitter-area-resize`) can be used to react to size changes
 * accordingly.
 *
 * If a splitter is changed (`options`, `mirror()`, `setEven`) _while it is not mounted in the DOM
 * or invisible (`display: none;`)_, these changes are 'recorded' internally and applied when the
 * splitter is mounted in the DOM again. This may not lead to the same result as if the splitter was
 * mounted in the DOM, and the application of the recorded changes may lead to a brief flicker on
 * repainting the splitter.
 */
export class Splitter<EventMap extends SplitterEventMap = SplitterEventMap> extends AElementComponentWithInternalUI<Div, EventMap> {
    protected _initialized = false;
    protected mountedOnce = false;
    protected tmpCSSStyleSheet?: CSSStyleSheet;
    protected tmpCSSClass?: string;
    protected _options: { -readonly [P in keyof SplitterOptions]: SplitterOptions[P]; } = {};
    protected recordedChanges: (SplitterOptions | "mirror" | "setEven")[] = [];
    protected applyingRecordedChanges = 0;
    protected start: Div;
    protected handle: Div;
    protected end: Div;
    protected activeArea: Div;
    protected activeAreaFixed: boolean;
    protected sizeProp: CSSPropertyNames = "width";
    protected minSizeProp: CSSPropertyNames = "minWidth";
    protected clientSizeProp: "clientWidth" | "clientHeight" = "clientWidth";
    protected startMinSize = 0;
    protected endMinSize = 0;
    protected activeAreaSize = 0;
    protected debouncedSplitterResize = getDebouncedFnc(this.onSplitterResize.bind(this), 16)[0];
    protected resizing = false;
    protected resizeStart: { X: number; Y: number; } = { X: 0, Y: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    protected resizeAreaSize = 0;
    protected resizeObserver: ResizeObserver;
    protected isRTL: boolean;
    protected geometry: SplitterGeometry = { Horizontal: true, Start: new DOMRect(), StartMinSize: 0, StartPercentage: 0, End: new DOMRect(), EndMinSize: 0, EndPercentage: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    protected listenerOptions: AddEventListenerOptions = { passive: false, capture: true }; // eslint-disable-line jsdoc/require-jsdoc
    protected realigning = false;
    protected fncSetEven = this.setEven.bind(this);
    protected fncOnPointerDown = this.onPointerDown.bind(this);
    protected fncOnPointerMove = this.onPointerMove.bind(this);
    protected fncOnPointerUp = this.onPointerUp.bind(this);
    // protected fncOnTouchStart = this.onTouchStart.bind(this);
    // protected fncOnTouchMove = this.onTouchMove.bind(this);
    // protected fncOnTouchEnd = this.onTouchEnd.bind(this);

    /**
     * Create Splitter component.
     * @param options The options for the splitter.
     * @param startContent The content (components or strings) to be added to the start area of the
     * splitter.
     * @param endContent The content (components or strings) to be added to the end area of the
     * splitter.
     */
    constructor(options: SplitterOptions = {}, startContent: FlowContents = [], endContent: FlowContents = []) {
        super();
        super
            .initialize(undefined, startContent, endContent)
            .on("animationend", (ev) => this.onAnimationEnd(ev))
            .options(options ?? this._options);
        this._initialized = true;
    }

    /**
     * Get/set the splitter options. The returned object is a _copy_, modifying this copy has no
     * effect on the corresponding splitter instance.
     */
    public get Options(): SplitterOptions {
        return {
            ...this._options,
        };
    }
    /** @inheritdoc */
    public set Options(v: SplitterOptions) {
        this.options(v);
    }

    /**
     * Sets new options for the splitter. If the splitter is currently being resized, the options
     * are ignored.
     * @see {@link SplitterOptions}
     * @param options The new splitter options.
     * @returns This instance.
     */
    public options(options: SplitterOptions) {
        if (this.resizing || (this._initialized && !this.dispatch(new SplitterOptionsEvent(this, options)))) {
            return this;
        }
        if (this._initialized && !this.isVisible()) {
            this.recordedChanges.push(options);
            return this;
        }
        const prevOptions = { ...this._options };
        this._options.State = options.State ?? this._options.State ?? SplitterState.ACTIVE;
        this._options.Collapsed = options.Collapsed ?? this._options.Collapsed ?? SplitterCollapsedState.NONE;
        this._options.Horizontal = options.Horizontal ?? this._options.Horizontal ?? true;
        this._options.ActiveArea = options.ActiveArea ?? this._options.ActiveArea ?? SplitterActiveArea.START;
        this._options.ActiveAreaSize = (options.ActiveAreaSize ?? this._options.ActiveAreaSize ?? "50%").trim();
        this._options.StartMinSize = (options.StartMinSize ?? this._options.StartMinSize ?? "10rem").trim();
        this._options.EndMinSize = (options.EndMinSize ?? this._options.EndMinSize ?? "10rem").trim();
        this.activeAreaFixed = !this._options.ActiveAreaSize.endsWith("%");
        this.activeAreaFixed
            ? this.addClass("fixed")
            : this.removeClass("fixed");
        if (prevOptions.State !== this._options.State) {
            this.setState();
        }
        if (prevOptions.StartMinSize !== this._options.StartMinSize || prevOptions.EndMinSize !== this._options.EndMinSize) {
            this.setMinSizes();
        }
        if (prevOptions.Horizontal !== this._options.Horizontal || prevOptions.ActiveArea !== this._options.ActiveArea) {
            this.realign();
        }
        if (prevOptions.ActiveAreaSize !== this._options.ActiveAreaSize) {
            this.setSize();
        }
        if (prevOptions.Collapsed !== this._options.Collapsed) {
            this.setCollapsed();
        }
        return this;
    }

    /**
     * Get the inner container that contains the components on the logical start side of the
     * splitter (left/top side with `dir="ltr"`, right/top side with `dir="rtl"`). This component
     * should never by styled, it must only be used to add/remove children!
     */
    public get Start(): IElementWithChildrenComponent<HTMLElement> {
        return this.start;
    }

    /**
     * Get the inner container that contains the components on the logical end side of the splitter
     * (right/bottom side with `dir="ltr"`, left/bottom side with `dir="rtl"`). This component
     * should never by styled, it must only be used to add/remove children!
     */
    public get End(): IElementWithChildrenComponent<HTMLElement> {
        return this.end;
    }

    /**
     * Get the splitters handle component. Care must be taken when modifying this component, as the
     * internal calculation of the splitter geometry is only based on `clientWidth`/`clientHeight`
     * and never on `offsetWidth`/`offsetHeight`!
     */
    public get Handle(): IElementWithChildrenComponent<HTMLElement> {
        return this.handle;
    }

    /**
     * Get the current splitter geometry. Modifying the returned object has no effect on the
     * splitter instance.
     * @see {@link SplitterGeometry}
     */
    public get Geometry(): SplitterGeometry {
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            ...this.geometry,
            Start: DOMRect.fromRect(this.geometry.Start),
            End: DOMRect.fromRect(this.geometry.End),
            /* eslint-enable */
        };
    }

    /**
     * Set both areas of the splitter to the same width/height.
     * @returns This instance.
     */
    public setEven(): this {
        if (!this.isVisible()) {
            this.recordedChanges.push("setEven");
            return this;
        }
        this.activeArea.style(
            this.sizeProp,
            this.activeAreaFixed
                ? (this._dom[this.clientSizeProp] - this.handle.DOM[this.clientSizeProp]) / 2 + "px"
                : "50%"
        );
        this.updateGeometry();
        return this;
    }

    /**
     * Mirrors the visual appearance of the splitter. This includes swapping the active area and
     * also the minimum sizes for both areas. Calling `mirror()` also changes the current options!
     * @returns This instance.
     */
    public mirror(): this {
        if (!this.isVisible()) {
            this.recordedChanges.push("mirror");
            return this;
        }
        // Update the sizes to get the size of the active area (in uncollapsed state).
        this.getAreaMinSizes();
        const mirroredSize = this.activeAreaFixed
            ? this.activeAreaSize + "px"
            : (this.activeAreaSize / this._dom[this.clientSizeProp]) * 100 + "%";
        this.options({
            /* eslint-disable jsdoc/require-jsdoc */
            ActiveArea: this._options.ActiveArea === SplitterActiveArea.START ? SplitterActiveArea.END : SplitterActiveArea.START,
            StartMinSize: this._options.EndMinSize,
            EndMinSize: this._options.StartMinSize
            /* eslint-enable */
        });
        this.activeArea.style(this.sizeProp, mirroredSize);
        this.updateGeometry();
        return this;
    }

    /**
     * Update the current splitter `geometry` object.
     */
    protected updateGeometry(): void {
        if (!this.isVisible()) {
            return;
        }
        this.geometry.Horizontal = this._options.Horizontal!;
        this.geometry.Start = getClientRect(this.start.DOM);
        this.geometry.StartMinSize = this.startMinSize;
        this.geometry.StartPercentage = this.start.DOM[this.clientSizeProp] / this._dom[this.clientSizeProp] * 100;
        this.geometry.End = getClientRect(this.end.DOM);
        this.geometry.EndMinSize = this.endMinSize;
        this.geometry.EndPercentage = (this._dom[this.clientSizeProp] - this.handle.DOM[this.clientSizeProp] - this.start.DOM[this.clientSizeProp]) / this._dom[this.clientSizeProp] * 100;
    }

    /**
     * Get and store the current minimum sizes in pixels of both areas and also the size of the
     * active area. An ugly hack, but it seems to work.
     */
    protected getAreaMinSizes(): void {
        if (!this.isVisible()) {
            return;
        }
        const div = new Div()
            .hidden(true)
            .style("position", "relative");
        this.ui.append(div);
        div.style(this.minSizeProp, this._options.StartMinSize, true);
        this.startMinSize = parseFloat((<string>getComputedStyle(div.DOM)[this.sizeProp]).slice(0, -2));
        div.style(this.minSizeProp, this._options.EndMinSize, true);
        this.endMinSize = parseFloat((<string>getComputedStyle(div.DOM)[this.sizeProp]).slice(0, -2));
        div.style(this.minSizeProp, <string>this.activeArea.Style[this.sizeProp], true);
        this.activeAreaSize = parseFloat((<string>getComputedStyle(div.DOM)[this.sizeProp]).slice(0, -2));
        this.ui.remove(div);
    }

    /**
     * Set the minimum size of the splitter component.
     */
    protected setSplitterMinSize(): void {
        if (!this.isVisible()) {
            return;
        }
        const activeAreaPercentage = this.activeArea.Style.width.endsWith("%");
        const handleSize = this.handle.DOM[this.clientSizeProp];
        const oppositeMinSize = this._options.ActiveArea === SplitterActiveArea.START
            ? this.endMinSize
            : this.startMinSize;
        let minsize: number;
        if (this._options.ActiveArea === SplitterActiveArea.START && this.start.Style.minWidth.endsWith("%") && activeAreaPercentage
            || this._options.ActiveArea === SplitterActiveArea.END && this.end.Style.minWidth.endsWith("%") && activeAreaPercentage) {
            const percentage = parseFloat(this.activeArea.Style.width.slice(0, -1));
            minsize = 100 / (100 - percentage) * oppositeMinSize + handleSize;
        } else {
            // minsize = this.activeArea.DOM[this.clientSizeProp] + oppositeMinSize + handleSize;
            minsize = this.activeAreaSize + oppositeMinSize + handleSize;
        }
        this.style({
            /* eslint-disable jsdoc/require-jsdoc */
            [this._options.Horizontal ? "minHeight" : "minWidth"]: null,
            [this.minSizeProp]: minsize + "px"
            /* eslint-enable */
        });
    }

    /**
     * Set the state of the splitter.
     */
    protected setState(): void {
        this.removeClass("inactive", "off");
        if (this._options.State === SplitterState.INACTIVE) {
            this.addClass("inactive");
        } else if (this._options.State === SplitterState.OFF) {
            this.addClass("off");
        }
        this.updateGeometry();
    }

    /**
     * Set the current minimum sizes of all parts.
     */
    protected setMinSizes(): void {
        if (!this.isVisible()) {
            this.start.style(this.minSizeProp, this._options.StartMinSize);
            this.end.style(this.minSizeProp, this._options.EndMinSize);
            return;
        }
        const prevStartMinSize = this.startMinSize;
        const prevEndMinSize = this.endMinSize;
        this.getAreaMinSizes();
        this.start.style(this.minSizeProp, this._options.StartMinSize);
        this.end.style(this.minSizeProp, this._options.EndMinSize);
        this.setSplitterMinSize();
        // Update the style of the active area if one of the minimum sizes has become larger. Only
        // necessary if resizing is based on absolute values.
        if (this.activeAreaFixed && (this.startMinSize > prevStartMinSize || this.endMinSize > prevEndMinSize)) {
            this.activeArea.style(
                this.sizeProp,
                <string>getComputedStyle(this.activeArea.DOM)[this.sizeProp]
            );
        }
        this.updateGeometry();
    }

    /**
     * Realign the splitter if its alignment is changed.
     */
    protected realign(): void {
        this.realigning = true;
        const isActiveAreaStart = this._options.ActiveArea === SplitterActiveArea.START;
        this.activeArea = isActiveAreaStart
            ? this.start
            : this.end;
        this
            .removeClass("active-area-start", "active-area-end")
            .addClass(isActiveAreaStart ? "active-area-start" : "active-area-end");
        [this.start, this.end].forEach((e) => {
            e.style({
                /* eslint-disable jsdoc/require-jsdoc */
                width: null,
                height: null,
                minWidth: null,
                minHeight: null
                /* eslint-enable */
            });
        });
        if (this._options.Horizontal) {
            this.replaceClass("vertical", "horizontal");
            this.sizeProp = "width";
            this.minSizeProp = "minWidth";
            this.clientSizeProp = "clientWidth";
        } else {
            this.replaceClass("horizontal", "vertical");
            this.sizeProp = "height";
            this.minSizeProp = "minHeight";
            this.clientSizeProp = "clientHeight";
        }
        this.start.style(this.minSizeProp, this._options.StartMinSize);
        this.end.style(this.minSizeProp, this._options.EndMinSize);
        // Set sizes based on the previous relative sizes.
        isActiveAreaStart
            ? this.start.style(this.sizeProp, this.geometry.StartPercentage + "%")
            : this.end.style(this.sizeProp, this.geometry.EndPercentage + "%");
        // Recalculate and set minimum sizes.
        if (this.isVisible()) {
            this.getAreaMinSizes();
            this.setSplitterMinSize();
            // Switch size style to absolute, if necessary.
            if (this.activeAreaFixed) {
                isActiveAreaStart
                    ? this.start.style(this.sizeProp, this.start.DOM[this.clientSizeProp] + "px")
                    : this.end.style(this.sizeProp, this.end.DOM[this.clientSizeProp] + "px");
            }
            this.updateGeometry();
        }
        this.realigning = false;
    }

    /**
     * Set the size of the active area.
     */
    protected setSize(): void {
        this.activeArea.style(this.sizeProp, this._options.ActiveAreaSize);
        if (!this.isVisible()) {
            return;
        }
        this.getAreaMinSizes();
        this.setSplitterMinSize();
        this.updateGeometry();
    }

    /**
     * Collapse/uncollapse splitter areas.
     */
    protected setCollapsed(): void {
        // Do nothing if the element hasn't been mounted once.
        if (!this.mountedOnce) {
            return;
        }
        // Both classes are set _after_ the CSS animation finished so `this._options` can't be used.
        const isStartCollapsed = this.hasClass("start-collapsed");
        const isEndCollapsed = this.hasClass("end-collapsed");
        this
            .removeClass(
                "start-collapsing",
                "start-uncollapsing",
                "start-collapsed",
                "end-collapsing",
                "end-uncollapsing",
                "end-collapsed"
            );
        // Skip animations, if the splitter only switches between collapsed states.
        if (this._options.Collapsed !== SplitterCollapsedState.NONE && (isStartCollapsed || isEndCollapsed)) {
            this.addClass(
                isStartCollapsed
                    ? "end-collapsed"
                    : "start-collapsed"
            );
            this._initialized && this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed!));
        } else if (this._options.Collapsed === SplitterCollapsedState.NONE) {
            this.ui.insert(this.end, this.handle);
            // Only use animations if the splitter is visible and isn't applying recorded changes.
            if (this.isVisible() && this.applyingRecordedChanges === 0) {
                if (isStartCollapsed) {
                    this.addClass("start-uncollapsing");
                } else if (isEndCollapsed) {
                    this.addClass("end-uncollapsing");
                }
            } else {
                this._initialized && this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed));
            }
        } else {
            this.ui.remove(this.handle);
            // Only use animations if the splitter is visible and isn't applying recorded changes.
            if (this.isVisible() && this.applyingRecordedChanges === 0) {
                this.addClass(
                    this._options.Collapsed === SplitterCollapsedState.START
                        ? "start-collapsing"
                        : "end-collapsing"
                );
            } else {
                this.addClass(
                    this._options.Collapsed === SplitterCollapsedState.START
                        ? "start-collapsed"
                        : "end-collapsed"
                );
                this._initialized && this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed!));
            }
        }
        this.updateGeometry();
    }

    /**
     * Apply all modifications which have been made while the splitter wasn't mounted to the DOM.
     */
    protected applyRecordedChanges(): void {
        if (this.recordedChanges.length === 0 || !this.isVisible()) {
            return;
        }
        this.applyingRecordedChanges++;
        try {
            for (const opts of this.recordedChanges) {
                if (opts === "mirror") {
                    this.mirror();
                } else if (opts === "setEven") {
                    this.setEven();
                } else {
                    this.options(opts);
                }
            }
        } finally {
            this.recordedChanges.length = 0;
            this.applyingRecordedChanges--;
        }
    }

    /**
     * Set new minimum sizes if the splitter component has been resized.
     */
    protected onSplitterResize(): void {
        requestAnimationFrame(() => {
            if (this.mountedOnce) {
                this.setMinSizes();
                this.applyRecordedChanges();
                this.emit(new SplitterResizeEvent(this));
            } else {
                this.updateGeometry();
                if (this._options.Collapsed !== SplitterCollapsedState.NONE) {
                    this.ui.remove(this.handle);
                    this._options.Collapsed === SplitterCollapsedState.START
                        ? this.addClass("start-collapsed")
                        : this.addClass("end-collapsed");
                }
                this.removeClass(this.tmpCSSClass);
                this.mountedOnce = true;
                queueMicrotask(() => {
                    const index = document.adoptedStyleSheets.indexOf(this.tmpCSSStyleSheet!);
                    index !== -1 && document.adoptedStyleSheets.splice(index, 1);
                    delete this?.tmpCSSStyleSheet;
                    delete this?.tmpCSSClass;
                    this.getAreaMinSizes();
                });
            }
        });
    }

    /**
     * Handle the `pointerdown` event on the handle.
     * @param ev The pointer event.
     */
    protected onPointerDown(ev: PointerEvent): void {
        if (this._options.State || this.resizing || !this.dispatch(new SplitterAreaResizeStartEvent(this))) {
            return;
        }
        ev.preventDefault();
        ev.stopImmediatePropagation();
        this.handle.DOM.setPointerCapture(ev.pointerId);
        this.handle.on("pointermove", this.fncOnPointerMove, this.listenerOptions);
        this.onStartResize(ev);
    }

    /**
     * Handle the `pointermove` event on the handle.
     * @param ev The pointer event.
     */
    protected onPointerMove(ev: PointerEvent): void {
        if (!this.resizing) {
            return;
        }
        ev.preventDefault();
        ev.stopImmediatePropagation();
        this.onResize(ev);
    }

    /**
     * Handle the `pointerup` event on the handle.
     * @param ev The pointer event.
     */
    protected onPointerUp(ev: PointerEvent): void {
        if (!this.resizing) {
            return;
        }
        this.handle.DOM.releasePointerCapture(ev.pointerId);
        this.handle.off("pointermove", this.fncOnPointerMove, this.listenerOptions);
        this.onResizeEnd();
    }

    /**
     * Start dragging the handle.
     * @param ev The pointer event or touch.
     */
    protected onStartResize(ev: PointerEvent | Touch): void {
        this.resizing = true;
        this.addClass("resizing");
        this.resizeStart.X = ev.clientX;
        this.resizeStart.Y = ev.clientY;
        this.resizeAreaSize = this.activeArea.DOM[this.clientSizeProp];
        this.isRTL = getComputedStyle(this._dom).direction === "rtl";
    }

    /**
     * Drag the handle.
     * @param ev The pointer event or touch.
     */
    protected onResize(ev: PointerEvent | Touch): void {
        const isActiveAreaStart = this._options.ActiveArea === SplitterActiveArea.START;
        const minSize = isActiveAreaStart
            ? this.startMinSize
            : this.endMinSize;
        const oppositeMinSize = this._options.ActiveArea === SplitterActiveArea.START
            ? this.endMinSize
            : this.startMinSize;
        const f1 = isActiveAreaStart
            ? 1
            : -1;
        const f2 = this.isRTL && this._options.Horizontal
            ? -1
            : 1;
        const dist = this._options.Horizontal
            ? f1 * (ev.clientX - this.resizeStart.X)
            : f1 * (ev.clientY - this.resizeStart.Y);
        const newSize = Math.max(minSize, Math.min((this.resizeAreaSize + f2 * dist), this._dom[this.clientSizeProp] - this.handle.DOM[this.clientSizeProp] - oppositeMinSize));
        if (this.dispatch(new SplitterAreaResizeEvent(this, newSize))) {
            this.activeArea.style(
                this.sizeProp,
                this.activeAreaFixed
                    ? newSize + "px"
                    : newSize / this._dom[this.clientSizeProp] * 100 + "%"
            );
        }
    }

    /**
     * Stop dragging the handle.
     */
    protected onResizeEnd(): void {
        this.getAreaMinSizes();
        this.setSplitterMinSize();
        this.updateGeometry();
        this.removeClass("resizing");
        this.resizing = false;
        this.emit(new SplitterAreaResizeEndEvent(this));
    }

    /**
     * Handle animation events.
     * @param ev The animation event to be handled.
     */
    protected onAnimationEnd(ev: AnimationEvent): void {
        if (
            (ev.target !== this.start.DOM && ev.target !== this.end.DOM)
            || !["hsplitter-to-0", "hsplitter-to-100", "hsplitter-from-0-to-previous", "hsplitter-from-100-to-previous",
                "vsplitter-to-0", "vsplitter-to-100", "vsplitter-from-0-to-previous", "vsplitter-from-100-to-previous"]
                .includes(ev.animationName)
        ) {
            return;
        }
        this.removeClass("start-collapsed", "start-collapsing", "start-uncollapsing", "end-collapsed", "end-collapsing", "end-uncollapsing");
        if (this._options.Collapsed === SplitterCollapsedState.START) {
            this.addClass("start-collapsed");
        } else if (this._options.Collapsed === SplitterCollapsedState.END) {
            this.addClass("end-collapsed");
        }
        this.updateGeometry();
        this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed!));
    }

    /**
     * Checks, if the splitter is visible (allows the inspection of DOM elements).
     * @returns `true`, if the splitter is visible, otherwise `false`.
     */
    protected isVisible(): boolean {
        return this.DOM.checkVisibility();
    }

    /**
     * Build UI of the component.
     * @param startContent An array of components to be added to the start area of the splitter.
     * @param endContent An array of components to be added to the end area of the splitter.
     * @returns This instance.
     */
    protected buildUI(startContent: FlowContents, endContent: FlowContents) {
        this.tmpCSSClass = "r" + Math.floor(Math.random() * 1000000);
        this.tmpCSSStyleSheet = new CSSStyleSheet();
        this.tmpCSSStyleSheet.insertRule(`.${this.tmpCSSClass} {visibility: hidden !important;}`);
        document.adoptedStyleSheets.push(this.tmpCSSStyleSheet);
        this.ui = new Div()
            .addClass("horizontal", "active-area-start", this.tmpCSSClass)
            .addClass("horizontal", "active-area-start")
            .append(
                this.start = new Div()
                    .addClass("start")
                    .append(...startContent),
                this.handle = new Div()
                    .addClass("handle")
                    .append(new Div())
                    .on("dblclick", this.fncSetEven)
                    .on("pointerdown", this.fncOnPointerDown, this.listenerOptions)
                    .on("pointerup", this.fncOnPointerUp, this.listenerOptions),
                // .on("touchstart", this.fncOnTouchStart, this.listenerOptions)
                // .on("touchend", this.fncOnTouchEnd, this.listenerOptions)
                // .on("touchcancel", this.fncOnTouchEnd, this.listenerOptions),
                this.end = new Div()
                    .addClass("end")
                    .append(...endContent)
            );
        this.activeArea = this.start;
        this.resizeObserver = new ResizeObserver((entries => {
            if (this.isVisible()) {
                for (const entry of entries) {
                    // Set the minimum sizes and the size of the active area on resizing.
                    if (entry.target === this.ui.DOM && !this.realigning) {
                        void this.debouncedSplitterResize();
                        // this.onSplitterResize();
                        break;
                    }
                }
            }
        }));
        this.resizeObserver.observe(this.ui.DOM);
        return this;
    }

    /**
     * Handle the `touchstart` event on the handle.
     * @param ev The touch event.
     */
    // protected onTouchStart(ev: TouchEvent): void {
    //     if (this._options.Locked || this.resizing || !this.dispatch(new SplitterAreaResizeStartEvent(this))) {
    //         return;
    //     }
    //     if (ev.touches[0]) {
    //         ev.preventDefault();
    //         ev.stopImmediatePropagation();
    //         this.Start.append(new P("touch"));
    //         this.handle.on("touchmove", this.fncOnTouchMove, this.listenerOptions);
    //         this.onStartResize(ev.touches[0]);
    //     }
    // }

    /**
     * Handle the `touchmove` event on the handle.
     * @param ev The touch event.
     */
    // protected onTouchMove(ev: TouchEvent): void {
    //     if (!this.resizing) {
    //         return;
    //     }
    //     if (ev.touches[0]) {
    //         ev.preventDefault();
    //         ev.stopImmediatePropagation();
    //         this.onResize(ev.touches[0]);
    //     }
    // }

    /**
     * Handle the `touchend` event on the handle.
     * @param _ev The touch event.
     */
    // protected onTouchEnd(_ev: TouchEvent): void {
    //     if (!this.resizing) {
    //         return;
    //     }
    //     this.handle.off("touchmove", this.fncOnTouchMove, this.listenerOptions);
    //     this.onResizeEnd();
    // }
}

/**
 * Factory for `Splitter` components.
 */
export class SplitterFactory<T> extends ComponentFactory<Splitter> {
    /**
     * Create, set up and return Splitter component.
     * @param options The options for the splitter.
     * @param startContent The content (components or strings) to be added to the start area of the
     * splitter.
     * @param endContent The content (components or strings) to be added to the end area of the
     * splitter.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Splitter component.
     */
    public splitter(options: SplitterOptions = {}, startContent: FlowContents = [], endContent: FlowContents = [], data?: T): Splitter {
        return this.setupComponent(new Splitter(options, startContent, endContent), data);
    }
}

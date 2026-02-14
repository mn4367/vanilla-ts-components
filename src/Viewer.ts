import { ACustomComponentEvent, AElementComponentWithInternalUI, AnyType, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, INodeComponent } from "@vanilla-ts/core";
import { Div, Img, RangeInput, Span } from "@vanilla-ts/dom";
import { IconButton, IconButtonOptions } from "./IconButton.js";
import { PINCH_ZOOM_START, PINCH_ZOOM_STOP, PinchZoomEvent, PinchZoomGestureHandler } from "./PinchZoomGestureHandler.js";
import { ScrollContainer } from "./ScrollContainer.js";
import { ISteppable, IStepper, Stepper, StepperAppearance, StepperOptions } from "./Stepper.js";
import { Throbber } from "./Throbber.js";


/**
 * Options for instances of `Viewer`. The options are used to initialize the viewer _and_ they can
 * be used to completely re-configure an existing instance of a viewer. All options properties are
 * optional, missing properties are replaced by their defaults (when using `new Viewer(options)`) or
 * by the values already existing in the viewers options (when reconfiguring a viewer instance).
 * @example
 * ```typescript
 * // Get a viewer instance and display image 'Img05.svg' initally.
 * const viewer = new Viewer({
 *   Items: ["Img01.png", "Img02.png", "Img03.jpg", "Img05.svg"]
 * }, 3)
 *
 * // Always show the toolbar, enable handling of pinch zoom gestures and use native scroll bars.
 * viewer.options({
 *   ToolbarHidden: false,
 *   PinchZoom: true,
 *   NativeScrollbars: true
 * });
 *
 * // Display image 'Img03.jpg' (equivalent to `viewer.Index = 2` or `viewer.index(2)`).
 * viewer.options({}, 2)
 *
 * // Remove all existing items from the viewer, add the image 'Img06.gif', show the toolbar only
 * // when hovering over it at the end of the viewer (right in 'ltr' direction, left in 'rtl'
 * // direction), disable the handling of pinch zoom gestures and display 'Img06.gif' at `200%`
 * // magnification).
 * viewer.options({
 *   Items: ["Img06.gif"],
 *   ToolbarPosition: ToolbarPosition.END,
 *   ToolbarHidden: true,
 *   Zoom: Z200,
 *   PinchZoom: false
 * });
 *
 * // Prepare the viewer for use on a mobile device. Here, the toolbar in the viewer is omitted, so
 * // that scrolling through the images must be done elsewhere using the viewer's `IStepper`
 * // interface, for example with separate buttons that call `viewer.First()`, `viewer.Forward()`
 * // etc. themselves.
 * viewer.options({
 *   Items: ["Img01.png", "Img02.png", "Img03.jpg", "Img05.svg"]
 *   OmitToolbar: true,
 *   PinchZoom: true
 * });
 *
 * // Set new images on the viewer. The zoom level of the image with the URL `Img02.png` is set to
 * // `Zoom.FITWIDTH` so that it fits the width of the viewer, the scaling of the image with the URL
 * // `Img03.jpg` is set to an initialvalue of `1.5` and is scrolled so that its lower right corner
 * // is visible.
 * viewer.options({
 *   Items: [
 *     "Img01.png",
 *     { URL: "Img02.png", Zoom: Zoom.FITWIDTH },
 *     { URL: "Img03.jpg", Scale: 1.5, ScrollPos: new DOMPoint(100000, 100000) },
 *     "Img05.svg"
 *   ]
 * });
 *
 * // Show only the current item index and the current zoom level in the toolbar, extract the
 * // stepper component and the zoom range component (to be mounted in `someOtherComponent`) and
 * // only display the `Forward` and `Backward` stepper buttons (mounted in `someOtherComponent`).
 * viewer.options({
 *   ToolbarElements: [ToolbarElement.ITEM_INDEX, ToolbarElement.ZOOM_LEVEL],
 *   StepperOptions: {
 *     First: false,
 *     PageBackward: false,
 *     Backward: true,
 *     Forward: true,
 *     PageForward: false,
 *     Last: false
 *   },
 * });
 * someOtherComponent.append(
 *   viewer.borrowStepper(),
 *   viewer.borrowZoomRange()
 * );
 * ```
 */
export interface ViewerOptions {
    /**
     * An array of elements that are to be displayed in the toolbar. The array defines which
     * elements appear in the toolbar and in which order.\
     * Default: `[ToolbarElement.STEPPER, ToolbarElement.ZOOM_IN_OUT, ToolbarElement.ZOOM_FIT, ToolbarElement.ITEM_INDEX, ToolbarElement.ZOOM_LEVEL, ToolbarElement.ZOOM_RANGE]`.
     */
    ToolbarElements?: Array<ToolbarElement>;
    /**
     * If `true`, the viewer will never show a toolbar. This can be helpful when using the viewer on
     * a mobile device where the toolbar would be to small. Scrolling through the images must be
     * done elsewhere using the viewer's `IStepper` interface, for example with separate buttons
     * that call `viewer.First()`, `viewer.Forward()` etc. themselves.\
     * Default: `false`.
     */
    OmitToolbar?: boolean;
    /**
     * The position of the toolbar.\
     * Default: `ToolbarPosition.TOP`.
     */
    ToolbarPosition?: ToolbarPosition;
    /**
     *  `true` if the toolbar is hidden, otherwise `false`. If `true` and `OmitToolbar` is `false`,
     * the viewer is expected to somehow indicate where the toolbar can be revealed byhovering, e.g.
     * by a colored border at the edge of the viewer where the toolbar is placed
     * (`ToolbarPosition`). \
     * Default: `false`.
     */
    ToolbarHidden?: boolean;
    /**
     * Options for the stepper (also allows the localization of the stepper).\
     * __Note:__ The `Appearance` is always overridden depending on the position of the toolbar.
     * For the toolbar positions `TOP` and `BOTTOM` the stepper appearance is `HORIZONTAL` by
     * default while for the positions `START` and `END` it is `VERTICAL` by default. Both defaults
     * can be set to `HORIZONTAL_ALT`/`VERTICAL_ALT` with `StepperApperanceHorizontalAlt` and
     * `StepperApperanceVerticalAlt` (see below).\
     * Default: The default options of the stepper component.
     * @see {@link Stepper}
     */
    StepperOptions?: StepperOptions;
    /**
     * Set the stepper appearance to `HORIZONTAL_ALT` for the toolbar positions `TOP` and `BOTTOM`.\
     * Default: `false`.
     */
    StepperApperanceHorizontalAlt?: boolean;
    /**
     * Set the stepper appearance to `VERTICAL_ALT` for the toolbar positions `START` and `END`.\
     * Default: `false`.
     */
    StepperApperanceVerticalAlt?: boolean;
    /**
     * The initial predefined zoom setting for items that are _added to the viewer_.\
     * Default: `Zoom.Fit`.
     * @see {@link Zoom}
     */
    Zoom?: Zoom;
    /**
     * An array of items to be displayed in the viewer. If an array element is of type `string`
     * the element must denote a valid URL. Otherwise, the element must be an object
     * that has at least the propertiy `URL`. If `Items` is an empty array, no toolbar is shown.\
     * Default: `[]`.
     */
    Items?: (string | {
        /** The URL of the item. */
        URL: string;
        /**
         * The initial zoom level of the item. If `Zoom` is set and not `Zoom.ZOTHER` it always
         * takes precedence over `Scale` (`Scale` is set to `0` in this case).
         */
        Zoom?: Zoom;
        /**
         * The initial magnification level of the item. This value is only used if `Zoom` is not set
         * or is set to `Zoom.ZOTHER`, otherwise it is ignored.
         */
        Scale?: number;
        /** The initial scroll position of the item in its container. */
        ScrollPos?: DOMPoint;
    })[];
    /**
     * Support pinch zoom gestures.\
     * Default: `false`.
     * @see {@link PinchZoomGestureHandler}
     */
    PinchZoom?: boolean;
    /**
     * Use native scroll bars in the viewer. For mobile devices this should be `true`.\
     * Default: `false`.
     */
    NativeScrollbars?: boolean;
    /**
     * Locale used for formatting strings like the percentage of the current magnification level.\
     * Default: `navigator.language`.
     */
    Locale?: string;
    /**
     * Options for the button 'Zoom in'.\
     * Default: `{ IconStart: null, Caption: [], IconEnd: null, Title: null, Horizontal: true }`.
     */
    ZoomInBtnOptions?: IconButtonOptions;
    /**
     * Options for the button 'Zoom out'.\
     * Default: same as {@link ViewerOptions.ZoomInBtnOptions}
     */
    ZoomOutBtnOptions?: IconButtonOptions;
    /**
     * Options for the button 'Fit'.\
     * Default: same as {@link ViewerOptions.ZoomInBtnOptions}
     */
    ZoomFitBtnOptions?: IconButtonOptions;
    /**
     * Options for the button 'Fit width'.\
     * Default: same as {@link ViewerOptions.ZoomInBtnOptions}
     */
    ZoomFitWidthBtnOptions?: IconButtonOptions;
    /**
     * Options for the button 'Fit height'.\
     * Default: same as {@link ViewerOptions.ZoomInBtnOptions}
     */
    ZoomFitHeightBtnOptions?: IconButtonOptions;
    /** Title/tooltip for the zoom range input. Default: empty string. */
    ZoomRange?: string;
    /**
     * Title/tooltip and `alt` attribute for items which couldn't be loaded. Any occurence of the
     * string `%s` in `LoadingError` is replaced with the URL of the item, e.g the value
     * `Item '%s' couldn't be loaded!` would resolve to `Item 'img07.png' couldn't be loaded!` for
     * an item with the URL `img07.png`.
     */
    LoadingError?: string;
}

/** Possible elements in the Toolbar. */
export enum ToolbarElement {
    /** Stepper component. */
    STEPPER = "S",
    /** 'Zoom in/out' buttons. */
    ZOOM_IN_OUT = "Z",
    /** 'Zoom fit/fit width/fit height' buttons. */
    ZOOM_FIT = "F",
    /** Current item index component. */
    ITEM_INDEX = "I",
    /** Current zoom level component. */
    ZOOM_LEVEL = "L",
    /** Current zoom range component. */
    ZOOM_RANGE = "R",
}

/** Position of the toolbar. */
export enum ToolbarPosition {
    TOP = "top",
    END = "end",
    BOTTOM = "bottom",
    START = "start"
}

/** Predefined zoom levels for items in the viewer. */
export enum Zoom {
    FIT = "fit",
    FITWIDTH = "fit-width",
    FITHEIGHT = "fit-height",
    Z10 = "z10",
    Z25 = "z25",
    Z50 = "z50",
    Z75 = "z75",
    Z100 = "z100",
    Z125 = "z125",
    Z150 = "z150",
    Z175 = "z175",
    Z200 = "z200",
    Z250 = "z250",
    Z300 = "z300",
    Z350 = "z350",
    Z400 = "z400",
    /** Readonly, indicates that none of the predefined zoom levels is set. */
    ZOTHER = "zother"
}

/** Current properties of an item (internally used). */
interface IViewerItem {
    /** The URL of the item. */
    URL: string;
    /** An `Img` component. */
    Component?: Img;
    /** A `Throbber` component. */
    Throbber?: Throbber;
    /** The current zoom level of the item. */
    Zoom: Zoom;
    /** The current magnification level of the item. */
    Scale: number;
    /** The scroll position of the item in its container. */
    ScrollPos: DOMPoint;
    /** `true`, if the item has been loaded, otherwise `false`. */
    Loaded: boolean;
    /** `true`, if an error occured on loading the item, otherwise `false`. */
    LoadError: boolean;
}

/** Public properties of an item. */
export interface ViewerItem extends Readonly<Omit<IViewerItem, "Component" | "Throbber">> { }

/** Custom 'viewer-step' event for viewers. */
export class ViewerStepEvent extends ACustomComponentEvent<"viewer-step", Viewer, {
    /** The new index to be stepped to in the viewer object. */
    Index: number;
}> {
    /**
     * Create ViewerStepEvent event.
     * @param sender The event emitter (always `Viewer`).
     * @param index The new index to which the current index in the viewer is to be moved.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Viewer, index: number, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("viewer-step", sender, { Index: index }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'viewer-stepped' event for viewers. */
export class ViewerSteppedEvent extends ACustomComponentEvent<"viewer-stepped", Viewer, {
    /** The new index in the viewer object. */
    Index: number;
}> {
    /**
     * Create ViewerSteppedEvent event.
     * @param sender The event emitter (always `Viewer`).
     * @param index The new index of the viewer.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Viewer, index: number, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("viewer-stepped", sender, { Index: index }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'viewer-scroll' event for viewers. */
export class ViewerScrollEvent extends ACustomComponentEvent<"viewer-scroll", Viewer, {
    /** The index of the current item in the viewer. */
    Index: number;
    /** The new scroll offset in the viewer. */
    ScrollOffset: { X: number; Y: number; }; // eslint-disable-line jsdoc/require-jsdoc
}> {
    /**
     * Create ViewerScrollEvent event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Viewer`).
     * @param index The index of the current item in the viewer.
     * @param offsetX The horizontal scroll offset in the viewer.
     * @param offsetY The vertical scroll offset in the viewer.
     * @param customEventInitDict Optional event properties.
     */
    /* */
    constructor(sender: Viewer, index: number, offsetX: number, offsetY: number, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) { // eslint-disable-line jsdoc/require-jsdoc
        super("viewer-scroll", sender, { Index: index, ScrollOffset: { X: offsetX, Y: offsetY } }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'viewer-zoom' event for viewers. */
export class ViewerZoomEvent extends ACustomComponentEvent<"viewer-zoom", Viewer, {
    /** The index of the current item in the viewer. */
    Index: number;
    /** The new zoom level in the viewer. */
    Zoom: Zoom;
    /** The new magnification level in the viewer. */
    Scale: number;
}> {
    /**
     * Create ViewerZoomEvent event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Viewer`).
     * @param index The index of the current item in the viewer.
     * @param zoom The zoom level in the viewer.
     * @param scale The magnification level in the viewer.
     * @param customEventInitDict Optional event properties.
     */
    /* */
    constructor(sender: Viewer, index: number, zoom: Zoom, scale: number, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) { // eslint-disable-line jsdoc/require-jsdoc
        super("viewer-zoom", sender, { Index: index, Zoom: zoom, Scale: scale }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `Viewer`. */
export interface ViewerEventMap extends HTMLElementEventMap {
    /**
     * The viewer wants to display an item at a new index. Event handlers can prevent changing the
     * index by calling `preventDefault()`.
     */
    "viewer-step": ViewerStepEvent;
    /**
     * The viewer has changed its index. This event is purely informative and can't be cancelled.
     */
    "viewer-stepped": ViewerSteppedEvent;
    /**
     * The viewer has changed its scroll position. This event is purely informative and can't be
     * cancelled.
     */
    "viewer-scroll": ViewerScrollEvent;
    /**
     * The viewer has changed its zoom level/magnification level. This event is purely informative
     * and can't be cancelled.
     */
    "viewer-zoom": ViewerZoomEvent;
}

/** A transparent GIF image with one pixel. */
const IMAGE_ONE_PIXEL_TRANSPARENT = "data:image/gif;base64,R0lGODlhAQABAIABAP///////yH5BAUKAAEALAAAAAABAAEAAAICTAEAOw==";

/**
 * Component for displaying items. Currently items must be of type image (everything that the `img`
 * tag can display, e.g. JPEG, PNG, ...), future versions may also support other media types.
 */
export class Viewer<EventMap extends ViewerEventMap = ViewerEventMap> extends AElementComponentWithInternalUI<Div, EventMap> implements ISteppable, IStepper {
    protected _options: ViewerOptions = {};
    protected item: IViewerItem;
    protected dummyItem: IViewerItem = this.getDummyItem();
    protected items: IViewerItem[] = [];
    protected toolBar: Div;
    protected stepper: Stepper;
    protected stepperBorrowed: boolean = false;
    protected zoomInOut: Div;
    protected zoomInOutBorrowed: boolean = false;
    protected btnZoomIn: IconButton;
    protected btnZoomOut: IconButton;
    protected zoomFit: Div;
    protected zoomFitBorrowed: boolean = false;
    protected btnZoomFit: IconButton;
    protected btnZoomFitWidth: IconButton;
    protected btnZoomFitHeight: IconButton;
    protected itemIndex: Span;
    protected itemIndexBorrowed: boolean = false;
    protected zoomLevel: Span;
    protected zoomLevelBorrowed: boolean = false;
    protected zoomRange: RangeInput;
    protected zoomRangeBorrowed: boolean = false;
    protected itemContainer: ScrollContainer;
    protected itemResizeObserver: ResizeObserver;
    protected fncOnItemContainerScroll = this.onItemContainerScroll.bind(this);
    protected clickPoint: DOMPoint;
    protected pinchZoomHandler: PinchZoomGestureHandler;
    protected pinchZoomStartScale: number;
    protected fncOnPinchZoom = this.onPinchZoom.bind(this);
    protected lastDisplayState: { Zoom: Zoom; Scale: number; ScrollPos: DOMPoint; } = { Zoom: Zoom.ZOTHER, Scale: -Infinity, ScrollPos: new DOMPoint(0, 0) }; // eslint-disable-line jsdoc/require-jsdoc
    // #pointerDot: Div;

    /**
     * Create viewer component.
     * @param options Options for the viewer.
     */
    constructor(options?: ViewerOptions) {
        super();
        this
            .initialize()
            .options(options ?? this._options);
    }

    /**
     * Get/set the options for this viewer. The returned object is a _copy_, modifying this copy has
     * no effect on the corresponding viewer instance.
     */
    public get Options(): ViewerOptions {
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            ...this._options,
            Items: [...this._options.Items!],
            StepperOptions: this.stepper.Options,
            ZoomInBtnOptions: this.btnZoomIn.Options,
            ZoomOutBtnOptions: this.btnZoomOut.Options,
            ZoomFitBtnOptions: this.btnZoomFit.Options,
            ZoomFitWidthBtnOptions: this.btnZoomFitWidth.Options,
            ZoomFitHeightBtnOptions: this.btnZoomFitHeight.Options,
            /* eslint-enable */
        };
    }
    /** @inheritdoc */
    public set Options(v: ViewerOptions) {
        this.options(v);
    }

    /**
     * Set the options for this viewer. See also the documentation for `ViewerOptions`.
     * @param options Options for this viewer.
     * @param index The index of the item to be displayed. If there is no item for the specified
     * `index` or if `index` is `undefined`, the last active item is displayed. If the last item is
     * no longer available because it has been disposed of by setting new items, the first item is
     * displayed (if available, otherwise the viewer is empty).
     * @returns This instance.
     */
    public options(options: ViewerOptions, index?: number): this {
        const opts: ViewerOptions = {
            /* eslint-disable jsdoc/require-jsdoc */
            ToolbarElements: options.ToolbarElements ?? this._options.ToolbarElements ?? [ToolbarElement.STEPPER, ToolbarElement.ZOOM_IN_OUT, ToolbarElement.ZOOM_FIT, ToolbarElement.ITEM_INDEX, ToolbarElement.ZOOM_LEVEL, ToolbarElement.ZOOM_RANGE],
            OmitToolbar: options.OmitToolbar ?? this._options.OmitToolbar ?? false,
            ToolbarPosition: options.ToolbarPosition ?? this._options.ToolbarPosition ?? ToolbarPosition.TOP,
            ToolbarHidden: options.ToolbarHidden ?? this._options.ToolbarHidden ?? false,
            StepperApperanceHorizontalAlt: options.StepperApperanceHorizontalAlt ?? this._options.StepperApperanceHorizontalAlt ?? false,
            StepperApperanceVerticalAlt: options.StepperApperanceVerticalAlt ?? this._options.StepperApperanceVerticalAlt ?? false,
            Zoom: options.Zoom ?? this._options.Zoom ?? Zoom.FIT,
            PinchZoom: options.PinchZoom ?? this._options.PinchZoom ?? false,
            NativeScrollbars: options.NativeScrollbars ?? this._options.NativeScrollbars ?? false,
            Locale: options.Locale ?? this._options.Locale ?? "",
            ZoomInBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomInBtnOptions, this._options.ZoomInBtnOptions),
            ZoomOutBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomOutBtnOptions, this._options.ZoomOutBtnOptions),
            ZoomFitBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomFitBtnOptions, this._options.ZoomFitBtnOptions),
            ZoomFitWidthBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomFitWidthBtnOptions, this._options.ZoomFitWidthBtnOptions),
            ZoomFitHeightBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomFitHeightBtnOptions, this._options.ZoomFitHeightBtnOptions),
            ZoomRange: options.ZoomRange ?? this._options.ZoomRange ?? "",
            LoadingError: options.LoadingError ?? this._options.LoadingError ?? "",
            /* eslint-enable */
        };
        const wasEmpty = this.items.length === 0;
        if (options.Items) {
            this.replaceItemsWith(options.Items);
            opts.Items = options.Items.map(e => typeof e === "string" ? e : { ...e });
        } else {
            opts.Items = [...(this._options.Items ?? [])];
        }
        this._options = opts;
        this.item = wasEmpty
            ? this.items[0] ?? this.dummyItem
            : this.items[index ?? -1] ?? this.items.find(e => e === this.item) ?? this.items[0] ?? this.dummyItem;
        options.StepperOptions && this.stepper.options(options.StepperOptions);
        this.itemContainer.native(opts.NativeScrollbars!);
        this.pinchZoomHandler.active(opts.PinchZoom!);
        opts.OmitToolbar
            ? this.addClass("omit-toolbar")
            : this.removeClass("omit-toolbar");
        this
            .i18n(this._options)
            .rebuildToolbar()
            .toolbarPosition(opts.ToolbarPosition!)
            .toolbarHidden(opts.ToolbarHidden!)
            .syncUIForIndex(this.items.findIndex(e => e === this.item))
            .displayItem(this.item);
        return this;
    }

    /**
     * Get all items that this viewer currently contains (_as a copy_).
     */
    public get Items(): ViewerItem[] {
        return this.items.map(e => ({
            /* eslint-disable jsdoc/require-jsdoc */
            URL: e.URL,
            Zoom: e.Zoom,
            Scale: e.Scale,
            ScrollPos: DOMPoint.fromPoint(e.ScrollPos),
            Loaded: e.Loaded,
            LoadError: e.LoadError
            /* eslint-enable */
        }));
    }

    /**
     * Get/set the position of the toolbar.
     */
    public get ToolbarPosition(): ToolbarPosition {
        return this._options.ToolbarPosition!;
    }
    /** @inheritdoc */
    public set ToolbarPosition(v: ToolbarPosition) {
        this.toolbarPosition(v);
    }

    /**
     * Set the position of the toolbar.
     * @param position The position of the toolbar.
     * @returns This instance.
     */
    public toolbarPosition(position: ToolbarPosition): this {
        this._options.ToolbarPosition = position;
        this.ui.removeClass(ToolbarPosition.TOP, ToolbarPosition.END, ToolbarPosition.BOTTOM, ToolbarPosition.START);
        this.ui.addClass(this._options.ToolbarPosition);
        this.stepper.appearance(
            this._options.ToolbarPosition === ToolbarPosition.TOP || this._options.ToolbarPosition === ToolbarPosition.BOTTOM
                ? this._options.StepperApperanceHorizontalAlt ? StepperAppearance.HORIZONTAL_ALT : StepperAppearance.HORIZONTAL
                : this._options.StepperApperanceVerticalAlt ? StepperAppearance.VERTICAL_ALT : StepperAppearance.VERTICAL
        );
        this.ui.remove(this.toolBar);
        if (this._options.ToolbarPosition === ToolbarPosition.TOP || this._options.ToolbarPosition === ToolbarPosition.START) {
            this._options.OmitToolbar
                ? this.ui.append(this.itemContainer)
                : this.ui.append(this.toolBar, this.itemContainer);
        } else {
            this._options.OmitToolbar
                ? this.ui.append(this.itemContainer)
                : this.ui.append(this.itemContainer, this.toolBar);
        }
        this.scrollOffset(this.item.ScrollPos.x, this.item.ScrollPos.y);
        this.zoomRange.vertical((this._options.ToolbarPosition === ToolbarPosition.START) || (this._options.ToolbarPosition === ToolbarPosition.END));
        return this;
    }

    /**
     * Get/set the visibility of the toolbar.
     */
    public get ToolbarHidden(): boolean {
        return this._options.ToolbarHidden!;
    }
    /** @inheritdoc */
    public set ToolbarHidden(v: boolean) {
        this.toolbarHidden(v);
    }

    /**
     * Set the visibility of the toolbar.
     * @param hidden `true` if the toolbar is visible, otherwise `false`.
     * @returns This instance.
     */
    public toolbarHidden(hidden: boolean): this {
        this._options.ToolbarHidden = hidden;
        this._options.ToolbarHidden
            ? this.ui.addClass("toolbar-hidden")
            : this.ui.removeClass("toolbar-hidden");
        return this;
    }

    /**
     * Get/set a predefined zoom level.
     */
    public get Zoom(): Zoom {
        return this.item.Zoom;
    }
    /** @inheritdoc */
    public set Zoom(v: Zoom) {
        this.zoom(v);
    }

    /**
     * Set a predefined zoom level on the current item.
     * @param zoom A predefined zoom level.
     * @param all if `true`, the predefined zoom level will be set for all viewer items.
     * @returns This instance.
     */
    public zoom(zoom: Zoom, all: boolean = false): this {
        if (zoom === Zoom.ZOTHER) {
            return this;
        }
        if (!this.item.LoadError) {
            this.centerOnZoomOrScale(this.item, zoom, this.item.Scale);
        }
        if (all) {
            for (const item of this.items) {
                if (item !== this.item && !item.LoadError) {
                    this.zoomItem(item, zoom);
                }
            }
        }
        this.emitZoomEvent();
        return this;
    }

    /**
     * Get/set a free magnification level. For the setter the value will be autocorrected to be in
     * the range `0.01` < 'v' <= `4`.
     */
    public get Scale(): number {
        return this.item.Scale;
    }
    /** @inheritdoc */
    public set Scale(scale: number) {
        this.scale(scale);
    }

    /**
     * Set a free magnification level.
     * @param scale The magnification level. `scale` will be autocorrected to be in the range
     * `0.01` < 'scale' <= `4`.
     * @param all if `true`, the magnification level will be set for all viewer items.
     * @returns This instance.
     */
    public scale(scale: number, all: boolean = false): this {
        scale = Math.min(Math.max(0.01, scale), 4);
        if (!this.item.LoadError) {
            this.centerOnZoomOrScale(this.item, scale, this.item.Scale);
        }
        if (all) {
            for (const item of this.items) {
                if (item !== this.item && !item.LoadError) {
                    this.scaleItem(item, scale);
                }
            }
        }
        this.emitZoomEvent();
        return this;
    }

    /**
     * Get/set the scroll offset of the current item.
     */
    public get ScrollOffset(): { X: number; Y: number; } { // eslint-disable-line jsdoc/require-jsdoc
        return { X: this.item.ScrollPos.x, Y: this.item.ScrollPos.y }; // eslint-disable-line jsdoc/require-jsdoc
    }
    /** @inheritdoc */
    public set ScrollOffset(v: { X: number; Y: number; }) { // eslint-disable-line jsdoc/require-jsdoc
        this.scrollOffset(v.X, v.Y);
    }

    /**
     * Set the scroll offset of the current item.
     * @param x The horizontal scroll offset to be used for the current item.
     * @param y The vertical scroll offset to be used for the current item.
     * @returns This instance.
     */
    public scrollOffset(x: number, y: number): this {
        this.itemContainer.scroll(x, y);
        this.item.ScrollPos.x = this.itemContainer.ScrollOffset.X;
        this.item.ScrollPos.y = this.itemContainer.ScrollOffset.Y;
        return this;
    }

    /**
     * Only for very special purposes(!): Get access to the inner `Stepper` component.
     */
    public get Stepper(): Stepper {
        return this.stepper;
    }

    /////////////////////////
    // #region Borrow/return components
    /**
     * Unmounts the stepper component from the toolbar (if it is mounted there) and returns it. The
     * returned component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @returns The stepper component of this viewer.
     */
    public borrowStepper(): Stepper {
        return this.borrowComponent(this.stepperBorrowed, this.stepper);
    }

    /**
     * Unmounts the stepper component from its current parent and remounts it to the toolbar (if
     * contained in `ToolbarElements`). If the component is already mounted in the toolbar, the
     * function does nothing.
     * @returns This instance.
     */
    public returnStepper(): this {
        return this.returnComponent(this.stepperBorrowed, this.stepper);
    }

    /**
     * Get the 'borrowed' state of the stepper.
     */
    public get StepperBorrowed(): boolean {
        return this.stepperBorrowed;
    }

    /**
     * Unmounts the 'Zoom in/out' buttons component (`Div`) from the toolbar (if it is mounted
     * there) and returns it. The returned component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @returns The 'Zoom in/out' buttons component (`Div`) of this viewer.
     */
    public borrowZoomInOut(): Div {
        return this.borrowComponent(this.zoomInOutBorrowed, this.zoomInOut);
    }

    /**
     * Unmounts the 'Zoom in/out' buttons component from its current parent and remounts it to the
     * toolbar (if contained in `ToolbarElements`). If component is already mounted in the toolbar,
     * the function does nothing.
     * @returns This instance.
     */
    public returnZoomInOut(): this {
        return this.returnComponent(this.zoomInOutBorrowed, this.zoomInOut);
    }

    /**
     * Get the 'borrowed' state of the 'Zoom in/out' buttons component.
     */
    public get ZoomInOutBorrowed(): boolean {
        return this.zoomInOutBorrowed;
    }

    /**
     * Unmounts the 'Zoom fit' buttons component (`Div`) from the toolbar (if it is mounted there)
     * and returns it. The returned component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @returns The 'Zoom fit' buttons component (`Div`) of this viewer.
     */
    public borrowZoomFit(): Div {
        return this.borrowComponent(this.zoomFitBorrowed, this.zoomFit);
    }

    /**
     * Unmounts the 'Zoom fit' buttons component from its current parent and remounts it to the
     * toolbar (if contained in `ToolbarElements`). If the component is already mounted in the
     * toolbar, the function does nothing.
     * @returns This instance.
     */
    public returnZoomFit(): this {
        return this.returnComponent(this.zoomFitBorrowed, this.zoomFit);
    }

    /**
     * Get the 'borrowed' state of the 'Zoom fit' buttons component.
     */
    public get ZoomFitBorrowed(): boolean {
        return this.zoomFitBorrowed;
    }

    /**
     * Unmounts the 'Item index' component (`Span`) from the toolbar (if it is mounted there) and
     * returns it. The returned component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @returns The 'Item index' component (`Span`) of this viewer.
     */
    public borrowItemIndex(): Span {
        return this.borrowComponent(this.itemIndexBorrowed, this.itemIndex);
    }

    /**
     * Unmounts the 'Item index' component from its current parent and remounts it to the toolbar
     * (if contained in `ToolbarElements`). If the component is already mounted in the toolbar, the
     * function does nothing.
     * @returns This instance.
     */
    public returnItemIndex(): this {
        return this.returnComponent(this.itemIndexBorrowed, this.itemIndex);
    }

    /**
     * Get the 'borrowed' state of the 'Item index' component.
     */
    public get ItemIndexBorrowed(): boolean {
        return this.itemIndexBorrowed;
    }

    /**
     * Unmounts the 'Zoom level' component (`Span`) from the toolbar (if it is mounted there) and
     * returns it. The returned component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @returns The 'Zoom level' component (`Span`) of this viewer.
     */
    public borrowZoomLevel(): Span {
        return this.borrowComponent(this.zoomLevelBorrowed, this.zoomLevel);
    }

    /**
     * Unmounts the 'Zoom level' component from its current parent and remounts it to the toolbar
     * (if contained in `ToolbarElements`). If the component is already mounted in the toolbar, the
     * function does nothing.
     * @returns This instance.
     */
    public returnZoomLevel(): this {
        return this.returnComponent(this.zoomLevelBorrowed, this.zoomLevel);
    }

    /**
     * Get the 'borrowed' state of the 'Zoom level' component.
     */
    public get ZoomLevelBorrowed(): boolean {
        return this.zoomLevelBorrowed;
    }

    /**
     * Unmounts the 'Zoom range' component from the toolbar (if it is mounted there) and returns it.
     * The returned component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @returns The 'Zoom range' component of this viewer.
     */
    public borrowZoomRange(): RangeInput {
        return this.borrowComponent(this.zoomRangeBorrowed, this.zoomRange);
    }

    /**
     * Unmounts the 'Zoom range' component from its current parent and remounts it to the toolbar
     * (if contained in `ToolbarElements`). If the component is already mounted in the toolbar, the
     * function does nothing.
     * @returns This instance.
     */
    public returnZoomRange(): this {
        return this.returnComponent(this.zoomRangeBorrowed, this.zoomRange);
    }

    /**
     * Get the 'borrowed' state of the 'Zoom range' component.
     */
    public get ZoomRangeBorrowed(): boolean {
        return this.zoomFitBorrowed;
    }

    /**
     * Unmounts a component from the toolbar (if it is mounted there) and returns it. The returned
     * component can then be mounted elsewhere.\
     * __Note:__ The borrowed component is still fully managed by the viewer and is also disposed of
     * when the viewer is disposed of!
     * @param borrowed `true`, if the component is already borrowed, otherwise `false`.
     * @param component The component to be borrowed.
     * @returns `component`.
     */
    protected borrowComponent<T extends INodeComponent<Node>>(borrowed: boolean, component: T): T {
        if (borrowed) {
            return component;
        }
        switch (<INodeComponent<Node>>component) {
            case this.stepper:
                this.stepperBorrowed = true;
                break;
            case this.zoomInOut:
                this.zoomInOutBorrowed = true;
                break;
            case this.zoomFit:
                this.zoomFitBorrowed = true;
                break;
            case this.itemIndex:
                this.itemIndexBorrowed = true;
                break;
            case this.zoomLevel:
                this.zoomLevelBorrowed = true;
                break;
            case this.zoomRange:
                this.zoomRangeBorrowed = true;
                break;
        }
        this.toolBar.remove(component);
        return component;
    }

    /**
     * Unmounts a component from its current parent and remounts it to the toolbar (if contained in
     * `ToolbarElements`). If the component is already mounted in the toolbar, the function does
     * nothing.
     * @param borrowed `true`, if the component is already borrowed, otherwise `false`.
     * @param component The component to be remounted.
     * @returns This instance.
     */
    protected returnComponent(borrowed: boolean, component: INodeComponent<Node>): this {
        if (!borrowed) {
            return this;
        }
        switch (component) {
            case this.stepper:
                this.stepperBorrowed = false;
                break;
            case this.zoomInOut:
                this.zoomInOutBorrowed = false;
                break;
            case this.zoomFit:
                this.zoomFitBorrowed = false;
                break;
            case this.itemIndex:
                this.itemIndexBorrowed = false;
                break;
            case this.zoomLevel:
                this.zoomLevelBorrowed = false;
                break;
            case this.zoomRange:
                this.zoomRangeBorrowed = false;
                break;
            default:
                return this;
        }
        return this.rebuildToolbar();
    }
    // #endregion Borrow/return components
    /////////////////////////

    /////////////////////////
    // #region ISteppable/IStepper
    /** @inheritdoc */
    public get Count(): number {
        return this.items.length;
    }

    /** @inheritdoc */
    public get Index(): number {
        return this.items.indexOf(this.item);
    }
    /** @inheritdoc */
    public set Index(v: number) {
        this.index(v);
    }

    /**
     * Set the index of the item which is to be displayed.
     * @param index The index of the item to be displayed.
     * @returns This instance.
     */
    public index(index: number): this {
        index = this.adjustIndex(index);
        this.item = this.items[index];
        this.itemIndex.phrase(`${index + 1}/${this.items.length}`);
        this.stepper.sync();
        this.displayItem(this.item);
        return this;
    }

    /** @inheritdoc */
    public get PageSize(): number {
        const l = this.items.length;
        if (l < 5) {
            return -1;
        } else if (l <= 10) {
            return 3;
        } else if (l <= 20) {
            return 5;
        }
        return Math.trunc(l / 5);
    }

    /** @inheritdoc */
    public First(): boolean {
        const result = (this.items.length > 0) && this.dispatch(new ViewerStepEvent(this, 0))
            ? this.stepper.First()
            : false;
        result && this.emit(new ViewerSteppedEvent(this, this.Index));
        return result;
    }

    /** @inheritdoc */
    public PageBackward(): boolean {
        if (this.PageSize === -1) {
            return false;
        }
        const result = (this.items.length > 0) && (this.PageSize !== -1) && this.dispatch(new ViewerStepEvent(this, this.adjustIndex(this.Index - this.PageSize)))
            ? this.stepper.PageBackward()
            : false;
        result && this.emit(new ViewerSteppedEvent(this, this.Index));
        return result;
    }

    /** @inheritdoc */
    public Backward(): boolean {
        const result = (this.items.length > 0) && this.dispatch(new ViewerStepEvent(this, this.adjustIndex(this.Index - 1)))
            ? this.stepper.Backward()
            : false;
        result && this.emit(new ViewerSteppedEvent(this, this.Index));
        return result;
    }

    /** @inheritdoc */
    public Forward(): boolean {
        const result = (this.items.length > 0) && this.dispatch(new ViewerStepEvent(this, this.adjustIndex(this.Index - 1)))
            ? this.stepper.Forward()
            : false;
        result && this.emit(new ViewerSteppedEvent(this, this.Index));
        return result;
    }

    /** @inheritdoc */
    public PageForward(): boolean {
        const result = (this.items.length > 0) && (this.PageSize !== -1) && this.dispatch(new ViewerStepEvent(this, this.adjustIndex(this.Index + this.PageSize)))
            ? this.stepper.PageForward()
            : false;
        result && this.emit(new ViewerSteppedEvent(this, this.Index));
        return result;
    }

    /** @inheritdoc */
    public Last(): boolean {
        const result = (this.items.length > 0) && this.dispatch(new ViewerStepEvent(this, this.adjustIndex(this.items.length - 1)))
            ? this.stepper.Last()
            : false;
        result && this.emit(new ViewerSteppedEvent(this, this.Index));
        return result;
    }

    /**
     * Checks and adjusts an index value against the limits of `this.items`.
     * @param index The index to be checked.
     * @returns An index in the range `0 >= index <= this.steppable.Count-1`.
     */
    protected adjustIndex(index: number): number {
        return Math.min(Math.max(index, 0), this.items.length - 1);
    }
    // #endregion ISteppable/IStepper
    /////////////////////////

    /**
     * Adds or removes the toolbar and the item container from this component.
     * @param empty If `true`, the toolbar and the item container are removed from this component,
     * otherwise both are added.
     */
    protected setEmpty(empty: boolean): void {
        if (empty) {
            this.addClass("empty");
            this.ui.remove(this.itemContainer, this.toolBar);
        } else {
            this.removeClass("empty");
            this.ui.remove(this.toolBar);
            if (this._options.ToolbarPosition === ToolbarPosition.TOP || this._options.ToolbarPosition === ToolbarPosition.START) {
                this._options.OmitToolbar
                    ? this.ui.append(this.itemContainer)
                    : this.ui.append(this.toolBar, this.itemContainer);
            } else {
                this._options.OmitToolbar
                    ? this.ui.append(this.itemContainer)
                    : this.ui.append(this.itemContainer, this.toolBar);
            }
            this.scrollOffset(this.item.ScrollPos.x, this.item.ScrollPos.y);
        }
    }

    /**
     * Adjusts the index to a new position and sets the visibility of UI elements depending on
     * `this.items.length`.
     * @param forIndex The index of the item for which the adjustment is to be made.
     * @returns This instance.
     */
    protected syncUIForIndex(forIndex: number): this {
        const itemCount = this.items.length;
        this.stepper.visible(itemCount > 1);
        this.itemIndex.visible(itemCount > 1);
        this.setEmpty(itemCount === 0 || forIndex === -1);
        if (itemCount === 0 || forIndex === -1) {
            this.item = this.dummyItem;
            this.itemIndex.phrase("0/0");
            this.stepper.sync();
            return this;
        }
        return this.index(forIndex);
    }

    /**
     * Checks if the zoom/scale level or scroll position of the current item has changed compared to
     * the state that was active when `displayItem()` was called.
     * @returns `true` if the zoom/magnification level or scroll position of the current item was
     * changed since the last call of `displayItem()`, otherwise `false`.
     */
    protected lastDisplayStateChanged(): boolean {
        return this.lastDisplayState.Zoom !== this.item.Zoom
            || this.lastDisplayState.Scale !== this.item.Scale
            || this.lastDisplayState.ScrollPos.x !== this.item.ScrollPos.x
            || this.lastDisplayState.ScrollPos.y !== this.item.ScrollPos.y;
    }

    /**
     * Display an item
     * @param item The item to be displayed.
     */
    protected displayItem(item: IViewerItem): void {
        this.lastDisplayState.Zoom = item.Zoom;
        this.lastDisplayState.Scale = item.Scale;
        this.lastDisplayState.ScrollPos.x = item.ScrollPos.x;
        this.lastDisplayState.ScrollPos.y = item.ScrollPos.y;
        this.setZoomControlsVisibility(!item.LoadError);
        if (!item.Loaded && !item.Component) {
            item.Component = new Img(
                item.URL,
                undefined, /** width */
                undefined, /** height */
                item.URL,  /** alt */
                true,      /** lazyload */
            )
                .on("load", this.onLoad.bind(this))
                .on("error", this.onLoadError.bind(this));
            item.Component.Hidden = true;
            item.Component.on("click", (ev: MouseEvent) => {
                ev.shiftKey ? this.zoomOut(ev) : this.zoomIn(ev);
            });
            item.Throbber = new Throbber().addClass("throbber", "vts-throbber");
        }
        this.itemContainer.remove();
        this.itemContainer.append(item.Component);
        if (item.Throbber) {
            this.itemContainer.append(item.Throbber);
        }
        if (item.Loaded && !item.LoadError) {
            [Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT].includes(item.Zoom) && this.calcScaleForZoomFit(item);
            this.updateZoomControls(this.item);
            this.scrollOffset(this.item.ScrollPos.x, this.item.ScrollPos.y);
        }
    }

    /**
     * Updates the list of items based on new items. An attempt is made to retain as many existing
     * media files and their DOM objects as possible.
     * @param items An array with new items to be used.
     * @returns This instance.
     */
    protected replaceItemsWith(items: (string | { URL: string; Zoom?: Zoom; Scale?: number; ScrollPos?: DOMPoint; })[]): this { // eslint-disable-line jsdoc/require-jsdoc
        if (items.length === 0) {
            for (const item of this.items) {
                item.Component?.Parent?.remove(item.Component);
                item.Component?.dispose();
                item.Throbber?.Parent?.remove(item.Throbber);
                item.Throbber?.dispose();
            }
            this.items.length = 0;
            return this;
        }
        const newItems: IViewerItem[] = [];
        for (const item of items) {
            const idx = this.items.findIndex(e => e.URL === (typeof item === "string" ? item : item.URL));
            // Update an existing item with settings from the given item. For the handling of `Zoom`
            // and `Scale` see the documentation of `ViewerItem` and `getItem()`.
            if ((idx !== -1) && (typeof item !== "string")) {
                const existing = this.items[idx];
                if (item.Zoom && item.Zoom !== Zoom.ZOTHER) {
                    this.zoomItem(existing, item.Zoom);
                } else if (item.Scale !== undefined) {
                    existing.Zoom = Zoom.ZOTHER;
                    this.scaleItem(existing, item.Scale);
                }
                existing.ScrollPos = item.ScrollPos ? DOMPoint.fromPoint(item.ScrollPos) : existing.ScrollPos;
            }
            newItems.push(
                idx !== -1
                    ? this.items.splice(idx, 1)[0]
                    : this.getItem(item)
            );
        }
        for (const item of this.items) {
            item.Component?.Parent?.remove(item.Component);
            item.Component?.dispose();
            item.Throbber?.Parent?.remove(item.Throbber);
            item.Throbber?.dispose();
        }
        this.items.length = 0;
        this.items.push(...newItems);
        return this;
    }

    /**
     * Determines the item from the internal item list that belongs to 'target'.
     * @param target The HTML element that is searched for in `this.items` (property `Ctrl`).
     * @returns The found item or 'undefined'.
     */
    protected getItemByEventTarget(target: HTMLElement): IViewerItem | undefined {
        return this.items.find(e => e.Component?.DOM === target);
    }

    /**
     * Called by the image component if the image is completely loaded.
     * @param ev the loading event.
     */
    protected onLoad(ev: Event | OnErrorEventHandler): void {
        if (ev instanceof Event) {
            const item = this.getItemByEventTarget(ev.target as HTMLElement);
            if (item) {
                item.Loaded = true;
                if (item === this.item) {
                    if (item.Zoom === Zoom.ZOTHER) {
                        this.scaleItem(item, item.Scale);
                    } else {
                        this.zoomItem(item, item.Zoom);
                    }
                    this.updateZoomControls(item);
                    this.scrollOffset(item.ScrollPos.x, item.ScrollPos.y);
                    this.lastDisplayState.Zoom = item.Zoom;
                    this.lastDisplayState.Scale = item.Scale;
                    this.lastDisplayState.ScrollPos.x = item.ScrollPos.x;
                    this.lastDisplayState.ScrollPos.y = item.ScrollPos.y;
                }
                item.Component!.Hidden = false;
                item.Throbber?.Parent?.remove(item.Throbber);
                item.Throbber?.dispose();
                item.Throbber = undefined;
            }
        }
    }

    // /**
    //  * Called by the image component if an error occured on loading the image.
    //  * @param ev The error event.
    //  * @param source Error sourec code(?).
    //  * @param lineno Source code line(?).
    //  * @param colno Source code row(?).
    //  * @param error The loading error.
    //  */
    // protected async onError(ev: Event | string, source?: string, lineNo?: number, colNo?: number, error?: Error): Promise<void> { // eslint-disable-line @typescript-eslint/require-await
    /**
     * Called by the image component if an error occured on loading the image.
     * @param ev The error event.
     */
    protected async onLoadError(ev: Event | string) { // eslint-disable-line @typescript-eslint/require-await
        if (ev instanceof Event) {
            const item = this.getItemByEventTarget(ev.target as HTMLImageElement);
            if (item) {
                item.Loaded = true;
                item.LoadError = true;
                if (item === this.item) {
                    this.setZoomControlsVisibility(!item.LoadError);
                }
                const loadingError = this._options.LoadingError!.replaceAll("%s", item.URL);
                item.Component!
                    .alt(loadingError)
                    .title(loadingError);
                this.removeZoomClasses(item);
                item.Component!.Hidden = false;
                item.Throbber?.Parent?.remove(item.Throbber);
                item.Throbber?.dispose();
                item.Throbber = undefined;
            }
        }
    }

    /**
     * Remove all zoom marker classes from an item.
     * @param item The item from which the zoom marker classes are to be removed.
     */
    protected removeZoomClasses(item: IViewerItem): void {
        item?.Component?.removeClass(
            Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT, Zoom.Z10, Zoom.Z25, Zoom.Z50, Zoom.Z75,
            Zoom.Z100, Zoom.Z125, Zoom.Z150, Zoom.Z175, Zoom.Z200, Zoom.Z250, Zoom.Z300,
            Zoom.Z350, Zoom.Z400, Zoom.ZOTHER
        );
    }

    /**
     * Handle changes of the zoom range input.
     */
    protected onZoomRangeChange(): void {
        const value = Number(this.zoomRange.Value);
        value >= 0.5
            ? this.scale(Math.min(((value - 0.5) * 6) + 1, 4))
            : this.scale(Math.max(value * 2, 0.01));
    }

    /**
     * Set a predefined zoom level an on an item.
     * @param item The item on which the zoom level is to be set.
     * @param zoom A predefined zoom level.
     */
    protected zoomItem(item: IViewerItem, zoom: Zoom): void {
        item.Zoom = zoom;
        if (!item.Component) {
            return;
        }
        this.removeZoomClasses(item);
        item.Component.addClass(item.Zoom);
        switch (item.Zoom) {
            case Zoom.FIT:
            case Zoom.FITWIDTH:
            case Zoom.FITHEIGHT:
                item.Scale = -1;
                break;
            case Zoom.Z10:
                item.Scale = 0.1;
                break;
            case Zoom.Z25:
                item.Scale = 0.25;
                break;
            case Zoom.Z50:
                item.Scale = 0.5;
                break;
            case Zoom.Z75:
                item.Scale = 0.75;
                break;
            case Zoom.Z100:
                item.Scale = 1;
                break;
            case Zoom.Z125:
                item.Scale = 1.25;
                break;
            case Zoom.Z150:
                item.Scale = 1.5;
                break;
            case Zoom.Z175:
                item.Scale = 1.75;
                break;
            case Zoom.Z200:
                item.Scale = 2;
                break;
            case Zoom.Z250:
                item.Scale = 2.5;
                break;
            case Zoom.Z300:
                item.Scale = 3;
                break;
            case Zoom.Z350:
                item.Scale = 3.5;
                break;
            case Zoom.Z400:
                item.Scale = 4;
                break;
            default:
                break;
        }
        if (item.Scale === -1) {
            item.Component.scale(0);
            this.calcScaleForZoomFit(item);
        } else {
            item.Component.scale(item.Scale);
        }
    }

    /**
     * Zoom in on the item.
     * @param ev The triggering event.
     */
    protected zoomIn(ev: KeyboardEvent | MouseEvent | PointerEvent): void {
        const rect = this.DOM.getBoundingClientRect();
        this.clickPoint = ev instanceof MouseEvent && ev.target instanceof HTMLImageElement
            ? new DOMPoint(ev.clientX - rect.x, ev.clientY - rect.y)
            : new DOMPoint(this.itemContainer.DOM.offsetWidth - rect.left, this.itemContainer.DOM.offsetHeight - rect.top);
        const scale = this.item.Scale;
        let newScale: number | undefined = undefined;
        let zoom: Zoom | undefined = undefined;
        if (scale < 0.1) {
            zoom = Zoom.Z10;
            newScale = 0.1;
        } else if ((scale === 0.1) || (scale < 0.25)) {
            zoom = Zoom.Z25;
            newScale = 0.25;
        } else if ((scale === 0.25) || (scale < 0.5)) {
            zoom = Zoom.Z50;
            newScale = 0.5;
        } else if ((scale === 0.5) || (scale < 0.75)) {
            zoom = Zoom.Z75;
            newScale = 0.75;
        } else if ((scale === 0.75) || (scale < 1)) {
            zoom = Zoom.Z100;
            newScale = 1;
        } else if ((scale === 1) || (scale < 1.25)) {
            zoom = Zoom.Z125;
            newScale = 1.25;
        } else if ((scale === 1.25) || (scale < 1.5)) {
            zoom = Zoom.Z150;
            newScale = 1.5;
        } else if ((scale === 1.5) || (scale < 1.75)) {
            zoom = Zoom.Z175;
            newScale = 1.75;
        } else if ((scale === 1.75) || (scale < 2)) {
            zoom = Zoom.Z200;
            newScale = 2;
        } else if ((scale === 2) || (scale < 2.5)) {
            zoom = Zoom.Z250;
            newScale = 2.5;
        } else if ((scale === 2.5) || (scale < 3)) {
            zoom = Zoom.Z300;
            newScale = 3;
        } else if ((scale === 3) || (scale < 3.5)) {
            zoom = Zoom.Z350;
            newScale = 3.5;
        } else if ((scale === 3.5) || (scale < 4)) {
            zoom = Zoom.Z400;
            newScale = 4;
        } else {
            return;
        }
        (ev instanceof MouseEvent || ev instanceof PointerEvent) && ev.target instanceof HTMLImageElement
            ? this.centerZoomToPointer(this.item, zoom, scale, newScale, ev)
            : this.centerOnZoomOrScale(this.item, zoom, scale);
        this.emitZoomEvent();
    }

    /**
     * Zoom out on the item.
     * @param ev The triggering event.
     */
    protected zoomOut(ev: KeyboardEvent | MouseEvent | PointerEvent): void {
        const rect = this.DOM.getBoundingClientRect();
        this.clickPoint = ev instanceof MouseEvent && ev.target instanceof HTMLImageElement
            ? new DOMPoint(ev.clientX - rect.x, ev.clientY - rect.y)
            : new DOMPoint(this.itemContainer.DOM.offsetWidth - rect.left, this.itemContainer.DOM.offsetHeight - rect.top);
        const scale = this.item.Scale;
        let newScale: number | undefined = undefined;
        let zoom: Zoom | undefined = undefined;
        if (scale > 4) {
            zoom = Zoom.Z400;
            newScale = 4;
        } else if ((scale === 4) || (scale > 3.5)) {
            zoom = Zoom.Z350;
            newScale = 3.5;
        } else if ((scale === 3.5) || (scale > 3)) {
            zoom = Zoom.Z300;
            newScale = 3;
        } else if ((scale === 3) || (scale > 2.5)) {
            zoom = Zoom.Z250;
            newScale = 2.5;
        } else if ((scale === 2.5) || (scale > 2)) {
            zoom = Zoom.Z200;
            newScale = 2;
        } else if ((scale === 2) || (scale > 1.75)) {
            zoom = Zoom.Z175;
            newScale = 1.75;
        } else if ((scale === 1.75) || (scale > 1.5)) {
            zoom = Zoom.Z150;
            newScale = 1.5;
        } else if ((scale === 1.5) || (scale > 1.25)) {
            zoom = Zoom.Z125;
            newScale = 1.25;
        } else if ((scale === 1.25) || (scale > 1)) {
            zoom = Zoom.Z100;
            newScale = 1;
        } else if ((scale === 1) || (scale > 0.75)) {
            zoom = Zoom.Z75;
            newScale = 0.75;
        } else if ((scale === 0.75) || (scale > 0.5)) {
            zoom = Zoom.Z50;
            newScale = 0.5;
        } else if ((scale === 0.5) || (scale > 0.25)) {
            zoom = Zoom.Z25;
            newScale = 0.25;
        } else if ((scale === 0.25) || (scale > 0.1)) {
            zoom = Zoom.Z10;
            newScale = 0.1;
        } else {
            return;
        }
        (ev instanceof MouseEvent || ev instanceof PointerEvent) && ev.target instanceof HTMLImageElement
            ? this.centerZoomToPointer(this.item, zoom, scale, newScale, ev)
            : this.centerOnZoomOrScale(this.item, zoom, scale);
        this.emitZoomEvent();
    }

    /**
     * Center the item to the current mouse or pointer position on zooming in or out.
     * @param item The item which is to be centered.
     * @param value The zoom level or magnification level to be set on the item.
     * @param prevscale The previous scale amount of the item.
     * @param newScale The new scale amount of the item.
     * @param ev The triggering muse or pointer event.
     */
    protected centerZoomToPointer(item: IViewerItem, value: Zoom | number, prevscale: number, newScale: number, ev: MouseEvent | PointerEvent | { clientX: number, clientY: number; }): void { // eslint-disable-line jsdoc/require-jsdoc
        const ctrlDOM = this.item.Component!.DOM;
        const containerDOM = this.itemContainer.DOM;
        const prevScrollRangeHalf = new DOMPoint((ctrlDOM.offsetWidth - containerDOM.offsetWidth) / 2, (ctrlDOM.offsetHeight - containerDOM.offsetHeight) / 2);
        const pointerOffset = new DOMPoint(0, 0);
        const rect = this.itemContainer.DOM.getBoundingClientRect();
        const center = new DOMPoint(containerDOM.offsetWidth / 2, containerDOM.offsetHeight / 2);
        if (ctrlDOM.naturalWidth * newScale - containerDOM.offsetWidth > 0) {
            pointerOffset.x = ev.clientX - center.x - rect.x;
        }
        if (ctrlDOM.naturalHeight * newScale - containerDOM.offsetHeight > 0) {
            pointerOffset.y = ev.clientY - center.y - rect.y;
        }
        // this.#pointerDot.style("left", `${ev.clientX - rect.x}px`);
        // this.#pointerDot.style("top", `${ev.clientY - rect.y}px`);
        const rtlN = getComputedStyle(this.itemContainer.DOM).direction === "rtl" ? -1 : 1;
        const prevScrollPos = new DOMPoint(rtlN * this.itemContainer.ScrollOffset.X, this.itemContainer.ScrollOffset.Y);
        typeof value === "number"
            ? this.scaleItem(item, value)
            : this.zoomItem(item, value);
        const scaleFactor = this.item.Scale / prevscale;
        const newScrollPosX = ((ctrlDOM.offsetWidth - containerDOM.offsetWidth) / 2)
            + ((prevScrollPos.x - Math.max(prevScrollRangeHalf.x, 0)) * scaleFactor);
        const newScrollPosY = ((ctrlDOM.offsetHeight - containerDOM.offsetHeight) / 2)
            + ((prevScrollPos.y - Math.max(prevScrollRangeHalf.y, 0)) * scaleFactor);
        this.scrollOffset(
            // `+0.5` gives more precision with repeated zoom actions(?).
            rtlN * (newScrollPosX) + (pointerOffset.x * scaleFactor) - pointerOffset.x + 0.5,
            newScrollPosY + (pointerOffset.y * scaleFactor) - pointerOffset.y + 0.5
        );
        this.updateZoomControls(item);
    }

    /**
     * Center the current item in the scroll container on zooming in or out.
     * @param item The item which is to be centered.
     * @param value The zoom level or magnification level of the item.
     * @param previousScale The previous scale amount of the item.
     */
    protected centerOnZoomOrScale(item: IViewerItem, value: Zoom | number, previousScale: number): void {
        // this.#pointerDot.style("left", "50%");
        // this.#pointerDot.style("top", "50%");
        const rtlN = getComputedStyle(this.itemContainer.DOM).direction === "rtl" ? -1 : 1;
        const ctrlDOM = this.item.Component!.DOM;
        const containerDOM = this.itemContainer.DOM;
        const prevScrollRangeHalf = new DOMPoint((ctrlDOM.offsetWidth - containerDOM.offsetWidth) / 2, (ctrlDOM.offsetHeight - containerDOM.offsetHeight) / 2);
        const prevScrollPos = new DOMPoint(rtlN * this.itemContainer.ScrollOffset.X, this.itemContainer.ScrollOffset.Y);
        typeof value === "number"
            ? this.scaleItem(item, value)
            : this.zoomItem(item, value);
        const scaleFactor = this.item.Scale / previousScale;
        const newScrollPosX = ((ctrlDOM.offsetWidth - containerDOM.offsetWidth) / 2)
            + ((prevScrollPos.x - Math.max(prevScrollRangeHalf.x, 0)) * scaleFactor);
        const newScrollPosY = ((ctrlDOM.offsetHeight - containerDOM.offsetHeight) / 2)
            + ((prevScrollPos.y - Math.max(prevScrollRangeHalf.y, 0)) * scaleFactor);
        this.scrollOffset(
            // `+0.5` gives more precision with repeated zoom actions(?).
            rtlN * (newScrollPosX + 0.5),
            newScrollPosY + 0.5
        );
        this.updateZoomControls(item);
    }

    /**
     * Calculates the scaling factor for an item for the zoom levels `Zoom.FIT`, `Zoom.FITWIDTH` or
     * `Zoom.FITWIDTH`.
     * @param item The item for which the scaling factor is to be calculated. __Note__: This may
     * only work reliably if the item is displayed.
     */
    protected calcScaleForZoomFit(item: IViewerItem): void {
        const rect = item.Component!.DOM.getBoundingClientRect();
        if (item.Zoom === Zoom.FIT) {
            item.Scale = rect.width / rect.height >= (item.Component!.NaturalWidth / item.Component!.NaturalHeight)
                ? rect.height / item.Component!.NaturalHeight
                : rect.width / item.Component!.NaturalWidth;
        } else if (item.Zoom === Zoom.FITWIDTH) {
            item.Scale = rect.width / item.Component!.NaturalWidth;
        } else if (item.Zoom === Zoom.FITHEIGHT) {
            item.Scale = rect.height / item.Component!.NaturalHeight;
        }
    }

    /**
     * Update the state of some zoom controls in the toolbar.
     * @param item The item for which the controls are to be updated. __Note__: Only useful if the
     * item is displayed.
     */
    protected updateZoomControls(item: IViewerItem): void {
        this.zoomLevel.phrase(`${(item.Scale * 100).toLocaleString(this._options.Locale || navigator.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`); // eslint-disable-line jsdoc/require-jsdoc
        if (item.Scale <= 1) {
            this.zoomRange.Value = (item.Scale / 2).toString();
        } else {
            this.zoomRange.Value = (((item.Scale - 1) / 6) + 0.5).toString();
        }
        this.btnZoomIn.Disabled = item.Scale >= 4;
        this.btnZoomOut.Disabled = item.Scale <= 0.1;
        this.btnZoomFit.Disabled = item.Zoom === Zoom.FIT;
        this.btnZoomFitWidth.Disabled = item.Zoom === Zoom.FITWIDTH;
        this.btnZoomFitHeight.Disabled = item.Zoom === Zoom.FITHEIGHT;
    }

    /**
     * Set the visibility of the zoom controls.
     * @param visible `true`, if the zoom controls are visible, otherwise `false`.
     */
    protected setZoomControlsVisibility(visible: boolean): void {
        this.zoomInOut.Visible = visible;
        this.zoomFit.Visible = visible;
        this.zoomLevel.Visible = visible;
        this.zoomRange.Visible = visible;
    }

    /**
     * Set a free magnification level on an item.
     * @param item The item on which the free magnification level is to be set.
     * @param scale The magnification level. `scale` will be autocorrected to be in the range
     * `0.01` < 'scale' <= `4`.
     */
    protected scaleItem(item: IViewerItem, scale: number): void {
        scale = Math.min(Math.max(0.01, scale), 4);
        // if (scale === item.Scale) {
        //     return;
        // }
        switch (scale) {
            case 0.1:
                this.zoomItem(item, Zoom.Z10);
                break;
            case 0.25:
                this.zoomItem(item, Zoom.Z25);
                break;
            case 0.50:
                this.zoomItem(item, Zoom.Z50);
                break;
            case 0.75:
                this.zoomItem(item, Zoom.Z75);
                break;
            case 1:
                this.zoomItem(item, Zoom.Z100);
                break;
            case 1.25:
                this.zoomItem(item, Zoom.Z125);
                break;
            case 1.5:
                this.zoomItem(item, Zoom.Z150);
                break;
            case 1.75:
                this.zoomItem(item, Zoom.Z175);
                break;
            case 2:
                this.zoomItem(item, Zoom.Z200);
                break;
            case 2.5:
                this.zoomItem(item, Zoom.Z250);
                break;
            case 3:
                this.zoomItem(item, Zoom.Z300);
                break;
            case 3.5:
                this.zoomItem(item, Zoom.Z350);
                break;
            case 4:
                this.zoomItem(item, Zoom.Z400);
                break;
            default:
                item.Zoom = Zoom.ZOTHER;
                item.Scale = scale;
                if (item.Component) {
                    this.removeZoomClasses(item);
                    item.Component.addClass(item.Zoom);
                    item.Component.scale(item.Scale);
                }
        }
    }

    /**
     * Handle `pinch-zoom` event on the current item.
     * @param ev The `pinch-zoom` event.
     */
    protected onPinchZoom(ev: PinchZoomEvent): AnyType {
        const scale = ev.$.Scale;
        if (scale === PINCH_ZOOM_START) {
            this.itemContainer.Content.addClass("pinch-zooming");
            this.pinchZoomStartScale = this.Scale;
        } else if (scale === PINCH_ZOOM_STOP) {
            this.itemContainer.Content.removeClass("pinch-zooming");
        } else {
            if (ev.$.EventTarget instanceof HTMLImageElement) {
                const origin = { clientX: ev.$.Origin.x, clientY: ev.$.Origin.y }; // eslint-disable-line jsdoc/require-jsdoc
                const newScale = this.pinchZoomStartScale * scale;
                // if (newScale >= 0.01 && newScale <= 4) {
                if (newScale >= 0.01) {
                    this.centerZoomToPointer(this.item, newScale, this.item.Scale, newScale, origin);
                }
                this.emitZoomEvent();
            }
        }
    }

    /**
     * Handle `scroll` event on the current item.
     * @param _ev The pointer event.
     */
    protected onItemContainerScroll(_ev: Event): AnyType {
        this.item.ScrollPos.x = this.itemContainer.ScrollOffset.X;
        this.item.ScrollPos.y = this.itemContainer.ScrollOffset.Y;
        this.emitScrollEvent();
    }

    /**
     * Emits a `ViewerZoomEvent` if the zoom/magnification level of the current item has changed
     * since the last call of `displayItem()`.
     */
    protected emitZoomEvent(): void {
        if (this.item.Loaded && !this.item.LoadError && this.lastDisplayStateChanged()) {
            this.emit(new ViewerZoomEvent(this, this.Index, this.item.Zoom, this.item.Scale)); // eslint-disable-line jsdoc/require-jsdoc
            // Force `lastDisplayStateChanged()` to return `true` until the next call of
            // `displayItem()` by setting `Scale` to an invalid value.
            this.lastDisplayState.Scale = -Infinity;
        }
    }

    /**
     * Emits a `ViewerScrollEvent` if the scroll position of the current item has changed since the
     * last call of `displayItem()`.
     */
    protected emitScrollEvent(): void {
        if (this.item.Loaded && !this.item.LoadError && this.lastDisplayStateChanged()) {
            this.emit(new ViewerScrollEvent(this, this.Index, this.item.ScrollPos.x, this.item.ScrollPos.y)); // eslint-disable-line jsdoc/require-jsdoc
            // Force `lastDisplayStateChanged()` to return `true` until the next call of
            // `displayItem()` by setting `Scale` to an invalid value.
            this.lastDisplayState.Scale = -Infinity;
        }
    }

    /**
     * Create a new complete `IViewerItem` based on a URL or a (partially) predefined item.
     * @param from Either the URL of the item or a (partially) predefined item.
     * @param from.URL The URL of the item
     * @param from.Zoom The zoom level of the item.
     * @param from.Scale The scale level of the item.
     * @param from.ScrollPos The scroll position of the item.
     * @returns A new complete `IViewerItem` based on `from`.
     */
    protected getItem(from: string | { URL: string; Zoom?: Zoom; Scale?: number; ScrollPos?: DOMPoint; }): IViewerItem { // eslint-disable-line jsdoc/require-jsdoc
        let url: string;
        let zoom: Zoom;
        let scale: number;
        let scrollPos: DOMPoint;
        // If `Zoom` is set and not `ZOTHER` it always takes precedence over `Scale` so `Scale` is
        // set to `0`. Otherwise an existing `Scale` value always sets `Zoom` to `ZOTHER`. If
        // neither `Zoom` nor `Scale` is set, the default zoom level from the viewer options is
        // used or, if that is not set, `Zoom.FIT`.
        if (typeof from === "string") {
            url = from;
            zoom = this._options.Zoom || Zoom.FIT;
            scale = 0;
            scrollPos = new DOMPoint(0, 0);
        } else {
            url = from.URL;
            if (from.Zoom && from.Zoom !== Zoom.ZOTHER) {
                zoom = from.Zoom;
                scale = 0;
            } else if (from.Scale !== undefined) {
                zoom = Zoom.ZOTHER;
                scale = from.Scale;
            } else {
                zoom = this._options.Zoom || Zoom.FIT;
                scale = 0;
            }
            scrollPos = from.ScrollPos ? DOMPoint.fromPoint(from.ScrollPos) : new DOMPoint(0, 0);
        }
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            URL: url,
            Zoom: zoom,
            Scale: scale,
            ScrollPos: scrollPos,
            Component: undefined,
            Throbber: undefined,
            Loaded: false,
            LoadError: false
            /* eslint-enable */
        };
    }

    /**
     * Get a dummy item that is used if `this.items.length === 0` ist. Significantly simplifies the
     * treatment for this case in various situations.
     * @returns An item with a one pixel transparent GIF image.
     */
    protected getDummyItem(): IViewerItem {
        const result = this.getItem({ URL: IMAGE_ONE_PIXEL_TRANSPARENT, Zoom: Zoom.Z100 }); // eslint-disable-line jsdoc/require-jsdoc
        result.Loaded = true;
        result.Component = new Img(IMAGE_ONE_PIXEL_TRANSPARENT, 1, 1, "Placeholder item for empty viewer", false);
        result.Component.Hidden = true;
        return result;
    }

    /**
     * Translate all inner components based on the current options.
     * @param options The current viewer options.
     * @returns This instance.
     */
    protected i18n(options: ViewerOptions): this {
        /* eslint-disable jsdoc/require-jsdoc */
        this.btnZoomIn.options({ Title: options.ZoomInBtnOptions!.Title! });
        this.btnZoomOut.options({ Title: options.ZoomOutBtnOptions!.Title! });
        this.btnZoomFit.options({ Title: options.ZoomFitBtnOptions!.Title! });
        this.btnZoomFitWidth.options({ Title: options.ZoomFitWidthBtnOptions!.Title! });
        this.btnZoomFitHeight.options({ Title: options.ZoomFitHeightBtnOptions!.Title! });
        /* eslint-enable */
        this.zoomRange.title(options.ZoomRange!);
        for (const item of this.items) {
            if (item.LoadError && item.Component) {
                const loadingError = options.LoadingError!.replaceAll("%s", item.URL);
                item.Component
                    .alt(loadingError)
                    .title(loadingError);
            }
        }
        return this;
    }

    /**
     * Create a toolbar button.
     * @param clazz The CSS class for the button.
     * @param clickHandler Click handler for the button.
     * @returns A toolbar button.
     */
    protected getToolbarIconButton(clazz: string, clickHandler: (ev: KeyboardEvent | MouseEvent | PointerEvent) => void): IconButton {
        return new IconButton()
            .addClass(clazz, "zoom-button")
            .on("click", clickHandler);
    }

    /**
     * Rebuilds the toolbar. Called by a `return<Component>()` function or by `this.options()`.
     * @returns This instance.
     */
    protected rebuildToolbar(): this {
        this.toolBar.remove();
        for (const element of this._options.ToolbarElements!) {
            switch (element) {
                case ToolbarElement.STEPPER:
                    this.stepperBorrowed || this.toolBar.append(this.stepper);
                    break;
                case ToolbarElement.ZOOM_IN_OUT:
                    this.zoomInOutBorrowed || this.toolBar.append(this.zoomInOut);
                    break;
                case ToolbarElement.ZOOM_FIT:
                    this.zoomFitBorrowed || this.toolBar.append(this.zoomFit);
                    break;
                case ToolbarElement.ITEM_INDEX:
                    this.itemIndexBorrowed || this.toolBar.append(this.itemIndex);
                    break;
                case ToolbarElement.ZOOM_LEVEL:
                    this.zoomLevelBorrowed || this.toolBar.append(this.zoomLevel);
                    break;
                case ToolbarElement.ZOOM_RANGE:
                    this.zoomRangeBorrowed || this.toolBar.append(this.zoomRange);
            }
        }
        return this;
    }

    /**
     * Create toolbar component for the viewer.
     */
    protected buildToolbarElements(): void {
        this.toolBar = new Div()
            .addClass("toolbar");
        this.stepper = new Stepper(this)
            .addClass(Stepper.DefaultCSSClassName)
            .on("step", (ev) => {
                if (!this.dispatch(new ViewerStepEvent(this, ev.$.Index))) {
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                }
            })
            .on("stepped", (ev) => {
                this.emit(new ViewerSteppedEvent(this, ev.$.Index));
            });
        this.zoomInOut = new Div()
            .addClass("zoom-in-out")
            .append(
                this.btnZoomIn = this.getToolbarIconButton("btn-zoom-in", this.zoomIn.bind(this)),
                this.btnZoomOut = this.getToolbarIconButton("btn-zoom-out", this.zoomOut.bind(this))
            );
        this.zoomFit = new Div()
            .addClass("zoom-fit")
            .append(
                this.btnZoomFit = this.getToolbarIconButton("btn-zoom-fit", (ev: KeyboardEvent | MouseEvent | PointerEvent) => { this.zoom(Zoom.FIT, ev.shiftKey); }),
                this.btnZoomFitWidth = this.getToolbarIconButton("btn-zoom-fit-width", (ev: KeyboardEvent | MouseEvent | PointerEvent) => { this.zoom(Zoom.FITWIDTH, ev.shiftKey); }),
                this.btnZoomFitHeight = this.getToolbarIconButton("btn-zoom-fit-height", (ev: KeyboardEvent | MouseEvent | PointerEvent) => { this.zoom(Zoom.FITHEIGHT, ev.shiftKey); })
            );
        this.itemIndex = new Span()
            .addClass("item-index")
            .phrase(`0/0`);
        this.zoomLevel = new Span()
            .addClass("zoom-level");
        this.zoomRange = new RangeInput(undefined, "0.5", undefined, "0.0025", "1", "0.0025")
            .addClass("zoom-range")
            .on("input", this.onZoomRangeChange.bind(this));
    }

    /**
     * Create item container (scroll panel) for the viewer.
     */
    protected buildItemContainer(): void {
        this.itemContainer = new ScrollContainer(true, true, false)
            .addClass("item-container", ScrollContainer.DefaultCSSClassName);
        this.itemContainer.Content.on("scroll", this.fncOnItemContainerScroll, { passive: true }); // eslint-disable-line jsdoc/require-jsdoc
        this.itemResizeObserver = new ResizeObserver((entries => {
            for (const entry of entries) {
                if (this.item.Loaded && this.item.Component && (entry.target === this.itemContainer.DOM)) {
                    this.calcScaleForZoomFit(this.item);
                    this.updateZoomControls(this.item);
                }
            }
        }));
        this.itemResizeObserver.observe(this.itemContainer.DOM);
    }

    /** @inheritdoc */
    protected buildUI(): this {
        this.ui = new Div();
        // .append(this.#pointerDot = new Div().addClass("pointer-dot"));
        this.buildToolbarElements();
        this.buildItemContainer();
        this.pinchZoomHandler = new PinchZoomGestureHandler(this.itemContainer.Content, false)
            .on("pinch-zoom", this.fncOnPinchZoom);
        return this;
    }

    /** @inheritdoc */
    public override dispose(): void {
        this.itemResizeObserver.unobserve(this.itemContainer.DOM);
        // Dispose of this handler manually (it isn't mounted).
        this.pinchZoomHandler.dispose();
        // Both the toolbar and the item container can be mounted or not, so make sure they are
        // disposed of!
        this.ui.remove(this.toolBar);
        // These components can be mounted elsewhere so that they have to be disposed of manually.
        for (const component of [this.stepper, this.zoomInOut, this.zoomFit, this.itemIndex, this.zoomLevel, this.zoomRange]) {
            component.Parent?.remove(component);
            // Check the `Disposed` status: e.g. `this.itemIndex` could have been misused as a
            // separator for the splitter and would therefore already have been disposed of.
            component.Disposed || component.dispose();
        }
        this.toolBar.dispose();
        this.ui.remove(this.itemContainer);
        // Manually dispose of the current image and throbber component before disposing of the
        // item container.
        this.item?.Component?.Parent?.remove(this.item.Component);
        this.item?.Throbber?.Parent?.remove(this.item.Throbber);
        this.itemContainer.dispose();
        for (const item of this.items) {
            item.Component?.dispose();
            item.Component = undefined;
            item.Throbber?.dispose();
            item.Throbber = undefined;
        }
        this.dummyItem.Component?.dispose();
        this.dummyItem.Component = undefined;
        this.dummyItem.Throbber?.dispose();
        this.dummyItem.Throbber = undefined;
        super.dispose();
    }
}

/**
 * Factory for `Viewer` components.
 */
export class ViewerFactory<T> extends ComponentFactory<Viewer> {
    /**
     * Create, set up and return viewer component.
     * @param options Options for the viewer.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Viewer component.
     */
    public viewer(options?: ViewerOptions, data?: T): Viewer {
        return this.setupComponent(new Viewer(options), data);
    }
}

import { ACustomComponentEvent, AElementComponent, AElementComponentWithInternalUI, AnyType, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, DefaultEventMap, ElementComponentVoid, FlowContent, generateUUID, getProp } from "@vanilla-ts/core";
import { Div, RangeInput, Span } from "@vanilla-ts/dom";
import { IconButton, IconButtonOptions } from "./IconButton.js";
import { PINCH_ZOOM_START, PINCH_ZOOM_STOP, PinchZoomEvent, PinchZoomGestureHandler } from "./PinchZoomGestureHandler.js";
import { ScrollContainer } from "./ScrollContainer.js";
import { ISteppable, IStepper, Stepper, StepperAppearance, StepperOptions } from "./Stepper.js";
import { Throbber } from "./Throbber.js";


/**
 * Custom 'viewer-item-ready' event for viewer items. This event is emitted by viewer items when
 * they have finished loading/building their content. The `Success` property of the event details
 * indicates whether loading/building the content was successfully or not. Viewer items must only
 * emit this event if they are loading/building their content in an asynchronous manner.
 */
export class ViewerItemReadyEvent extends ACustomComponentEvent<"viewer-item-ready", IViewerItemComponent, {
    /** Indicates whether the item was loaded/built successfully or not. */
    Success: boolean;
}> {
    /**
     * Create ViewerItemReadyEvent event. The event is purely informative and can't be cancelled.
     * @param sender The event emitter (always an instance of `IViewerItemComponent`).
     * @param success Indicates whether the item was loaded/built successfully or not.
     */
    constructor(sender: IViewerItemComponent, success: boolean) {
        super("viewer-item-ready", sender, { Success: success }, DEFAULT_EVENT_INIT_DICT); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `IViewerItemComponent`. */
export interface ViewerItemEventMap extends DefaultEventMap {
    /**
     * A viewer item has finished loading/building its content. The `Success` property of the event
     * details indicates whether the content was loaded/built successfully or not. The event is
     * purely informative and can't be cancelled.
     */
    "viewer-item-ready": ViewerItemReadyEvent;
}

/**
 * Interface that must be implemented by components that are used as items in the viewer. Basically
 * there are two types of viewer items:
 *
 * - Items that load/build their content asynchronously, for example an image that is loaded from a
 *   URL. These items _must_ emit a `ViewerItemReadyEvent` when they have finished loading/building
 *   their content. The `Ready` property of the item must return `false` until the item has finished
 *   loading/building its content and it must return `true` afterwards. Even if an error occurs
 *   while loading/building the content, the `Ready` property must return `true` after the
 *   loading/building process has finished.
 * - Items that load/build their content synchronously, for example a component that displays some
 *   static text. These items can simply return `true` from the start for the `Ready` property and
 *   must not emit a `ViewerItemReadyEvent` at all.
 *
 * The `HasError` property of the item must return `true` if an error occurred while
 * loading/building the content, otherwise it must return `false`.
 */
export interface IViewerItemComponent extends AElementComponent<HTMLElement, ViewerItemEventMap> {
    /**
     * An ID that identifies the item. No checks are performed to ensure uniqueness or suitability
     * for a specific purpose. The ID can be used, for example, to identify an item in the `Items`
     * array of a `Viewer` instance in order to save/restore its state.
     */
    readonly ItemID: string;
    /** This property is `true` when the item has finished loading/building (successful or not). */
    readonly Ready: boolean;
    /** This property is `true` only if an error occurred while loading/building the item. */
    readonly HasError: boolean;
    /**
     * The 'natural' width of the component. For images this is the number of pixels in the
     * horizontal dimension. For other components it is the width of the component when rendered
     * without any scaling. Usually this width is equivalent to the value of `offsetWidth` of the
     * component.
     */
    readonly NaturalWidth: number;
    /**
     * The 'natural' height of the component. For images this is the number of pixels in the
     * vertical dimension. For other components it is the height of the component when rendered
     * without any scaling. Usually this height is equivalent to the value of `offsetHeight` of the
     * component.
     */
    readonly NaturalHeight: number;
    /**
     * Scales the component by the specified factor. Scaling always preserves the aspect ratio of
     * the component. For example, a `scale` value of `2` would double the size of the component
     * (horizontally and vertically) while a `scale` value of `0.5` would reduce the size of the
     * component to the half. A `scale` value of `1` would keep the component at its original size,
     * determined by {@link IViewerItemComponent.NaturalWidth}
     * and {@link IViewerItemComponent.NaturalHeight}. If `scale` is set to `0`, the size of the
     * component is undefined, so `0` should never be used for scaling the component.
     *
     * If `scale` is negative, the component is scaled to fit into the viewer according to the
     * following rules:
     *
     * - `scale` is `-1` ({@link Zoom.FIT}): The component is scaled to fit the viewer horizontally
     *   and vertically so that the complete component is visible.
     * - `scale` is `-2` ({@link Zoom.FITWIDTH}): The component is scaled to fit the width of the
     *   viewer.
     * - `scale` is `-3` ({@link Zoom.FITHEIGHT}): The component is scaled to fit the height of the
     *   viewer.
     * - `scale` is another negative value: The size of the component is undefined.
     *
     * For `scale = -2` and `scale = -3`, parts of the component may not be visible depending on the
     * aspect ratio of the component and the viewer.
     * @param scale The scale factor to apply to the component.
     */
    scale(scale: number): this;
    /**
     * Called when the component is added to a viewer. The implementation of this function is
     * optional.
     * @param viewer The viewer that the item component is added to. If the item component is
     * removed from the viewer (by calling `destroyItems()` or `extractItems()` or through new
     * options), this function is called again with `viewer` set to `undefined`.
     */
    viewer?(viewer?: Viewer): void;
    /**
     * Called when the size of the viewer changes. If necessary, items can adjust their layout or
     * dimensions if the containing viewer changes its size, especially if the zoom level is set to
     * one of the `fit` options. The implementation of this function is optional.
     */
    viewerResized?(): void;
}

/** Internal dummy viewer item used at various places in the viewer. */
class DummyViewerItem extends ElementComponentVoid<HTMLImageElement> implements IViewerItemComponent {
    /* eslint-disable jsdoc/require-jsdoc */
    constructor() {
        super("img");
        /** A transparent GIF image with one pixel. */
        this.DOM.src = "data:image/gif;base64,R0lGODlhAQABAIABAP///////yH5BAUKAAEALAAAAAABAAEAAAICTAEAOw==";
        this.DOM.alt = "Placeholder item for empty viewer";
    }
    public get ItemID(): string { return generateUUID(); }
    public get NaturalWidth(): number { return 1; }
    public get NaturalHeight(): number { return 1; }
    public scale(_scale: number): this { return this; }
    public get Ready(): boolean { return true; }
    public get HasError(): boolean { return false; }
    /* eslint-enable */
}

/** Position of the toolbar. */
export enum ToolbarPosition {
    TOP = "top",
    END = "end",
    BOTTOM = "bottom",
    START = "start"
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

/**
 * Options for instances of `Viewer`. The options are used to initialize the viewer _and_ they can
 * be used to completely re-configure an existing instance of a viewer. All options properties are
 * optional, missing properties are replaced by their defaults (when using `new Viewer(options)`) or
 * by the values already existing in the viewers options (when reconfiguring a viewer instance).
 * @example
 * ```typescript
 * import { AnyType } from "@vanilla-ts/core";
 * import { Viewer, ToolbarPosition, Zoom, ToolbarElement } from "@vanilla-ts/components";
 * import { ViewerItemImage } from "@vanilla-ts/components/viewer-item-image";
 *
 * // Get a viewer instance and display image 'Img05.svg' initially.
 * const viewer = new Viewer({
 *   Items: [
 *     new ViewerItemImage("Img01.png"),
 *     new ViewerItemImage("Img02.png"),
 *     new ViewerItemImage("Img03.jpg"),
 *     new ViewerItemImage("Img05.svg")
 *   ]
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
 * // Remove and destroy all existing items from the viewer, add the image 'Img06.gif', show the
 * // toolbar only when hovering over it at the end of the viewer (right in 'ltr' direction, left in
 * // 'rtl' direction), disable the handling of pinch zoom gestures and display 'Img06.gif' at
 * // `200%` magnification).
 * viewer.options({
 *   Items: [new ViewerItemImage("Img06.gif")],
 *   ToolbarPosition: ToolbarPosition.END,
 *   ToolbarHidden: true,
 *   Zoom: Zoom.Z200,
 *   PinchZoom: false
 * });
 *
 * // Prepare the viewer for use on a mobile device. Here, the toolbar in the viewer is omitted, so
 * // that scrolling through the images must be done elsewhere using the viewer's `IStepper`
 * // interface, for example with separate buttons that call `viewer.First()`, `viewer.Forward()`
 * // etc. themselves.
 * viewer.options({
 *   Items: [
 *     new ViewerItemImage("Img01.png"),
 *     new ViewerItemImage("Img02.png"),
 *     new ViewerItemImage("Img03.jpg"),
 *     new ViewerItemImage("Img05.svg")
 *   ],
 *   OmitToolbar: true,
 *   PinchZoom: true
 * });
 *
 * // Set new items on the viewer (destroys existing items). The zoom level of the image with the
 * // URL `Img02.png` is set to `Zoom.FITWIDTH` so that it fits the width of the viewer, the scaling
 * // of the image with the URL `Img03.jpg` is set to an initialvalue of `1.5` and is scrolled so
 * // that its lower right corner is visible.
 * viewer.options({
 *   Items: [
 *     new ViewerItemImage("Img01.png"),
 *     { Item: new ViewerItemImage("Img02.png"), Zoom: Zoom.FITWIDTH },
 *     { Item: new ViewerItemImage("Img03.jpg"), Scale: 1.5, ScrollPos: new DOMPoint(100000, 100000) },
 *     new ViewerItemImage("Img05.svg")
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
 *
 * // Add an item of type `ViewerItemCanvas` to the viewer.
 * import { ViewerItemCanvas, ViewerItemCanvasDrawFunction } from "@vanilla-ts/components/viewer-item-canvas";
 *
 * const drawFnc: ViewerItemCanvasDrawFunction = (
 *   canvas: HTMLCanvasElement,
 *   scale: number,
 *   canvasScale: number = 1
 * ) => {
 *   const ctx = canvas.getContext("2d", { alpha: false })!;
 *   ctx.fillStyle = "white";
 *   ctx.fillRect(0, 0, canvas.width, canvas.height);
 *   ctx.fillStyle = "black";
 *   ctx.font = `${16 * scale * canvasScale}px sans-serif`;
 *   ctx.fillText("Canvas text", 50 * scale * canvasScale, 100 * scale * canvasScale);
 * };
 * const canvasItem = new ViewerItemCanvas(drawFnc, 2)
 *   .ready(true, 400, 600); // The canvas item is ready and has a size of 400x600 pixels.
 * viewer.options({
 *   Items: [...viewer.Items, canvasItem]
 * });
 *
 * // Add the first 10 pages of a PDF document to the viewer.
 * import { getPDFCanvasViewerItems } from "@vanilla-ts/components/pdf-canvas-items";
 * import { loadPDF, PDFPageErrorHandler } from "@vanilla-ts/components/pdf-load";
 *
 * // Primitive page rendering error handler.
 * const pdfRenderPageErrorHandler: PDFPageErrorHandler = (reason: AnyType, pageNumber: number) => {
 *   console.error(`Error rendering PDF page ${pageNumber}:`, reason);
 * };
 *
 * // Primitive error handler for getting pages from the document.
 * const pdfGetPageErrorHandler: PDFPageErrorHandler = (reason: AnyType, pageNumber: number) => {
 *   console.error(`Error getting PDF page ${pageNumber}:`, reason);
 * };
 *
 * const pdfDoc = await loadPDF("TraceMonkey.pdf").promise;
 * const pages = getPDFCanvasViewerItems(
 *   pdfDoc,
 *   2,
 *   window.devicePixelRatio || 1,
 *   "-10",
 *   undefined, // Use default debounce delay (`100`)
 *   {},        // No additional rendering options
 *   pdfRenderPageErrorHandler,
 *   pdfGetPageErrorHandler
 * );
 * viewer.options({
 *   Items: [...viewer.Items, ...pages]
 * });
 * ```
 */
export interface ViewerOptions {
    /**
     * An array of items to be displayed in the viewer. If an array element is of type
     * `IViewerItemComponent` the default settings for `Zoom`, `Scale` and `ScrollPos` are applied
     * to the item, otherwise the given properties for `Zoom`, `Scale` and `ScrollPos` in the object
     * are applied. If `Items` is an empty array, no toolbar is shown.\
     * Default: `[]`.
     */
    Items?: (IViewerItemComponent | {
        /** An item component which displays the content of the item. */
        Item: IViewerItemComponent;
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
}

/** Current properties of a viewer item (only internally used). */
interface InternalViewerItem {
    /** An instance of a viewer item component. */
    Component: IViewerItemComponent;
    /** The current zoom level of the item. */
    Zoom: Zoom;
    /** The current magnification level of the item. */
    Scale: number;
    /** The scroll position of the item in its container. */
    ScrollPos: DOMPoint;
    /** Whether the item has been displayed at least once. */
    DisplayedOnce: boolean;
}

/** Public properties of a viewer item. */
export interface ViewerItem {
    /** An item component which displays the content of the item. */
    Item: IViewerItemComponent;
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
}

/** Custom 'viewer-step' event for viewers. */
export class ViewerStepEvent extends ACustomComponentEvent<"viewer-step", Viewer, {
    /** The new index to be stepped to in the viewer object. */
    Index: number;
}> {
    /**
     * Create ViewerStepEvent event. Event handlers can prevent changing the index/position by
     * calling `preventDefault()`.
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
     * Create ViewerSteppedEvent event. This event is purely informative and can't be cancelled.
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
export interface ViewerEventMap extends DefaultEventMap {
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

/**
 * Component for displaying items. Currently items must be of type image (everything that the `img`
 * tag can display, e.g. JPEG, PNG, ...), future versions may also support other media types.
 */
export class Viewer<EventMap extends ViewerEventMap = ViewerEventMap> extends AElementComponentWithInternalUI<Div, EventMap> implements ISteppable, IStepper {
    protected _options: ViewerOptions = {};
    protected item: InternalViewerItem;
    protected dummyItem: InternalViewerItem = this.getDummyItem();
    protected throbber? = new Throbber().addClass("throbber", "vts-throbber");
    protected items: InternalViewerItem[] = [];
    protected fncOnItemReady = this.onItemReady.bind(this);
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
     * @param options Options for the viewer. Default: `{}`.
     * @param initialIndex The initial index of the item to be displayed. Default: `0`.
     */
    constructor(options?: ViewerOptions, initialIndex = 0) {
        super();
        this
            .initialize()
            .options(options ?? this._options, initialIndex);
    }

    /**
     * Get/set the options for this viewer. The returned object is a _copy_, modifying this copy has
     * no effect on the corresponding viewer instance.
     */
    public get Options(): ViewerOptions {
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            ...this._options,
            Items: this._options.Items!.map(e => typeof e === "object" && "Item" in e ? { ...e } : e),
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
            ToolbarElements: getProp(options, this._options, "ToolbarElements", [ToolbarElement.STEPPER, ToolbarElement.ZOOM_IN_OUT, ToolbarElement.ZOOM_FIT, ToolbarElement.ITEM_INDEX, ToolbarElement.ZOOM_LEVEL, ToolbarElement.ZOOM_RANGE]),
            OmitToolbar: getProp(options, this._options, "OmitToolbar", false),
            ToolbarPosition: getProp(options, this._options, "ToolbarPosition", ToolbarPosition.TOP),
            ToolbarHidden: getProp(options, this._options, "ToolbarHidden", false),
            StepperApperanceHorizontalAlt: getProp(options, this._options, "StepperApperanceHorizontalAlt", false),
            StepperApperanceVerticalAlt: getProp(options, this._options, "StepperApperanceVerticalAlt", false),
            Zoom: getProp(options, this._options, "Zoom", Zoom.FIT),
            PinchZoom: getProp(options, this._options, "PinchZoom", false),
            NativeScrollbars: getProp(options, this._options, "NativeScrollbars", false),
            Locale: getProp(options, this._options, "Locale", ""),
            ZoomInBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomInBtnOptions, this._options.ZoomInBtnOptions),
            ZoomOutBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomOutBtnOptions, this._options.ZoomOutBtnOptions),
            ZoomFitBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomFitBtnOptions, this._options.ZoomFitBtnOptions),
            ZoomFitWidthBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomFitWidthBtnOptions, this._options.ZoomFitWidthBtnOptions),
            ZoomFitHeightBtnOptions: IconButton.mergeOptionsFromTo(options.ZoomFitHeightBtnOptions, this._options.ZoomFitHeightBtnOptions),
            ZoomRange: getProp(options, this._options, "ZoomRange", ""),
            /* eslint-enable */
        };
        if (options.Items) {
            this.replaceItemsWith(options.Items);
            opts.Items = options.Items.map(e => typeof e === "object" && "Item" in e ? { ...e } : e);
        } else {
            opts.Items = [...(this._options.Items ?? [])];
        }
        this._options = opts;
        this.item = this.items[index ?? -1] ?? this.items.find(e => e === this.item) ?? this.items[0] ?? this.dummyItem;
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
            .syncUIForIndex(this.items.findIndex(e => e === this.item));
        return this;
    }

    /**
     * Get all viewer items that this viewer currently contains (_as a copy_).
     */
    public get Items(): ViewerItem[] {
        return this.items.map(e => ({
            /* eslint-disable jsdoc/require-jsdoc */
            Item: e.Component,
            Zoom: e.Zoom,
            Scale: e.Scale,
            ScrollPos: DOMPoint.fromPoint(e.ScrollPos),
            /* eslint-enable */
        }));
    }

    /**
     * Removes _and destroys_ all current viewer items.
     * @returns This instance.
     */
    public destroyItems(): this {
        for (const item of this.items) {
            item.Component.Parent?.remove(item.Component);
            item.Component.dispose();
        }
        this.items.length = 0;
        this.syncUIForIndex(-1);
        return this;
    }

    /**
     * Removes _all_ viewer items and returns them.
     * @returns The removed item components.
     */
    public extractItems(): IViewerItemComponent[] {
        const result = this.items.map(item => {
            item.Component.viewer?.(undefined);
            item.Component.Parent?.remove(item.Component);
            return item.Component
                .removeClass("viewer-item-component")
                .off("viewer-item-ready", this.fncOnItemReady)
                .hidden(false);
        });
        this.items.length = 0;
        this.syncUIForIndex(-1);
        return result;
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
            this._options.OmitToolbar || this.ui.insert(0, this.toolBar);
        } else {
            this._options.OmitToolbar || this.ui.append(this.toolBar);
        }
        if (this.item.Component.Ready) {
            [Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT].includes(this.item.Zoom) && this.zoom(this.item.Zoom);
            this.itemContainer.scroll(this.item.ScrollPos.x, this.item.ScrollPos.y);
        }
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
        if (this.item.Component.Ready) {
            [Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT].includes(this.item.Zoom) && this.zoom(this.item.Zoom);
            this.itemContainer.scroll(this.item.ScrollPos.x, this.item.ScrollPos.y);
        }
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
        if (!this.item.Component.HasError) {
            this.centerOnZoomOrScale(this.item, zoom, this.item.Scale);
        }
        if (all) {
            for (const item of this.items) {
                if (item !== this.item && !item.Component.HasError) {
                    this.zoomItem(item, zoom);
                }
            }
        }
        this.emitZoomEvent();
        return this;
    }

    /**
     * Zoom in on the current item.
     * @param ev The triggering event.
     */
    public zoomIn(ev: PointerEvent | MouseEvent | KeyboardEvent): void {
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
        const rect = this.DOM.getBoundingClientRect();
        this.clickPoint = ev instanceof MouseEvent && ev.target && this.item.Component.DOM.contains(<Node>ev.target)
            ? new DOMPoint(ev.clientX - rect.x, ev.clientY - rect.y)
            : new DOMPoint(this.itemContainer.DOM.offsetWidth - rect.left, this.itemContainer.DOM.offsetHeight - rect.top);
        (ev instanceof MouseEvent || ev instanceof PointerEvent) && this.item.Component.DOM.contains(<Node>ev.target)
            ? this.centerZoomToPointer(this.item, zoom, scale, newScale, ev)
            : this.centerOnZoomOrScale(this.item, zoom, scale);
        this.emitZoomEvent();
    }

    /**
     * Zoom out on the current item.
     * @param ev The triggering event.
     */
    public zoomOut(ev: PointerEvent | MouseEvent | KeyboardEvent): void {
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
        const rect = this.DOM.getBoundingClientRect();
        this.clickPoint = ev instanceof MouseEvent && this.item.Component.DOM.contains(<Node>ev.target)
            ? new DOMPoint(ev.clientX - rect.x, ev.clientY - rect.y)
            : new DOMPoint(this.itemContainer.DOM.offsetWidth - rect.left, this.itemContainer.DOM.offsetHeight - rect.top);
        (ev instanceof MouseEvent || ev instanceof PointerEvent) && this.item.Component.DOM.contains(<Node>ev.target)
            ? this.centerZoomToPointer(this.item, zoom, scale, newScale, ev)
            : this.centerOnZoomOrScale(this.item, zoom, scale);
        this.emitZoomEvent();
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
        if (!this.item.Component.HasError) {
            this.centerOnZoomOrScale(this.item, scale, this.item.Scale);
        }
        if (all) {
            for (const item of this.items) {
                if (item !== this.item && !item.Component.HasError) {
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
    protected borrowComponent<T extends FlowContent>(borrowed: boolean, component: T): T {
        if (borrowed) {
            return component;
        }
        switch (<FlowContent>component) {
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
    protected returnComponent(borrowed: boolean, component: FlowContent): this {
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
        } else if (l <= 100) {
            return 10;
        } else if (l <= 500) {
            return 50;
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
     * Get the size of the area in which the current item is displayed (i.e. the size of the item
     * container). This can help viewer items to calculate the appropriate zoom/scale level for one
     * of the viewer's `fit` zoom options.
     * @returns An object containing the client width and client height of the inner item container.
     */
    public get ClientRect(): { Width: number; Height: number; } { // eslint-disable-line jsdoc/require-jsdoc
        const rect = this.itemContainer.DOM.getBoundingClientRect();
        return { Width: rect.width, Height: rect.height }; // eslint-disable-line jsdoc/require-jsdoc
    }

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
            this.item.Component.Ready && this.itemContainer.scroll(this.item.ScrollPos.x, this.item.ScrollPos.y);
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
     * Displays an item.
     * @param item The item to be displayed.
     */
    protected displayItem(item: InternalViewerItem): void {
        this.lastDisplayState.Zoom = item.Zoom;
        this.lastDisplayState.Scale = item.Scale;
        this.lastDisplayState.ScrollPos.x = item.ScrollPos.x;
        this.lastDisplayState.ScrollPos.y = item.ScrollPos.y;
        this.setZoomControlsVisibility(
            !item.Component.Ready
                ? false
                : !item.Component.HasError
        );
        // An item is always mounted, even if it has loading/building errors. This allows the item
        // to display an error message or similar inside the item component itself.
        this.itemContainer
            .remove()
            .append(item.Component);
        if (!item.Component.Ready) {
            this.ui.contains(this.throbber!) || this.ui.append(this.throbber);
            return;
        }
        if (!item.DisplayedOnce) {
            // Adjust the scale/zoom once if there was no error loading/building the item.
            if (!item.Component.HasError) {
                if (item.Zoom === Zoom.ZOTHER) {
                    this.scaleItem(item, item.Scale);
                } else {
                    this.zoomItem(item, item.Zoom);
                }
            }
            item.DisplayedOnce = true;
        }
        // Update the toolbar and scroll position if there was no error loading/building the item.
        if (!item.Component.HasError) {
            [Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT].includes(item.Zoom) && this.calcScaleForZoomFit(item);
            this.updateZoomControls(this.item);
            this.scrollOffset(this.item.ScrollPos.x, this.item.ScrollPos.y);
        }
        this.ui.remove(this.throbber);
    }

    /**
     * Emitted by an `IViewerItemComponent` if the component has finished loading/building itself
     * (successful or not).
     * @param ev The viewer item ready event.
     */
    protected onItemReady(ev: ViewerItemReadyEvent): void {
        const item = this.items.find(e => e.Component === ev.$.Sender);
        if (!item) {
            return;
        }
        if (item === this.item) {
            item.DisplayedOnce = true;
            if (ev.$.Success) {
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
            } else {
                this.removeZoomClasses(item);
            }
            this.setZoomControlsVisibility(ev.$.Success);
            this.ui.remove(this.throbber);
        }
        item.Component
            .off("viewer-item-ready", this.fncOnItemReady)
            .hidden(false);
    }

    /**
     * Updates the list of items based on new items. An attempt is made to retain as many existing
     * item instances as possible.
     * @param items An array with (new) items to be used.
     * @returns This instance.
     */
    protected replaceItemsWith(items: (IViewerItemComponent | { Item: IViewerItemComponent; Zoom?: Zoom; Scale?: number; ScrollPos?: DOMPoint; })[]): this { // eslint-disable-line jsdoc/require-jsdoc
        if (items.length === 0) {
            this.destroyItems();
            return this;
        }
        const newItems: InternalViewerItem[] = [];
        for (const item of items) {
            const idx = this.items.findIndex(e => e.Component === (typeof item === "object" && "Item" in item ? item.Item : item));
            // Update an existing item with settings from the given item. For the handling of `Zoom`
            // and `Scale` see the documentation of `ViewerItem` and `getItem()`.
            if ((idx !== -1) && (typeof item === "object" && "Item" in item)) {
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
                    : this.createViewerItem(item)
            );
        }
        for (const item of this.items) {
            item.Component.Parent?.remove(item.Component);
            item.Component.dispose();
        }
        this.items.length = 0;
        this.items.push(...newItems);
        return this;
    }

    /**
     * Remove all zoom marker classes from an item.
     * @param item The item from which the zoom marker classes are to be removed.
     */
    protected removeZoomClasses(item: InternalViewerItem): void {
        item?.Component.removeClass(
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
    protected zoomItem(item: InternalViewerItem, zoom: Zoom): void {
        item.Zoom = zoom;
        if (!item.Component) {
            return;
        }
        this.removeZoomClasses(item);
        item.Component.addClass(item.Zoom);
        switch (item.Zoom) {
            case Zoom.FIT:
                item.Scale = -1;
                break;
            case Zoom.FITWIDTH:
                item.Scale = -2;
                break;
            case Zoom.FITHEIGHT:
                item.Scale = -3;
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
        item.Component.scale(item.Scale);
        (item.Scale < 0) && this.calcScaleForZoomFit(item);
    }

    /**
     * Center the item to the current mouse or pointer position on zooming in or out.
     * @param item The item which is to be centered.
     * @param value The zoom level or magnification level to be set on the item.
     * @param prevscale The previous scale amount of the item.
     * @param newScale The new scale amount of the item.
     * @param ev The triggering muse or pointer event.
     */
    protected centerZoomToPointer(item: InternalViewerItem, value: Zoom | number, prevscale: number, newScale: number, ev: MouseEvent | PointerEvent | { clientX: number, clientY: number; }): void { // eslint-disable-line jsdoc/require-jsdoc
        let ctrlRect = this.item.Component.DOM.getBoundingClientRect();
        const containerWidth = this.itemContainer.DOM.offsetWidth;
        const containerHeight = this.itemContainer.DOM.offsetHeight;
        const prevScrollRangeHalf = new DOMPoint((ctrlRect.width - containerWidth) / 2, (ctrlRect.height - containerHeight) / 2);
        const pointerOffset = new DOMPoint(0, 0);
        const rect = this.itemContainer.DOM.getBoundingClientRect();
        const center = new DOMPoint(containerWidth / 2, containerHeight / 2);
        if (this.item.Component.NaturalWidth * newScale - containerWidth > 0) {
            pointerOffset.x = ev.clientX - center.x - rect.x;
        }
        if (this.item.Component.NaturalHeight * newScale - containerHeight > 0) {
            pointerOffset.y = ev.clientY - center.y - rect.y;
        }
        // this.#pointerDot.style("left", `${ev.clientX - rect.x + this.itemContainer.DOM.offsetLeft}px`);
        // this.#pointerDot.style("top", `${ev.clientY - rect.y + this.itemContainer.DOM.offsetTop}px`);
        const rtlN = getComputedStyle(this.itemContainer.DOM).direction === "rtl" ? -1 : 1;
        const prevScrollPos = new DOMPoint(rtlN * this.itemContainer.ScrollOffset.X, this.itemContainer.ScrollOffset.Y);
        typeof value === "number"
            ? this.scaleItem(item, value)
            : this.zoomItem(item, value);
        ctrlRect = this.item.Component.DOM.getBoundingClientRect();
        const scaleFactor = this.item.Scale / prevscale;
        const newScrollPosX = ((ctrlRect.width - containerWidth) / 2)
            + ((prevScrollPos.x - Math.max(prevScrollRangeHalf.x, 0)) * scaleFactor);
        const newScrollPosY = ((ctrlRect.height - containerHeight) / 2)
            + ((prevScrollPos.y - Math.max(prevScrollRangeHalf.y, 0)) * scaleFactor);
        this.scrollOffset(
            rtlN * (newScrollPosX) + (pointerOffset.x * scaleFactor) - pointerOffset.x,
            newScrollPosY + (pointerOffset.y * scaleFactor) - pointerOffset.y
            // `+0.5` gives more precision with repeated zoom actions(?).
            // rtlN * (newScrollPosX) + (pointerOffset.x * scaleFactor) - pointerOffset.x + 0.5,
            // newScrollPosY + (pointerOffset.y * scaleFactor) - pointerOffset.y + 0.5
        );
        this.updateZoomControls(item);
    }

    /**
     * Center the current item in the scroll container on zooming in or out.
     * @param item The item which is to be centered.
     * @param value The zoom level or magnification level of the item.
     * @param previousScale The previous scale amount of the item.
     */
    protected centerOnZoomOrScale(item: InternalViewerItem, value: Zoom | number, previousScale: number): void {
        // this.#pointerDot.style("left", "50%");
        // this.#pointerDot.style("top", "50%");
        const rtlN = getComputedStyle(this.itemContainer.DOM).direction === "rtl" ? -1 : 1;
        let ctrlRect = this.item.Component.DOM.getBoundingClientRect();
        const containerWidth = this.itemContainer.DOM.offsetWidth;
        const containerHeight = this.itemContainer.DOM.offsetHeight;
        const prevScrollRangeHalf = new DOMPoint((ctrlRect.width - containerWidth) / 2, (ctrlRect.height - containerHeight) / 2);
        const prevScrollPos = new DOMPoint(rtlN * this.itemContainer.ScrollOffset.X, this.itemContainer.ScrollOffset.Y);
        typeof value === "number"
            ? this.scaleItem(item, value)
            : this.zoomItem(item, value);
        ctrlRect = this.item.Component.DOM.getBoundingClientRect();
        const scaleFactor = this.item.Scale / previousScale;
        const newScrollPosX = ((ctrlRect.width - containerWidth) / 2)
            + ((prevScrollPos.x - Math.max(prevScrollRangeHalf.x, 0)) * scaleFactor);
        const newScrollPosY = ((ctrlRect.height - containerHeight) / 2)
            + ((prevScrollPos.y - Math.max(prevScrollRangeHalf.y, 0)) * scaleFactor);
        this.scrollOffset(
            rtlN * newScrollPosX,
            newScrollPosY
            // `+0.5` gives more precision with repeated zoom actions(?).
            // rtlN * (newScrollPosX + 0.5),
            // newScrollPosY + 0.5
        );
        this.updateZoomControls(item);
    }

    /**
     * Calculates the scaling factor for an item for the zoom levels `Zoom.FIT`, `Zoom.FITWIDTH` or
     * `Zoom.FITWIDTH`.
     * @param item The item for which the scaling factor is to be calculated. __Note__: This may
     * only work reliably if the item is displayed.
     */
    protected calcScaleForZoomFit(item: InternalViewerItem): void {
        const rect = this.itemContainer.DOM.getBoundingClientRect();
        if (item.Zoom === Zoom.FIT) {
            item.Scale = rect.width / rect.height >= (item.Component.NaturalWidth / item.Component.NaturalHeight)
                ? rect.height / item.Component.NaturalHeight
                : rect.width / item.Component.NaturalWidth;
        } else if (item.Zoom === Zoom.FITWIDTH) {
            item.Scale = rect.width / item.Component.NaturalWidth;
        } else if (item.Zoom === Zoom.FITHEIGHT) {
            item.Scale = rect.height / item.Component.NaturalHeight;
        }
    }

    /**
     * Update the state of some zoom controls in the toolbar.
     * @param item The item for which the controls are to be updated. __Note__: Only useful if the
     * item is displayed.
     */
    protected updateZoomControls(item: InternalViewerItem): void {
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
    protected scaleItem(item: InternalViewerItem, scale: number): void {
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
            if (this.item.Component.DOM.contains(<Node>ev.$.EventTarget)) {
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
        if (this.item.Component.Ready) {
            this.item.ScrollPos.x = this.itemContainer.ScrollOffset.X;
            this.item.ScrollPos.y = this.itemContainer.ScrollOffset.Y;
            this.emitScrollEvent();
        }
    }

    /**
     * Emits a `ViewerZoomEvent` if the zoom/magnification level of the current item has changed
     * since the last call of `displayItem()`.
     */
    protected emitZoomEvent(): void {
        if (this.item.Component.Ready && !this.item.Component.HasError && this.lastDisplayStateChanged()) {
            this.emit(new ViewerZoomEvent(this, this.Index, this.item.Zoom, this.item.Scale));
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
        if (this.item.Component.Ready && !this.item.Component.HasError && this.lastDisplayStateChanged()) {
            this.emit(new ViewerScrollEvent(this, this.Index, this.item.ScrollPos.x, this.item.ScrollPos.y));
            // Force `lastDisplayStateChanged()` to return `true` until the next call of
            // `displayItem()` by setting `Scale` to an invalid value.
            this.lastDisplayState.Scale = -Infinity;
        }
    }

    /**
     * Create a new complete `IViewerItem` based on an `IViewerItemComponent` instance or a
     * (partially) predefined item.
     * @param from Either an `IViewerItemComponent` instance or a (partially) predefined item.
     * @param from.URL The URL of the item
     * @param from.Zoom The zoom level of the item.
     * @param from.Scale The scale level of the item.
     * @param from.ScrollPos The scroll position of the item.
     * @returns A new complete `IViewerItem` based on `from`.
     */
    protected createViewerItem(from: IViewerItemComponent | { Item: IViewerItemComponent; Zoom?: Zoom; Scale?: number; ScrollPos?: DOMPoint; }): InternalViewerItem { // eslint-disable-line jsdoc/require-jsdoc
        let zoom: Zoom;
        let scale: number;
        let scrollPos: DOMPoint;
        // If `Zoom` is set and not `ZOTHER` it always takes precedence over `Scale` so `Scale` is
        // set to `0`. Otherwise an existing `Scale` value always sets `Zoom` to `ZOTHER`. If
        // neither `Zoom` nor `Scale` is set, the default zoom level from the viewer options is
        // used or, if that is not set, `Zoom.FIT`.
        if (typeof from === "object" && "Item" in from) {
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
        } else {
            zoom = this._options.Zoom || Zoom.FIT;
            scale = 0;
            scrollPos = new DOMPoint(0, 0);
        }
        const result = {
            /* eslint-disable jsdoc/require-jsdoc */
            Zoom: zoom,
            Scale: scale,
            ScrollPos: scrollPos,
            Component: (typeof from === "object" && "Item" in from ? from.Item : from),
            DisplayedOnce: false,
            /* eslint-enable */
        };
        result.Component
            .addClass("viewer-item-component")
            .viewer?.(this);
        if (!result.Component.Ready) {
            result.Component
                .hidden(true)
                .on("viewer-item-ready", this.fncOnItemReady);
        }
        return result;
    }

    /**
     * Get a dummy item that is used if `this.items.length === 0` ist. Significantly simplifies the
     * treatment for this case in various situations.
     * @returns An item with a one pixel transparent GIF image.
     */
    protected getDummyItem(): InternalViewerItem {
        return this.createViewerItem({ Item: new DummyViewerItem(), Zoom: Zoom.Z100 }); // eslint-disable-line jsdoc/require-jsdoc
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
            .phrase("0/0");
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
                if (this.item.Component.Ready && (entry.target === this.itemContainer.DOM)) {
                    this.item.Component.viewerResized?.();
                    this.calcScaleForZoomFit(this.item);
                    this.updateZoomControls(this.item);
                    break;
                }
            }
            for (const item of this.items) {
                (item !== this.item) && item.Component.Ready && item.Component.viewerResized?.();
            }
        }));
        this.itemResizeObserver.observe(this.itemContainer.DOM);
    }

    /** @inheritdoc */
    protected buildUI(): this {
        this.ui = new Div();
        // .addClass("debug");
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
        // The toolbar, the item container and the throbber can be mounted or not, so make sure they
        // are disposed of!
        this.ui.remove(this.toolBar, this.itemContainer, this.throbber);
        // These components can be mounted elsewhere so that they have to be disposed of manually.
        for (const component of [this.stepper, this.zoomInOut, this.zoomFit, this.itemIndex, this.zoomLevel, this.zoomRange]) {
            component.Parent?.remove(component);
            // Check the `Disposed` status: e.g. `this.itemIndex` could have been misused as a
            // separator for the splitter and would therefore already have been disposed of.
            component.Disposed || component.dispose();
        }
        this.toolBar.dispose();
        // Manually dispose of the throbber and the current image component before disposing of the
        // item container.
        this.throbber?.dispose();
        this.throbber = undefined;
        this.item?.Component.Parent?.remove(this.item.Component);
        this.itemContainer.dispose();
        for (const item of this.items) {
            item.Component.dispose();
            // @ts-expect-error ---
            item.Component = undefined;
        }
        this.items.length = 0;
        this.dummyItem.Component.dispose();
        // @ts-expect-error ---
        this.dummyItem.Component = undefined;
        super.dispose();
    }
}

/**
 * Factory for `Viewer` components.
 */
export class ViewerFactory<T> extends ComponentFactory<Viewer> {
    /**
     * Create, set up and return viewer component.
     * @param options Options for the viewer. Default: `{}`.
     * @param initialIndex The initial index of the item to be displayed. Default: `0`.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Viewer component.
     */
    public viewer(options?: ViewerOptions, initialIndex: number = 0, data?: T): Viewer {
        return this.setupComponent(new Viewer(options, initialIndex), data);
    }
}

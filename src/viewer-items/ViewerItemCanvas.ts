import { AElementComponentWithInternalUI, clamp, ComponentFactory, getDebouncedFnc, HTMLElementWithChildren, IElementWithChildrenComponent } from "@vanilla-ts/core";
import { Canvas, Div, P } from "@vanilla-ts/dom";
import { IViewerItemComponent, Viewer, ViewerItemReadyEvent } from "../Viewer.js";

/**
 * The type of the drawing function used by `ViewerItemCanvas`. The function is called whenever the
 * canvas needs to be redrawn, e.g when the canvas is loaded, zoomed, or when the viewer is resized.
 * __Important note:__ The drawing function __must__ set the `width` and `height` DOM properties of
 * the canvas element to the 'natural' width and height of the content each multiplied by the
 * current scale factor and the canvas scale factor!
 * @param canvas The canvas element to draw on.
 * @param scale The current real scale factor (see {@link ViewerItemCanvas.RealScale}).
 * @param canvasScale The scale factor applied to the canvas element itself (see
 * {@link ViewerItemCanvas.CanvasScale}).
 * @param width The 'natural' width of the canvas, i.e., the width before any scaling is applied.
 * @param height The 'natural' height of the canvas, i.e., the height before any scaling is applied.
 */
export type ViewerItemCanvasDrawFunction = (canvas: HTMLCanvasElement, scale: number, canvasScale?: number, width?: number, height?: number) => void;

/**
 * A viewer item component that displays a canvas (based on a `<canvas>` element). The content of
 * the canvas is drawn using a configurable function. A configurable error text can be shown instead
 * of the canvas element if the content can't be drawn (e.g., because it can't be loaded).
 * @see {@link ViewerItemCanvas.redraw()} for important notes on how to use this type of items in
 * viewers that are not connected to the DOM!
 */
export class ViewerItemCanvas extends AElementComponentWithInternalUI<Div> implements IViewerItemComponent {
    #itemID: string;
    #canvas: Canvas;
    #error: P;
    #errorMsg: string = "";
    #drawFnc: ViewerItemCanvasDrawFunction;
    #debouncedDrawFnc: (force?: boolean) => this | Promise<this>;
    #initialMount = false;
    #ready: boolean = false;
    #readyCalled: boolean = false;
    #hasError: boolean = false;
    #naturalWidth: number;
    #naturalHeight: number;
    #scale: number;
    #realScale: number;
    #canvasScale: number;
    #mountedCanvasWidth: number;
    #mountedCanvasHeight: number;
    #canvasCleared = false;
    #viewer?: Viewer;
    #fncOnClick = this.#onClick.bind(this);

    /**
     * Create a viewer item component that contains a canvas element.
     * @param itemID An ID that identifies the item.
     * @param drawFnc The function that is called to draw the content of the canvas (see
     * {@link ViewerItemCanvasDrawFunction}).
     * @param canvasScale The scale factor that is applied to the canvas element. This is a
     * multiplier for the width and height of the canvas element at a scale factor of 1 (i.e.,
     * without zooming). The default value is `1`; higher values may improve the rendering quality,
     * especially for PDF pages or drawings containing text for which the recommended value is `2`.
     * Values lower than `1` may be used to improve performance and reduce memory usage, but the
     * content may appear blurry. Values lower than or equal to `0` will be auto-corrected to `1`.
     * @param debounceDelay Optional debounce delay in milliseconds for the drawing function. This
     * value is automatically clamped to the range `0` to `500`. If set to `0`, no debouncing is
     * applied. If the value is greater than `0`, the drawing function will be debounced by the
     * given delay. This avoids flickering and excessive CPU usage when the viewer is resized or
     * zoomed in quick succession. Default: `100`.\
     * __Note:__ no debouncing is applied if the viewer steps from one item to another item or if
     * the item is displayed for the first time!
     */
    constructor(itemID: string, drawFnc: ViewerItemCanvasDrawFunction, canvasScale: number = 1, debounceDelay: number = 100) {
        super();
        this.#itemID = itemID;
        this.#drawFnc = drawFnc;
        const delay = clamp(debounceDelay, 0, 500);
        delay === 0
            ? this.#debouncedDrawFnc = this.redraw.bind(this)
            : this.#debouncedDrawFnc = getDebouncedFnc(this.redraw.bind(this), delay)[0];
        this.#canvasScale = canvasScale <= 0 ? 1 : canvasScale;
        this.initialize();
    }

    /** @inheritdoc */
    public get ItemID(): string { return this.#itemID; }

    /** @inheritdoc */
    public get Ready(): boolean { return this.#ready; }

    /**
     * Sets the readiness state of this viewer canvas to `true`. This __must__ be called eventually
     * no matter if the canvas content was successfully loaded/initialized or not, otherwise the
     * viewer will endlessly display a loading indicator for this item.
     * @param success `true` if the canvas content was successfully loaded or initialized so that it
     * can be drawn; otherwise `false`. If `success` is `false`, the error message (see
     * {@link ViewerItemCanvas.errorMsg}) is shown instead of the canvas element.
     * @param naturalWidth The initial width of the canvas element. This should be the width of the
     * element if it is drawn at a scale factor of 1 (i.e., without zooming).
     * @param naturalHeight The initial height of the canvas element. This should be the height of
     * the element if it is drawn at a scale factor of 1 (i.e., without zooming).
     * @param errorMsg This is equivalent to setting {@link ViewerItemCanvas.errorMsg} separately.
     * It's also available as a parameter here for convenience to set the error message at the same
     * time when setting the readiness state (usually in the case of `success` being `false`).
     * @returns This instance.
     */
    public ready(success: boolean, naturalWidth: number, naturalHeight: number, errorMsg?: string): this {
        if (this.#readyCalled) {
            throw new Error("State 'ready' of 'ViewerItemCanvas' can only be set once.");
        }
        this.#readyCalled = true;
        this.#ready = true;
        this.#naturalWidth = Math.max(naturalWidth, 1);
        this.#naturalHeight = Math.max(naturalHeight, 1);
        this.#canvas.DOM.width = this.#naturalWidth * this.#canvasScale;
        this.#canvas.DOM.height = this.#naturalHeight * this.#canvasScale;
        this.#mountedCanvasWidth = this.#canvas.DOM.width;
        this.#mountedCanvasHeight = this.#canvas.DOM.height;
        this.#hasError = !success;
        errorMsg !== undefined && this.errorMsg(errorMsg);
        // Redrawing isn't necessary since after loading, this viewer item will be scaled
        // immediately by the viewer after receiving the `ViewerItemReadyEvent`.
        this.ui.append(this.#hasError ? this.#error : this.#canvas);
        return this.emit(new ViewerItemReadyEvent(this, success));
    }

    /** @inheritdoc */
    public get HasError(): boolean { return this.#hasError; }

    /** @inheritdoc */
    public get NaturalWidth(): number { return this.#naturalWidth; }

    /** @inheritdoc */
    public get NaturalHeight(): number { return this.#naturalHeight; }

    /**
     * The calculated scale of the canvas element. Usually this is equivalent to the current value
     * of `Scale` except for the case that the scale is set to one of the `fit` options (Zoom.FIT,
     * Zoom.FITWIDTH, Zoom.FITHEIGHT) in which case `RealScale` is the actual scale factor that is
     * applied to the canvas element to fit it into the viewer.\
     * This property is rather a convenience property since the calculated scale can also be
     * obtained from the current dimensions of the canvas element and its initial dimensions (e.g.,
     * `RealScale === ViewerItemCanvas.Canvas.Width / ViewerItemCanvas.NaturalWidth`).
     */
    public get RealScale(): number { return this.#realScale; }

    /** @inheritdoc */
    public scale(scale: number): this {
        // if (scale !== this.#scale) {
        if ((scale === 0) || (this.#naturalWidth === 0) || (this.#naturalHeight === 0)) {
            this.style({ overflow: undefined, width: undefined, height: undefined }); // eslint-disable-line jsdoc/require-jsdoc
            this.#canvas.style({ overflow: undefined, width: undefined, height: undefined }); // eslint-disable-line jsdoc/require-jsdoc
            this.#scale = 0;
            this.#realScale = 0;
            return this;
        }
        if (scale > 0) {
            this.#mountedCanvasWidth = this.#naturalWidth * scale * this.#canvasScale;
            this.#mountedCanvasHeight = this.#naturalHeight * scale * this.#canvasScale;
            const width = (this.#naturalWidth * scale) + "px";
            const height = (this.#naturalHeight * scale) + "px";
            this.style({ overflow: undefined, width: width, height: height }); // eslint-disable-line jsdoc/require-jsdoc
            this.#canvas.style({ overflow: undefined, width: width, height: height }); // eslint-disable-line jsdoc/require-jsdoc
            this.#realScale = scale;
        } else {
            this.#scaleToFit(scale);
        }
        this.#scale = scale;
        if (this.#initialMount) {
            this.#initialMount = false;
            this.redraw();
        } else {
            void this.#debouncedDrawFnc();
        }
        // }
        return this;
    }

    /** @inheritdoc */
    public viewer(viewer?: Viewer): void {
        if (this.#viewer !== viewer) {
            this.#viewer = viewer;
            this.#viewer
                ? this.on("click", this.#fncOnClick)
                : this.off("click", this.#fncOnClick);
        }
    }

    /** @inheritdoc */
    public viewerResized(): void {
        if ((this.#scale ?? -1) < 0) {
            this.#scaleToFit(this.#scale);
            this.redraw();
        }
    }

    /**
     * The internal `Canvas` component of this viewer item. Only for special use cases, usually this
     * element shouldn't be accessed directly.
     */
    public get Canvas(): Canvas { return this.#canvas; }

    /**
     * Get/set the scale factor that is applied to the canvas element. This is a multiplier for the
     * width and height of the canvas element at a scale factor of 1 (i.e., without zooming). The
     * default value is `1`; higher values may improve the rendering quality, especially for PDF
     * pages or drawings containing text for which the recommended value is `2`. Values lower than
     * `1` may be used to improve performance and reduce memory usage, but the content may appear
     * blurry. Values lower than `0` will be auto-corrected to `1`.
     */
    public get CanvasScale(): number {
        return this.#canvasScale;
    }
    /** @inheritdoc */
    public set CanvasScale(v: number) {
        this.#canvasScale = v < 0 ? 1 : v;
    }

    /**
     * Redraw the content of the canvas element using the configured drawing function.\
     * __Important note:__ For reasons of performance the drawing function is only called if the
     * canvas element is connected to the DOM (i.e., mounted in a viewer that is _also_ connected to
     * the DOM)! This has important implications when a viewer is created and populated with items
     * _before_ it is inserted into the DOM. If the current item of such a viewer (the one being
     * displayed) is of type `ViewerItemCanvas`, `redraw()` must be called immediately after the
     * viewer itself is inserted; otherwise, the displayed item will be empty. The only exception to
     * this rule is when the item is not yet ready (see {@link ViewerItemCanvas.ready()}), but it
     * and the viewer are already attached to the DOM. In this case, `redraw()` is eventually called
     * via `ready()`, so a manual call is not necessary.
     * @param force Whether to force the redraw even if the canvas is not connected.
     * @returns This instance.
     */
    public redraw(force: boolean = false): this {
        if (this.#canvas.DOM.isConnected || force) {
            this.#drawFnc(this.#canvas.DOM, this.#realScale, this.#canvasScale, this.#naturalWidth, this.#naturalHeight);
            this.#canvasCleared = false;
        }
        return this;
    }

    /**
     * Get/set the error message to be shown instead of the canvas element for an item that can't be
     * drawn.
     * @see {@link ViewerItemCanvas.errorMsg}
     */
    public get ErrorMsg(): string {
        return this.#errorMsg;
    }
    /** @inheritdoc */
    public set ErrorMsg(v: string) {
        this.errorMsg(v);
    }

    /**
     * Sets the error message to be shown instead of the canvas element for an item that can't be
     * drawn.
     * @param v The error message to set.
     * @returns This instance.
     */
    public errorMsg(v: string): this {
        this.#errorMsg = v;
        this.#error.phrase(this.#errorMsg);
        return this;
    }

    /**
     * Clears the canvas of this viewer item. This sets the width and height of the canvas to 1 and
     * clears its content.
     * @returns This instance.
     */
    public clearCanvas(): this {
        this.#canvas.DOM.width = 1;
        this.#canvas.DOM.height = 1;
        const context = this.#canvas.DOM.getContext("2d", { alpha: false }); // eslint-disable-line jsdoc/require-jsdoc
        context && context.clearRect(0, 0, 1, 1);
        this.#canvasCleared = true;
        return this;
    }

    /**
     * Scale the canvas element to fit its container.
     * @param scale One of the `fit` options (Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT).
     */
    #scaleToFit(scale: number): void {
        const viewerRect = this.#viewer?.ClientRect ?? { Width: 1, Height: 1 }; // eslint-disable-line jsdoc/require-jsdoc
        let width: number;
        let height: number;
        switch (scale) {
            case -2: // Zoom.FITWIDTH
                width = viewerRect.Width;
                height = viewerRect.Width * (this.#naturalHeight / this.#naturalWidth);
                break;
            case -3: // Zoom.FITHEIGHT
                width = viewerRect.Height * (this.#naturalWidth / this.#naturalHeight);
                height = viewerRect.Height;
                break;
            case -1: // Zoom.FIT (default)
            default: {
                if (viewerRect.Width / this.#naturalWidth < viewerRect.Height / this.#naturalHeight) {
                    width = viewerRect.Width;
                    height = viewerRect.Width * (this.#naturalHeight / this.#naturalWidth);
                } else {
                    width = viewerRect.Height * (this.#naturalWidth / this.#naturalHeight);
                    height = viewerRect.Height;
                }
                break;
            }
        }
        this.#mountedCanvasWidth = width * this.#canvasScale;
        this.#mountedCanvasHeight = height * this.#canvasScale;
        this.#realScale = width / this.#naturalWidth;
        // `overflowY: hidden` resolves an issue where (vertical) scrollbars continue to appear even
        // though they should not. The cause of this issue is currently unknown.
        this.style({ overflowY: "hidden", width: `${width}px`, height: `${height}px` }); // eslint-disable-line jsdoc/require-jsdoc
        this.#canvas.style({ width: `${width}px`, height: `${height}px` }); // eslint-disable-line jsdoc/require-jsdoc
    }

    /**
     * Zoom in/out.
     * @param ev The triggering event.
     */
    #onClick(ev: PointerEvent | MouseEvent | KeyboardEvent) {
        ev.shiftKey ? this.#viewer?.zoomOut(ev) : this.#viewer?.zoomIn(ev);
    }

    /**
     * Clear the canvas when this component is unmounted to save memory.
     */
    override onDidUnmount(): void {
        this.clearCanvas();
        super.onDidUnmount();
    }

    /** @inheritdoc */
    override onBeforeMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onBeforeMount(parent);
        if (this.#canvasCleared) {
            this.#canvas.DOM.width = this.#mountedCanvasWidth;
            this.#canvas.DOM.height = this.#mountedCanvasHeight;
            this.redraw(true);
        } else {
            this.#initialMount = true;
        }
    }

    /** @inheritdoc */
    protected override clearOwner(): void {
        this.ui.remove(this.#canvas, this.#error);
        this.clearCanvas();
        this.#error.dispose();
        this.#canvas.dispose();
        super.clearOwner();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Div()
            .addClass(this.DefaultCSSClassName);
        this.#canvas = new Canvas()
            .width(1)
            .height(1);
        this.#error = new P()
            .addClass("viewer-item-canvas-error");
        return this;
    }
}

/**
 * Factory for `ViewerItemCanvas` components.
 */
export class ViewerItemCanvasFactory<T> extends ComponentFactory<ViewerItemCanvas> {
    /**
     * Create, set up and return ViewerItemCanvas component.
     * @param itemID An ID that identifies the item.
     * @param drawFnc The function that is called to draw the content of the canvas (see
     * {@link ViewerItemCanvasDrawFunction}).
     * @param canvasScale The scale factor that is applied to the canvas element. This is a
     * multiplier for the width and height of the canvas element at a scale factor of 1 (i.e.,
     * without zooming). The default value is `1`; higher values may improve the rendering quality,
     * especially for PDF pages or drawings containing text for which the recommended value is `2`.
     * Values lower than `1` may be used to improve performance and reduce memory usage, but the
     * content may appear blurry. Values lower than or equal to `0` will be auto-corrected to `1`.
     * @param debounceDelay Optional debounce delay in milliseconds for the drawing function. This
     * value is automatically clamped to the range `0` to `500`. If set to `0`, no debouncing is
     * applied. If the value is greater than `0`, the drawing function will be debounced by the
     * given delay. This avoids flickering and excessive CPU usage when the viewer is resized or
     * zoomed in quick succession. Default: `100`.\
     * __Note:__ no debouncing is applied if the viewer steps from one item to another item or if
     * the item is displayed for the first time!
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns ViewerItemCanvas component.
     */
    public viewerItemCanvas(itemID: string, drawFnc: ViewerItemCanvasDrawFunction, canvasScale: number = 1, debounceDelay = 100, data?: T): ViewerItemCanvas {
        return this.setupComponent(new ViewerItemCanvas(itemID, drawFnc, canvasScale, debounceDelay), data);
    }
}

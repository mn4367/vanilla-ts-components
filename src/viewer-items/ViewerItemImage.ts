import { ComponentFactory, ElementComponentVoid } from "@vanilla-ts/core";
import { IViewerItemComponent, Viewer, ViewerItemReadyEvent } from "../Viewer.js";


/**
 * A viewer item component that displays an image (based on an `<img>` element). The image can be
 * scaled and the loading of the image is delayed until the image is about to be displayed in the
 * viewer (lazy loading). If an error occurs while loading the image, a configurable error text is
 * shown in the `alt` attribute and as the tooltip of the image.
 */
export class ViewerItemImage extends ElementComponentVoid<HTMLImageElement> implements IViewerItemComponent {
    #itemID: string;
    #ready: boolean = false;
    #hasError: boolean = false;
    #naturalWidth: number = 0;
    #naturalHeight: number = 0;
    #scale = 1;
    #viewer?: Viewer;
    #loadingErr = "%s";
    #fncOnLoad = this.#onLoad.bind(this);
    #fncOnClick = this.#onClick.bind(this);

    /**
     * Create a viewer item component that displays an image.
     * @param itemID An ID that identifies the item. If `itemID` is an empty string, it will be set
     * to the value of the `url` parameter.
     * @param url The URL of the image to be displayed.
     * @param alt The value for the `alt` attribute of the image. If this parameter is not provided
     * or an empty string, the `alt` attribute is set to the value of the `url` parameter.
     * @param loadingError See {@link ViewerItemImage.loadingError}.
     */
    constructor(itemID: string, url: string, alt: string = "", loadingError: string = "%s") {
        super("img");
        this.DOM.decoding = "async";
        this.DOM.loading = "lazy";
        this.DOM.alt = alt ? alt : url;
        this.#loadingErr = loadingError;
        this
            .addClass(this.DefaultCSSClassName)
            .on("load", this.#fncOnLoad)
            .on("error", this.#fncOnLoad);
        this.DOM.src = url;
        this.#itemID = itemID ? itemID : url;
    }

    /** @inheritdoc */
    public get ItemID(): string { return this.#itemID; }

    /** The URL of the image. */
    public get URL(): string { return this.DOM.src; }

    /** @inheritdoc */
    public get Ready(): boolean { return this.#ready; }

    /** @inheritdoc */
    public get HasError(): boolean { return this.#hasError; }

    /** @inheritdoc */
    public get NaturalWidth(): number { return this.#naturalWidth; }

    /** @inheritdoc */
    public get NaturalHeight(): number { return this.#naturalHeight; }

    /** @inheritdoc */
    public scale(scale: number): this {
        if (scale !== this.#scale) {
            if ((scale === 0) || (this.#naturalWidth === 0) || (this.#naturalHeight === 0)) {
                this.#scale = 0;
                this.attribN("width", null).attribN("height", null);
                this.style({ "width": null, "height": null, "objectFit": null }); // eslint-disable-line jsdoc/require-jsdoc
                return this;
            }
            if (scale > 0) {
                this.DOM.width = this.#naturalWidth * scale;
                this.DOM.height = this.#naturalHeight * scale;
                this.style({ "width": null, "height": null, "objectFit": null }); // eslint-disable-line jsdoc/require-jsdoc
            } else {
                this.attribN("width", null).attribN("height", null);
                this.style(
                    /* eslint-disable jsdoc/require-jsdoc */
                    [-3, -2, -1].includes(scale)
                        ? {
                            "width": scale === -2 /*Zoom.FITWIDTH*/ || scale === -1 /*Zoom.FIT*/ ? "100%" : null,
                            "height": scale === -3 /*Zoom.FITHEIGHT*/ || scale === -1 /*Zoom.FIT*/ ? "100%" : null,
                            "objectFit": "contain"
                        }
                        : { "width": null, "height": null, "objectFit": null }
                    /* eslint-enable */
                );
            }
            this.#scale = scale;
        }
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

    /**
     * Get set the error text to be shown.
     * @see {@link ViewerItemImage.loadingError}
     */
    public get LoadingError(): string {
        return this.#loadingErr;
    }
    /** @inheritdoc */
    public set LoadingError(v: string) {
        this.loadingError(v);
    }

    /**
     * Sets the error text to be shown in the `alt` attribute and as tooltip for items that couldn't
     * be loaded. Any occurence of the string `%s` in the error text is replaced with the URL of the
     * item, e.g the value `Item '%s' couldn't be loaded!` would resolve to something like
     * `Item 'https://foo.org/img07.png' couldn't be loaded!` for an item with the URL `img07.png`.
     * @param v The error text to set.
     * @returns This instance.
     */
    public loadingError(v: string): this {
        this.#loadingErr = v;
        if (this.#hasError) {
            const s = this.#loadingErr.replaceAll("%s", this.DOM.src);
            this.title(s).DOM.alt = s;
        }
        return this;
    }

    /**
     * Called by the image (DOM) component if the image is completely loaded
     * - and either loaded successfully (ev.type is `load`)
     * - or an error occurred while loading the image (ev.type is `error`).
     * @param ev The error event.
     */
    #onLoad(ev: Event) {
        ev.stopImmediatePropagation();
        if (this._dom.complete && (this._dom.naturalWidth !== 0) && (this._dom.naturalHeight !== 0)) {
            this.#naturalWidth = this._dom.naturalWidth;
            this.#naturalHeight = this._dom.naturalHeight;
        }
        this.#ready = true;
        this.#hasError = ev.type === "error";
        if (ev.type === "error") {
            const s = this.#loadingErr.replaceAll("%s", this.DOM.src);
            this.title(s).DOM.alt = s;
        }
        this.emit(new ViewerItemReadyEvent(this, !this.#hasError));
    }

    /**
     * Zoom in/out.
     * @param ev The triggering event.
     */
    #onClick(ev: PointerEvent | MouseEvent | KeyboardEvent) {
        ev.shiftKey ? this.#viewer?.zoomOut(ev) : this.#viewer?.zoomIn(ev);
    }
}

/**
 * Factory for `ViewerItemImage` components.
 */
export class ViewerItemImageFactory<T> extends ComponentFactory<ViewerItemImage> {
    /**
     * Create, set up and return ViewerItemImage component.
     * @param itemID An ID that identifies the item. If `itemID` is an empty string, it will be set
     * to the value of the `url` parameter.
     * @param url The URL of the image to be displayed.
     * @param alt The value for the `alt` attribute of the image. If this parameter is not provided
     * or an empty string, the `alt` attribute is set to the value of the `url` parameter.
     * @param loadingError See {@link ViewerItemImage.loadingError}.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns ViewerItemImage component.
     */
    public viewerItemImage(itemID: string, url: string, alt: string = "", loadingError: string = "%s", data?: T): ViewerItemImage {
        return this.setupComponent(new ViewerItemImage(itemID, url, alt, loadingError), data);
    }
}

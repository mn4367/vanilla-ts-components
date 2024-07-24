import { AElementComponentWithInternalUI, ComponentFactory, IChildren, IElementWithChildrenComponent, IFragment, IIsElementComponent, INodeComponent } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";


/**
 * Settings for adjusting the size and position of a scroll bar. This can be used to adjust the left
 * or top spacing and/or the width or height of a scroll bar. Such an adjustment can be helpful for
 * ScrollContainers that contain an element that has been positioned with `sticky` and should
 * therefore not be included in the scrollable area. If, for example, a component with a toolbar and
 * an underlying content area should have both elements (i.e. toolbar _and_ content area) in the
 * ScrollContainer, then the vertical scroll bar should not actually cover the toolbar.
 * 
 * Such an adjustment can be made with an object of the type `ScrollbarAdjustment`. 'Offset' stands
 * for the distance of the scroll bar (left or top) and 'ReduceSize' for a reduction in the width or
 * height of the scroll bar. Both values can be specified numerically or as a component. A numerical
 * value corresponds to a specification in pixels. With a component the value is calculated
 * dynamically from the dimensions of the element (`Offset` will be the value of `offsetLeft` or
 * `offsetTop` and `ReduceSize` will be the value of `offsetWidth` or `offsetHeight`). Components
 * are monitored for changes in size, so there is no need to reset the adjustments during operation.
 */
export type ScrollbarAdjustment = { Offset: number | INodeComponent<HTMLElement>; ReduceSize: number | INodeComponent<HTMLElement>; }; // eslint-disable-line jsdoc/require-jsdoc

/**
 * Container with scroll bars. This component enables a uniform design of scroll bars across all
 * platforms/UAs. The design and behavior of the scroll bars is based on the scroll bars of macOS.
 * 
 * Usage notes:
 * 
 * - Although it may seem that `ScrollContainer` is a simple replacement for `Div` components (it
 *   implements `IChildren` like `Div`), this is not the case (see following points).
 * - Due to the internal component tree, some CSS adjustments may be necessary compared to a normal
 *   `Div` component. This is especially true for `padding`, which should always be `0`, otherwise
 *   some internal calculations will lead to results that end up in a broken layout. Instead use
 *   padding on the inner container (property `Content`). The same is true for other CSS properties
 *   e.g. `flex`, `display` etc. In some cases `width` and `height` for the inner container must
 *   also be adjusted.
 * - Do not use `Content` to add/remove/... components, instead use the functions of
 *   `ScrollContainer` itself. Components added/removed/... via `Content` are not monitored for size
 *   changes and thus the scroll bars may get out of sync.
 * - `clear()` is a destryoing operation(!), for an alternative see `clearContent()`.
 * - Children of `ScrollContainer` _may_ traverse the component hierarchy with `someChild.Parent`,
 *   but a single call to `Parent` is not enough. Due to the internal component tree and the use of
 *   `AElementComponentWithInternalUI`, `someChild.Parent?.Parent?.Parent` must be called to reach
 *   the containing `ScrollContainer` instance!
 */
export class ScrollContainer<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Div, EventMap> implements IChildren {
    private _dom_: HTMLDivElement;
    private contentContainer: Div;
    private _horizontal: boolean;
    private _vertical: boolean;
    private _native: boolean = false;
    private hAdjustment: ScrollbarAdjustment;
    private vAdjustment: ScrollbarAdjustment;
    private hBarLeftOffset: number;
    private hBarReduceWidth: number;
    private vBarTopOffset: number;
    private vBarReduceHeight: number;
    // UI parts.
    private hBarOverlay: HTMLDivElement;
    private hBar: HTMLDivElement;
    private hBarThumb: HTMLDivElement;
    private vBarOverlay: HTMLDivElement;
    private vBar: HTMLDivElement;
    private vBarThumb: HTMLDivElement;
    private passiveTrue: AddEventListenerOptions = { passive: true }; // eslint-disable-line jsdoc/require-jsdoc
    // Listeners for syncing the scroll bars with the scroll position of the inner content container.
    private onScrollListener = this.syncScrollBars.bind(this);
    private onScrollEndListener = this.onScrollEnd.bind(this);
    // Observers for the size of children and the child list of the inner container.
    private resizeObserver: ResizeObserver;
    private mutationObserver: MutationObserver;
    // Resize observer for components given to `horizontalAdjustment()` or `verticalAdjustment()`.
    private adjustmentResizeObserver: ResizeObserver;
    // Moving of a scroll bar thumb.
    private dragging = false;
    private dragStart = new DOMPoint(-Infinity, -Infinity);
    private dragStartElementPos = new DOMPoint(-Infinity, -Infinity);
    private draggingThumb?: HTMLDivElement;
    private draggingThumbRect = new DOMRect(0, 0, 0, 0);
    private draggingBarRect = new DOMRect(0, 0, 0, 0);
    private fncOnDragThumbPointerDown = this.onDragThumbPointerDown.bind(this);
    private fncOnDragThumbPointerMove = this.onDragThumbPointerMove.bind(this);
    private fncOnDragThumbPointerUp = this.onDragThumbPointerUp.bind(this);
    // Scrolling by holding down a pointer or by clicking on a scroll bar.
    private contScrollStartPos = new DOMPoint(0, 0);
    private contScrollHorizontal: boolean = false;
    private contScrollBackwards: boolean = false;
    private scrollPageLength = 0;
    private isPointerDown = false;
    private lastScrollPos = new DOMPoint(0, 0);
    private onScrollEndTimeout: ReturnType<typeof setInterval>;
    private fncOnScrollBarPointerDown = this.onScrollBarPointerDown.bind(this);
    private fncOnScrollBarPointerUp = this.onScrollBarPointerUp.bind(this);

    /**
     * Create ScrollContainer component.
     * @param horizontal `true`, if a horizontal scroll bar is to be displayed, otherwise `false`.
     * @param vertical `true`, if a vertical scroll bar is to be displayed, otherwise `false`.
     * @param native `true`, if native scroll bars are to be used, otherwise `false`. If `true` is
     * used permanently consider staying away from `ScrollContainer` since the actual purpose of
     * this component is to enable a uniform design of scroll bars across all platforms/UAs.
     * @param horizontalAdjustment Adjustment of the size and position of the horizontal scroll bar.
     * @param verticalAdjustment Adjustment of the size and position of the vertical scroll bar.
     */
    constructor(horizontal: boolean = true, vertical: boolean = true, native: boolean = false, horizontalAdjustment?: ScrollbarAdjustment, verticalAdjustment?: ScrollbarAdjustment) {
        super();
        this._horizontal = horizontal;
        this._vertical = vertical;
        this.initialize(true)
            .horizontalAdjustment(horizontalAdjustment)
            .verticalAdjustment(verticalAdjustment)
            .native(native);
    }

    /**
     * Get/set the availability of the horizontal scroll bar.
     */
    public get Horizontal(): boolean {
        return this._horizontal;
    }
    /** @inheritdoc */
    public set Horizontal(v: boolean) {
        this.horizontal(v);
    }

    /**
     * Set the availability of the horizontal scroll bar.
     * @param horizontal `true`, if a horizontal scroll bar is available, otherwise `false`.
     * @returns This instance.
     */
    public horizontal(horizontal: boolean): this {
        if (horizontal !== this._horizontal) {
            this._horizontal = horizontal;
            this._horizontal ? this.addClass("horizontal") : this.removeClass("horizontal");
            this._horizontal ? this._dom_.appendChild(this.hBarOverlay) : this.hBarOverlay.remove();
        }
        return this;
    }

    /**
     * Get/set the availability of the vertical scroll bar.
     */
    public get Vertical(): boolean {
        return this._vertical;
    }
    /** @inheritdoc */
    public set Vertical(v: boolean) {
        this.vertical(v);
    }

    /**
     * Set the availability of the vertical scroll bar.
     * @param vertical `true`, if a vertical scroll bar is available, otherwise `false`.
     * @returns This instance.
     */
    public vertical(vertical: boolean): this {
        if (vertical !== this._vertical) {
            this._vertical = vertical;
            this._vertical ? this.addClass("vertical") : this.removeClass("vertical");
            this._vertical ? this._dom_.appendChild(this.vBarOverlay) : this.vBarOverlay.remove();
        }
        return this;
    }

    /**
     * Get/set the availability of native scroll bars.
     */
    public get Native(): boolean {
        return this._native;
    }
    /** @inheritdoc */
    public set Native(v: boolean) {
        this.native(v);
    }

    /**
     * Turn the availability of native scroll bars on or off.
     * @param native `true`, if native scroll bars are to be used, otherwise `false`.
     * @returns This instance.
     */
    public native(native: boolean): this {
        if (native !== this._native) {
            this._native = native;
            // Workaround for WebKit/Safari bug.
            const oldX: string = this.Style.overflowX;
            const oldY: string = this.Style.overflowY;
            //
            if (this._native) {
                this.draggingThumb?.removeEventListener("pointermove", this.fncOnDragThumbPointerMove, this.passiveTrue);
                this._dom_.removeEventListener("scroll", this.onScrollListener, this.passiveTrue);
                this._dom_.removeEventListener("scroll", this.onScrollEndListener, this.passiveTrue);
                this.hBarOverlay.remove();
                this.vBarOverlay.remove();
                this.addClass("native");
            } else {
                this._dom_.addEventListener("scroll", this.onScrollListener, this.passiveTrue);
                this._dom_.addEventListener("scroll", this.onScrollEndListener, this.passiveTrue);
                this._dom_.insertBefore(this.vBarOverlay, this.contentContainer.DOM);
                this._dom_.insertBefore(this.hBarOverlay, this.vBarOverlay);
                this.removeClass("native");
                this.syncScrollBars();
            }
            // Workaround for WebKit/Safari bug.
            this.style("overflow-x", "hidden");
            this.style("overflow-y", "hidden");
            setTimeout(() => {
                this.style("overflow-x", oldX);
                this.style("overflow-y", oldY);
            }, 17);
            //
        }
        return this;
    }

    /**
     * Get/set the size and position adjustment for the horizontal scroll bar. `get` returns a copy!
     */
    public get HorizontalAdjustment(): ScrollbarAdjustment {
        return { ...this.hAdjustment };
    }
    /** @inheritdoc */
    public set HorizontalAdjustment(v: ScrollbarAdjustment | undefined) {
        this.horizontalAdjustment(v);
    }

    /**
     * Set the size and position adjustment for the horizontal scroll bar.
     * @param scrollbarAdjustment Size and position adjustment for the horizontal scroll bar.
     * @returns This instance.
     */
    public horizontalAdjustment(scrollbarAdjustment?: ScrollbarAdjustment): this {
        if (this.hAdjustment && typeof this.hAdjustment.Offset !== "number") {
            this.adjustmentResizeObserver.unobserve(this.hAdjustment?.Offset.DOM);
        }
        if (this.hAdjustment && typeof this.hAdjustment?.ReduceSize !== "number") {
            this.adjustmentResizeObserver.unobserve(this.hAdjustment?.ReduceSize.DOM);
        }
        this.hAdjustment = scrollbarAdjustment ? { ...scrollbarAdjustment } : { Offset: 0, ReduceSize: 0 }; // eslint-disable-line jsdoc/require-jsdoc
        if (typeof this.hAdjustment.Offset !== "number") {
            this.adjustmentResizeObserver.observe(this.hAdjustment.Offset.DOM);
            this.hBarLeftOffset = this.hAdjustment.Offset.DOM.offsetTop;
        } else {
            this.hBarLeftOffset = this.hAdjustment.Offset;
        }
        if (typeof this.hAdjustment.ReduceSize !== "number") {
            this.adjustmentResizeObserver.observe(this.hAdjustment.ReduceSize.DOM);
            this.hBarReduceWidth = this.hAdjustment.ReduceSize.DOM.offsetHeight;
        } else {
            this.hBarReduceWidth = this.hAdjustment.ReduceSize;
        }
        this.syncScrollBars();
        return this;
    }

    /**
     * Get/set the size and position adjustment for the vertical scroll bar. `get` returns a copy!
     */
    public get VerticalAdjustment(): ScrollbarAdjustment {
        return { ...this.vAdjustment };
    }
    /** @inheritdoc */
    public set VerticalAdjustment(v: ScrollbarAdjustment | undefined) {
        this.verticalAdjustment(v);
    }

    /**
     * Set the size and position adjustment for the vertical scroll bar.
     * @param scrollbarAdjustment Size and position adjustment for the vertical scroll bar.
     * @returns This instance.
     */
    public verticalAdjustment(scrollbarAdjustment?: ScrollbarAdjustment): this {
        if (this.vAdjustment && typeof this.vAdjustment.Offset !== "number") {
            this.adjustmentResizeObserver.unobserve(this.vAdjustment?.Offset.DOM);
        }
        if (this.vAdjustment && typeof this.vAdjustment?.ReduceSize !== "number") {
            this.adjustmentResizeObserver.unobserve(this.vAdjustment?.ReduceSize.DOM);
        }
        this.vAdjustment = scrollbarAdjustment ? { ...scrollbarAdjustment } : { Offset: 0, ReduceSize: 0 }; // eslint-disable-line jsdoc/require-jsdoc
        if (typeof this.vAdjustment.Offset !== "number") {
            this.adjustmentResizeObserver.observe(this.vAdjustment.Offset.DOM);
            this.vBarTopOffset = this.vAdjustment.Offset.DOM.offsetTop;
        } else {
            this.vBarTopOffset = this.vAdjustment.Offset;
        }
        if (typeof this.vAdjustment.ReduceSize !== "number") {
            this.adjustmentResizeObserver.observe(this.vAdjustment.ReduceSize.DOM);
            this.vBarReduceHeight = this.vAdjustment.ReduceSize.DOM.offsetHeight;
        } else {
            this.vBarReduceHeight = this.vAdjustment.ReduceSize;
        }
        this.syncScrollBars();
        return this;
    }

    /**
     * Get the current scroll offset of the scroll container.
     */
    public get ScrollOffset(): { X: number; Y: number; } { // eslint-disable-line jsdoc/require-jsdoc
        return { X: this._dom_.scrollLeft, Y: this._dom.scrollTop }; // eslint-disable-line jsdoc/require-jsdoc
    }

    /**
     * Also available via `someInstance.DOM.scroll()`, re-exported here for convenience. Equivalent
     * to `scrollTo()`.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll
     */
    public scroll(x: number, y: number): this;
    /** @inheritdoc */
    public scroll(options: ScrollToOptions): this;
    /** @inheritdoc */
    public scroll(arg1: number | ScrollToOptions, arg2?: number): this {
        if ((typeof arg1 === "number") && (typeof arg2 === "number")) {
            this._dom_.scroll(arg1, arg2);
        } else {
            this._dom_.scroll(<ScrollToOptions>arg1);
        }
        return this;
    }

    /**
     * Also available via `someInstance.DOM.scrollBy()`, re-exported here for convenience.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
     */
    public scrollBy(x: number, y: number): this;
    /** @inheritdoc */
    public scrollBy(options: ScrollToOptions): this;
    /** @inheritdoc */
    public scrollBy(arg1: number | ScrollToOptions, arg2?: number): this {
        if ((typeof arg1 === "number") && (typeof arg2 === "number")) {
            this._dom_.scrollBy(arg1, arg2);
        } else {
            this._dom_.scrollBy(<ScrollToOptions>arg1);
        }
        return this;
    }

    /**
     * Get the inner content container (the one which holds the components of the scrollable area).
     */
    public get Content(): IElementWithChildrenComponent<HTMLElement> {
        return this.contentContainer;
    }

    /** @inheritdoc */
    public get Children(): INodeComponent<Node>[] {
        return this.contentContainer.Children;
    }

    /** @inheritdoc */
    public get ElementChildren(): IIsElementComponent[] {
        return this.contentContainer.ElementChildren;
    }

    /** @inheritdoc */
    public get First(): INodeComponent<Node> | undefined {
        return this.contentContainer.First;
    }

    /** @inheritdoc */
    public get Last(): INodeComponent<Node> | undefined {
        return this.contentContainer.Last;
    }

    /** @inheritdoc */
    public append(...components: INodeComponent<Node>[]): this {
        this.contentContainer.append(...components);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public appendFragment(fragment: IFragment): this {
        this.contentContainer.appendFragment(fragment);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public insert(at: number | INodeComponent<Node>, ...components: INodeComponent<Node>[]): this {
        this.contentContainer.insert(at, ...components);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public insertFragment(at: number | INodeComponent<Node>, fragment: IFragment): this {
        this.insertFragment(at, fragment);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public remove(...components: INodeComponent<Node>[]): this {
        this.contentContainer.remove(...components);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public extract(to: INodeComponent<Node>[], ...components: INodeComponent<Node>[]): this {
        this.contentContainer.extract(to, ...components);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public moveTo(target: IChildren, ...components: INodeComponent<Node>[]): this {
        this.contentContainer.moveTo(target, ...components);
        this.syncScrollBars();
        return this;
    }

    /** @inheritdoc */
    public moveToAt(target: IChildren, at: number | INodeComponent<Node>, ...components: INodeComponent<Node>[]): this {
        this.contentContainer.moveToAt(target, at, ...components);
        this.syncScrollBars();
        return this;
    }

    /**
     * Removes _and disposes_ all regular children from the scroll container.
     * @returns This instance.
     */
    public clearContent(): this {
        const extracted: INodeComponent<Node>[] = [];
        this.extract(extracted);
        for (const component of extracted) {
            component.dispose();
        }
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI(): this {
        this.ui = new Div();
        /**
         * The user interface consists mostly of raw DOM elements instead of components, since
         * - there is no need to access the inner elements from the outside
         * - and to enable the most performant access to DOM properties of the inner elements.
         */
        this._dom_ = this.ui.DOM;
        // Horizontal scroll bar.
        this.hBarOverlay = document.createElement("div");
        this.hBarOverlay.classList.add("h-bar-overlay");
        this.hBar = document.createElement("div");
        this.hBar.classList.add("h-bar");
        this.hBar.addEventListener("pointerdown", this.fncOnScrollBarPointerDown);
        this.hBar.addEventListener("pointerup", this.fncOnScrollBarPointerUp);
        this.hBarOverlay.appendChild(this.hBar);
        this.hBarThumb = document.createElement("div");
        this.hBarThumb.classList.add("h-bar-thumb");
        this.hBarThumb.addEventListener("pointerdown", this.fncOnDragThumbPointerDown);
        this.hBarThumb.addEventListener("pointerup", this.fncOnDragThumbPointerUp);
        this.hBar.appendChild(this.hBarThumb);
        // Vertical scroll bar.
        this.vBarOverlay = document.createElement("div");
        this.vBarOverlay.classList.add("v-bar-overlay");
        this.vBar = document.createElement("div");
        this.vBar.classList.add("v-bar");
        this.vBar.addEventListener("pointerdown", this.fncOnScrollBarPointerDown);
        this.vBar.addEventListener("pointerup", this.fncOnScrollBarPointerUp);
        this.vBarOverlay.appendChild(this.vBar);
        this.vBarThumb = document.createElement("div");
        this.vBarThumb.classList.add("v-bar-thumb");
        this.vBarThumb.addEventListener("pointerdown", this.fncOnDragThumbPointerDown);
        this.vBarThumb.addEventListener("pointerup", this.fncOnDragThumbPointerUp);
        this.vBar.appendChild(this.vBarThumb);
        // Container for content elements.
        this.contentContainer = new Div()
            .addClass("content");
        // Sync scroll bars on scrolling and detect the end of a scroll process.
        this._dom_.addEventListener("scroll", this.onScrollListener, this.passiveTrue);
        this._dom_.addEventListener("scroll", this.onScrollEndListener, this.passiveTrue);
        // Sync scrollbars on resizing.
        this.resizeObserver = new ResizeObserver((entries => {
            if (this._vertical || this._horizontal) {
                for (const entry of entries) {
                    if ((entry.target === this._dom_) || (entry.target.parentElement === this.contentContainer.DOM)) {
                        this.syncScrollBars();
                        break;
                    }
                }
            }
        }));
        this.resizeObserver.observe(this._dom_);
        // Add/remove resize observing on adding/removing nodes.
        this.mutationObserver = new MutationObserver(records => {
            for (const record of records) {
                for (const node of record.removedNodes) {
                    node instanceof Element
                        ? this.resizeObserver.unobserve(node)
                        : undefined;
                }
                for (const node of record.addedNodes) {
                    node instanceof Element
                        ? this.resizeObserver.observe(node)
                        : undefined;
                }
            }
        });
        this.mutationObserver.observe(this.contentContainer.DOM, { childList: true }); // eslint-disable-line jsdoc/require-jsdoc
        // Adjust `Offset` and `ReduceSize` if components are given for adjustments.
        this.adjustmentResizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const ref = <HTMLElement>entry.target;
                let syncScrollBars = false;
                if (ref === (<INodeComponent<HTMLElement>>this.hAdjustment.Offset).DOM) {
                    this.hBarLeftOffset = ref.offsetLeft;
                    syncScrollBars = true;
                }
                if (ref === (<INodeComponent<HTMLElement>>this.hAdjustment.ReduceSize).DOM) {
                    this.hBarReduceWidth = ref.offsetWidth;
                    syncScrollBars = true;
                }
                if (ref === (<INodeComponent<HTMLElement>>this.vAdjustment.Offset).DOM) {
                    this.vBarTopOffset = ref.offsetTop;
                    syncScrollBars = true;
                }
                if (ref === (<INodeComponent<HTMLElement>>this.vAdjustment.ReduceSize).DOM) {
                    this.vBarReduceHeight = ref.offsetHeight;
                    syncScrollBars = true;
                }
                syncScrollBars
                    ? this.syncScrollBars()
                    : undefined;
            }
        });
        // Mount inner components.
        if (this._horizontal) {
            this.ui.addClass("horizontal");
            this.ui.DOM.appendChild(this.hBarOverlay);
        }
        if (this._vertical) {
            this.ui.addClass("vertical");
            this.ui.DOM.appendChild(this.vBarOverlay);
        }
        this.ui.append(this.contentContainer);
        return this;
    }

    /**
     * Syncs the position of the handles and the visibility of the scroll bars with the current
     * scroll position.
     * @param event The scroll event (if available).
     */
    private syncScrollBars(event?: Event): void {
        // If `event` is set, then it is a regular scroll event, otherwise `syncScrollBars()` was
        // called by a ResizeObserver.
        if (event) {
            this.addClass("scrolling");
        }
        if (this.dragging) {
            return;
        }
        // Scroll events sometimes fire extremely often in succession, which is why the load for the
        // calculation/positioning is tamed with `requestAnimationFrame()`.
        requestAnimationFrame(() => {
            let hboWidth = "";
            let hasHOff = false;
            let vboHeight = "";
            let hasVOff = false;
            if (this._horizontal) {
                const w = this._dom_.clientWidth;
                const sw = this._dom_.scrollWidth || -0.000001;
                this.hBarOverlay.style.display = w < sw ? "" : "none";
                hboWidth = w - this.hBarLeftOffset - this.hBarReduceWidth + "px";
                this.hBarOverlay.style.left = this.hBarLeftOffset + this.hBarReduceWidth + "px";
                hasHOff = w >= sw;
                hasHOff ? this.addClass("h-off") : this.removeClass("h-off");
                this.hBarThumb.style.width = w < sw ? (w / sw * 100) + "%" : "100%";
                this.hBarThumb.style.left = (this._dom_.scrollLeft / sw * 100) + "%";
            } else {
                this.hBarOverlay.style.display = "none";
            }
            if (this._vertical) {
                const h = this._dom_.clientHeight;
                const sh = this._dom_.scrollHeight || -0.000001;
                this.vBarOverlay.style.display = h < sh ? "" : "none";
                vboHeight = h - this.vBarTopOffset - this.vBarReduceHeight + "px";
                this.vBarOverlay.style.top = this.vBarTopOffset + this.vBarReduceHeight + "px";
                hasVOff = h >= sh;
                hasVOff ? this.addClass("v-off") : this.removeClass("v-off");
                this.vBarThumb.style.height = h < sh ? (h / sh * 100) + "%" : "100%";
                this.vBarThumb.style.top = (this._dom_.scrollTop / sh * 100) + "%";
            } else {
                this.vBarOverlay.style.display = "none";
            }
            if (this._horizontal) {
                this.hBarOverlay.style.width = !hasVOff
                    ? `calc(${(this._dom_.clientWidth - this.hBarLeftOffset - this.hBarReduceWidth - this.vBar.offsetWidth)}px - var(--scroll-bar-thumb-gap))`
                    : hboWidth;
            }
            if (this._vertical && !this._dom_.classList.contains("h-off")) {
                this.vBarOverlay.style.height = !hasHOff
                    ? `calc(${(this._dom_.clientHeight - this.vBarTopOffset - this.vBarReduceHeight - this.hBar.offsetHeight)}px - var(--scroll-bar-thumb-gap))`
                    : vboHeight;
            }
        });
    }

    /**
     * Handling for dragging the handles on the scroll bar. Triggered when the pointer is held down.
     * @param event The pointer event.
     */
    private onDragThumbPointerDown(event: PointerEvent): void {
        const target = event.target;
        if ((target === this.vBarThumb) || (target === this.hBarThumb)) {
            event.preventDefault();
            this.dragging = true;
            this.contScrollHorizontal = this.draggingThumb === this.hBarThumb;
            this.dragStart.x = event.clientX;
            this.dragStart.y = event.clientY;
            this.dragStartElementPos.x = this._dom_.scrollLeft;
            this.dragStartElementPos.y = this._dom_.scrollTop;
            this.draggingThumb = <HTMLDivElement>target;
            this.draggingThumbRect.x = this.draggingThumb.offsetLeft;
            this.draggingThumbRect.y = this.draggingThumb.offsetTop;
            this.draggingThumbRect.width = this.draggingThumb.offsetWidth;
            this.draggingThumbRect.height = this.draggingThumb.offsetHeight;
            this.draggingBarRect.width = this.draggingThumb.parentElement!.offsetWidth;
            this.draggingBarRect.height = this.draggingThumb.parentElement!.offsetHeight;
            this.draggingThumb.addEventListener("pointermove", this.fncOnDragThumbPointerMove, this.passiveTrue);
            this.draggingThumb.setPointerCapture(event.pointerId);
            this.addClass("dragging");
        }
    }

    /**
     * @see `onDragThumbPointerDown()`.
     * @param event The pointer event.
     */
    private onDragThumbPointerMove(event: PointerEvent): void {
        if (this.draggingThumb === this.hBarThumb) {
            const dx = event.clientX - this.dragStart.x;
            let left = Math.max(0, this.draggingThumbRect.left + dx);
            left = Math.min(left, this.draggingBarRect.width - this.draggingThumbRect.width);
            // Map moveable area of the scroll bar to the scroll bar area.
            const f =
                // Width of the invisible area.
                (this._dom_.scrollWidth - this._dom_.offsetWidth) /
                // Width of the area which is available for moving with the mouse.
                (this.draggingBarRect.width - this.draggingThumbRect.width);
            this.draggingThumb.style.left = left + "px";
            this._dom_.scrollTo({
                left: this.dragStartElementPos.x + (dx * f) // eslint-disable-line jsdoc/require-jsdoc
            });
        } else if (this.draggingThumb === this.vBarThumb) {
            const dy = event.clientY - this.dragStart.y;
            let top = Math.max(0, this.draggingThumbRect.top + dy);
            top = Math.min(top, this.draggingBarRect.height - this.draggingThumbRect.height);
            // Map moveable area of the scroll bar to the scroll bar area.
            const f =
                // Height of the invisible area.
                (this._dom_.scrollHeight - this._dom_.offsetHeight) /
                // Height of the area which is available for moving with the mouse.
                (this.draggingBarRect.height - this.draggingThumbRect.height);
            this.draggingThumb.style.top = top + "px";
            this._dom_.scrollTo({
                top: this.dragStartElementPos.y + (dy * f) // eslint-disable-line jsdoc/require-jsdoc
            });
        }
    }

    /**
     * @see `onDragThumbPointerDown()`.
     * @param event The pointer event.
     */
    private onDragThumbPointerUp(event: PointerEvent): void {
        if (this.dragging) {
            setTimeout(() => {
                this.dragging = false;
                this.draggingThumb!.removeEventListener("pointermove", this.fncOnDragThumbPointerMove, this.passiveTrue);
                this.draggingThumb!.releasePointerCapture(event.pointerId);
                this.draggingThumb = undefined;
                this.dragStart.x = -Infinity;
                this.dragStart.y = -Infinity;
                this.dragStartElementPos.x = -Infinity;
                this.dragStartElementPos.y = -Infinity;
                this.removeClass("dragging");
            }, 1);
        }
    }

    /**
     * Handling for clicking on and holding down the scroll bar. Scrolls page by page when clicking
     * on a free area in the scroll bar and scrolls permanently when holding down on a free area in
     * the scroll bar.
     * @param event The pointer event.
     */
    private onScrollBarPointerDown(event: PointerEvent): void {
        this.contScrollStartPos.x = event.offsetX;
        this.contScrollStartPos.y = event.offsetY;
        if (event.target === this.hBar) {
            event.preventDefault();
            this.isPointerDown = true;
            this.contScrollHorizontal = true;
            this.contScrollBackwards = event.offsetX <= this.hBarThumb.offsetLeft;
            this.scrollPageLength = this._dom_.scrollWidth * this.hBarThumb.offsetWidth / this.hBar.offsetWidth;
            const scrollBy = event.offsetX < this.hBarThumb.offsetLeft ? -this.scrollPageLength : this.scrollPageLength;
            /* eslint-disable jsdoc/require-jsdoc */
            this._dom_.scrollBy({
                left: scrollBy,
                behavior: "smooth"
            });
            /* eslint-enable */
        } else if (event.target === this.vBar) {
            event.preventDefault();
            this.isPointerDown = true;
            this.contScrollHorizontal = false;
            this.contScrollBackwards = event.offsetY <= this.vBarThumb.offsetTop;
            this.scrollPageLength = this._dom_.scrollHeight * this.vBarThumb.offsetHeight / this.vBar.offsetHeight;
            const scrollBy = event.offsetY < this.vBarThumb.offsetTop ? -this.scrollPageLength : this.scrollPageLength;
            /* eslint-disable jsdoc/require-jsdoc */
            this._dom_.scrollBy({
                top: scrollBy,
                behavior: "smooth"
            });
            /* eslint-enable */
        }
    }

    /**
     * @see `onScrollBarPointerDown()`.
     * @param _event The pointer event.
     */
    private onScrollBarPointerUp(_event: PointerEvent): void {
        this.isPointerDown = false;
    }

    /**
     * @see `onScrollBarPointerDown()`.
     * @param _event The event.
     * @see https://bugs.webkit.org/show_bug.cgi?id=201556 Once implemented, this probably could be
     * made easier.
     */
    private onScrollEnd(_event: Event): void {
        this.lastScrollPos.x = this._dom_.scrollLeft;
        this.lastScrollPos.y = this._dom_.scrollTop;
        clearTimeout(this.onScrollEndTimeout);
        this.onScrollEndTimeout = setTimeout(() => {
            if ((this.lastScrollPos.x !== this._dom_.scrollLeft) || (this.lastScrollPos.y !== this._dom_.scrollTop)) {
                this.removeClass("scrolling");
                return;
            }
            const rafScroll = () => { // eslint-disable-line jsdoc/require-jsdoc
                if (!this.isPointerDown) {
                    this.removeClass("scrolling");
                    return;
                }
                const thumbRect = this.contScrollHorizontal ?
                    new DOMRect(this.hBarThumb.offsetLeft, this.hBarThumb.offsetTop, this.hBarThumb.offsetLeft + this.hBarThumb.offsetWidth, this.hBarThumb.offsetTop + this.hBarThumb.offsetHeight)
                    : new DOMRect(this.vBarThumb.offsetLeft, this.vBarThumb.offsetTop, this.vBarThumb.offsetLeft + this.vBarThumb.offsetWidth, this.vBarThumb.offsetTop + this.vBarThumb.offsetHeight);
                if (this.rectContains(thumbRect, this.contScrollStartPos)) {
                    this.removeClass("scrolling");
                    return;
                }
                const contScrollDistance = this.contScrollBackwards ? -this.scrollPageLength / 10 : this.scrollPageLength / 10;
                /* eslint-disable jsdoc/require-jsdoc */
                this._dom_.scrollBy({
                    left: this.contScrollHorizontal ? contScrollDistance : 0,
                    top: this.contScrollHorizontal ? 0 : contScrollDistance,
                    behavior: "auto"
                });
                /* eslint-enable */
                requestAnimationFrame(rafScroll);
            };
            rafScroll();
        }, 50);
    }

    /**
     * Checks whether the coordinates of a point lie within a rectangle. 'Within' is also fulfilled
     * if the point lies exactly on one edge or two edges of the rectangle.
     * @param rect The rectangle.
     * @param point The point.
     * @returns `true`, if `point` is inside `rect`, otherwise `false`.
     */
    private rectContains(rect: DOMRect, point: DOMPoint): boolean {
        return (point.x >= rect.left)
            && (point.y >= rect.top)
            && (point.x <= rect.right)
            && (point.y <= rect.bottom);
    }

    /**
     * \
     * \
     * _Note:_ Compared to regular `Div` component `ScrollContainer` becomes unusable after calling
     * `clear()` since all inner opaque components/elements (like the scroll bars) are also removed.
     * To 'empty' the content of `ScrollContainer` use `remove()`/`extract()` or `clearContent()`
     * (recommended) instead.
     * @see `clearContent()`
     * @inheritdoc 
     */
    public override clear(): this {
        this.mutationObserver.disconnect();
        this.resizeObserver.disconnect();
        this._dom_.removeEventListener("scroll", this.onScrollListener, this.passiveTrue);
        this._dom_.removeEventListener("scroll", this.onScrollEndListener, this.passiveTrue);
        this.hBar.removeEventListener("pointerdown", this.fncOnScrollBarPointerDown);
        this.hBar.removeEventListener("pointerup", this.fncOnScrollBarPointerUp);
        this.hBarThumb.removeEventListener("pointerdown", this.fncOnDragThumbPointerDown);
        this.hBarThumb.removeEventListener("pointermove", this.fncOnDragThumbPointerMove);
        this.hBarThumb.removeEventListener("pointerup", this.fncOnDragThumbPointerUp);
        this.hBarOverlay.remove();
        this.hBar.remove();
        this.hBarThumb.remove();
        this.vBar.removeEventListener("pointerdown", this.fncOnScrollBarPointerDown);
        this.vBar.removeEventListener("pointerup", this.fncOnScrollBarPointerUp);
        this.vBarThumb.removeEventListener("pointerdown", this.fncOnDragThumbPointerDown);
        this.vBarThumb.removeEventListener("pointermove", this.fncOnDragThumbPointerMove);
        this.vBarThumb.removeEventListener("pointerup", this.fncOnDragThumbPointerUp);
        this.vBarOverlay.remove();
        this.vBar.remove();
        this.vBarThumb.remove();
        return super.clear();
    }
}

/**
 * Factory for ScrollContainer components.
 */
export class ScrollContainerFactory<T> extends ComponentFactory<ScrollContainer> {
    /**
     * Create, set up and return ScrollContainer component.
     * @param horizontal `true`, if a horizontal scroll bar is to be displayed, otherwise `false`.
     * @param vertical `true`, if a vertical scroll bar is to be displayed, otherwise `false`.
     * @param native `true`, if native scroll bars are to be used, otherwise `false`. If `true` is
     * used permanently consider staying away from `ScrollContainer` since the actual purpose of
     * this component is to enable a uniform design of scroll bars across all platforms/browsers.
     * @param horizontalAdjustment Adjustment of the size and position of the horizontal scroll bar.
     * @param verticalAdjustment Adjustment of the size and position of the vertical scroll bar.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns ScrollContainer component.
     */
    public scrollContainer(horizontal: boolean = true, vertical: boolean = true, native: boolean = false, horizontalAdjustment?: ScrollbarAdjustment, verticalAdjustment?: ScrollbarAdjustment, data?: T): ScrollContainer {
        return this.setupComponent(new ScrollContainer(horizontal, vertical, native, horizontalAdjustment, verticalAdjustment), data);
    }
}

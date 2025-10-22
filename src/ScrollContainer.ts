import { AChildren, AElementComponentWithInternalUI, ComponentFactory, IElementWithChildrenComponent, INodeComponent, mixin } from "@vanilla-ts/core";
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
export class ScrollContainer<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Div, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    #_dom_: HTMLDivElement;
    #contentContainer: Div;
    #scrollable: HTMLDivElement;
    #_horizontal: boolean;
    #_vertical: boolean;
    #_native: boolean = false;
    #isRTL = false;
    #hAdjustment: ScrollbarAdjustment;
    #vAdjustment: ScrollbarAdjustment;
    #hBarStartOffset: number = 0;
    #hBarReduceWidth: number = 0;
    #vBarStartOffset: number = 0;
    #vBarReduceHeight: number = 0;
    // Precalculated scroll ranges (see `#syncScrollBarGeometry()` and `#repositionScrollBars()`)
    #hScrollRange: number;
    #hBarScrollRange: number;
    #vScrollRange: number;
    #vBarScrollRange: number;
    // UI parts.
    #hBarOverlay: HTMLDivElement;
    #hBar: HTMLDivElement;
    #hBarThumb: HTMLDivElement;
    #vBarOverlay: HTMLDivElement;
    #vBar: HTMLDivElement;
    #vBarThumb: HTMLDivElement;
    #passiveTrue: AddEventListenerOptions = { passive: true }; // eslint-disable-line jsdoc/require-jsdoc
    #passiveFalse: AddEventListenerOptions = { passive: false }; // eslint-disable-line jsdoc/require-jsdoc
    // Listeners for syncing the scroll bars with the scroll position of the inner content container.
    #onScrollListener = this.#syncScrollBars.bind(this);
    #onScrollEndListener = this.#onScrollEnd.bind(this);
    // Listener for mouse wheel events on the scroll bars.
    #onWheelListener = this.#onWheel.bind(this);
    // Observers for the size of children and the child list of the inner container.
    #resizeObserver: ResizeObserver;
    #mutationObserver: MutationObserver;
    // Resize observer for components given to `horizontalAdjustment()` or `verticalAdjustment()`.
    #adjustmentResizeObserver: ResizeObserver;
    // Moving of a scroll bar thumb.
    #dragging = false;
    #dragStart = new DOMPoint(-Infinity, -Infinity);
    #dragStartElementPos = new DOMPoint(-Infinity, -Infinity);
    #draggingThumb?: HTMLDivElement;
    #draggingThumbRect = new DOMRect(0, 0, 0, 0);
    #draggingBarRect = new DOMRect(0, 0, 0, 0);
    #fncOnDragThumbPointerDown = this.#onDragThumbPointerDown.bind(this);
    #fncOnDragThumbPointerMove = this.#onDragThumbPointerMove.bind(this);
    #fncOnDragThumbPointerUp = this.#onDragThumbPointerUp.bind(this);
    // Scrolling by holding down a pointer or by clicking on a scroll bar.
    #contScrollStartPos = new DOMPoint(0, 0);
    #contScrollHorizontal: boolean = false;
    #contScrollBackwards: boolean = false;
    #scrollPageLength = 0;
    #isPointerDown = false;
    #lastScrollPos = new DOMPoint(0, 0);
    #onScrollEndTimeout: ReturnType<typeof setInterval>;
    #fncOnScrollBarPointerDown = this.#onScrollBarPointerDown.bind(this);
    #fncOnScrollBarPointerUp = this.#onScrollBarPointerUp.bind(this);

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
        this.#_horizontal = horizontal;
        this.#_vertical = vertical;
        this.initialize(true)
            .horizontalAdjustment(horizontalAdjustment)
            .verticalAdjustment(verticalAdjustment)
            .native(native);
    }

    /**
     * Get/set the availability of the horizontal scroll bar.
     */
    public get Horizontal(): boolean {
        return this.#_horizontal;
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
        if (horizontal !== this.#_horizontal) {
            this.#_horizontal = horizontal;
            this.#_horizontal ? this.#_dom_.classList.add("horizontal") : this.#_dom_.classList.remove("horizontal");
            this.#_horizontal ? this.#_dom_.appendChild(this.#hBarOverlay) : this.#hBarOverlay.remove();
        }
        return this;
    }

    /**
     * Get/set the availability of the vertical scroll bar.
     */
    public get Vertical(): boolean {
        return this.#_vertical;
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
        if (vertical !== this.#_vertical) {
            this.#_vertical = vertical;
            this.#_vertical ? this.#_dom_.classList.add("vertical") : this.#_dom_.classList.remove("vertical");
            this.#_vertical ? this.#_dom_.appendChild(this.#vBarOverlay) : this.#vBarOverlay.remove();
        }
        return this;
    }

    /**
     * Get/set the availability of native scroll bars.
     */
    public get Native(): boolean {
        return this.#_native;
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
        if (native !== this.#_native) {
            this.#_native = native;
            // Workaround for WebKit/Safari bug.
            const oldX: string = this.#scrollable.style.overflowX;
            const oldY: string = this.#scrollable.style.overflowY;
            //
            if (this.#_native) {
                this.#draggingThumb?.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove, this.#passiveTrue);
                this.#_dom_.removeEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
                this.#_dom_.removeEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
                this.#hBarOverlay.remove();
                this.#vBarOverlay.remove();
                this.#_dom_.classList.add("native");
            } else {
                this.#scrollable.addEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
                this.#scrollable.addEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
                this.#_dom_.insertBefore(this.#vBarOverlay, this.#scrollable);
                this.#_dom_.insertBefore(this.#hBarOverlay, this.#vBarOverlay);
                this.#_dom_.classList.remove("native");
                this.#syncScrollBarGeometry();
            }
            // Workaround for WebKit/Safari bug.
            this.#scrollable.style.overflowX = "hidden";
            this.#scrollable.style.overflowY = "hidden";
            setTimeout(() => {
                this.#scrollable.style.overflowX = oldX;
                this.#scrollable.style.overflowY = oldY;
            }, 10);
            //
        }
        return this;
    }

    /**
     * Get/set the size and position adjustment for the horizontal scroll bar. `get` returns a copy!
     */
    public get HorizontalAdjustment(): ScrollbarAdjustment {
        return { ...this.#hAdjustment };
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
        if (this.#hAdjustment && typeof this.#hAdjustment.Offset !== "number") {
            this.#adjustmentResizeObserver.unobserve(this.#hAdjustment?.Offset.DOM);
        }
        if (this.#hAdjustment && typeof this.#hAdjustment?.ReduceSize !== "number") {
            this.#adjustmentResizeObserver.unobserve(this.#hAdjustment?.ReduceSize.DOM);
        }
        this.#hAdjustment = scrollbarAdjustment ? { ...scrollbarAdjustment } : { Offset: 0, ReduceSize: 0 }; // eslint-disable-line jsdoc/require-jsdoc
        if (typeof this.#hAdjustment.Offset !== "number") {
            this.#adjustmentResizeObserver.observe(this.#hAdjustment.Offset.DOM);
            this.#hBarStartOffset = this.#hAdjustment.Offset.DOM.offsetLeft;
        } else {
            this.#hBarStartOffset = this.#hAdjustment.Offset;
        }
        if (typeof this.#hAdjustment.ReduceSize !== "number") {
            this.#adjustmentResizeObserver.observe(this.#hAdjustment.ReduceSize.DOM);
            this.#hBarReduceWidth = this.#hAdjustment.ReduceSize.DOM.offsetWidth;
        } else {
            this.#hBarReduceWidth = this.#hAdjustment.ReduceSize;
        }
        this.#syncScrollBarGeometry();
        return this;
    }

    /**
     * Get/set the size and position adjustment for the vertical scroll bar. `get` returns a copy!
     */
    public get VerticalAdjustment(): ScrollbarAdjustment {
        return { ...this.#vAdjustment };
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
        if (this.#vAdjustment && typeof this.#vAdjustment.Offset !== "number") {
            this.#adjustmentResizeObserver.unobserve(this.#vAdjustment?.Offset.DOM);
        }
        if (this.#vAdjustment && typeof this.#vAdjustment?.ReduceSize !== "number") {
            this.#adjustmentResizeObserver.unobserve(this.#vAdjustment?.ReduceSize.DOM);
        }
        this.#vAdjustment = scrollbarAdjustment ? { ...scrollbarAdjustment } : { Offset: 0, ReduceSize: 0 }; // eslint-disable-line jsdoc/require-jsdoc
        if (typeof this.#vAdjustment.Offset !== "number") {
            this.#adjustmentResizeObserver.observe(this.#vAdjustment.Offset.DOM);
            this.#vBarStartOffset = this.#vAdjustment.Offset.DOM.offsetTop;
        } else {
            this.#vBarStartOffset = this.#vAdjustment.Offset;
        }
        if (typeof this.#vAdjustment.ReduceSize !== "number") {
            this.#adjustmentResizeObserver.observe(this.#vAdjustment.ReduceSize.DOM);
            this.#vBarReduceHeight = this.#vAdjustment.ReduceSize.DOM.offsetHeight;
        } else {
            this.#vBarReduceHeight = this.#vAdjustment.ReduceSize;
        }
        this.#syncScrollBarGeometry();
        return this;
    }

    /**
     * Get the current scroll offset of the scroll container.
     */
    public get ScrollOffset(): { X: number; Y: number; } { // eslint-disable-line jsdoc/require-jsdoc
        return { X: this.#scrollable.scrollLeft, Y: this.#scrollable.scrollTop }; // eslint-disable-line jsdoc/require-jsdoc
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
            this.#scrollable.scroll(arg1, arg2);
        } else {
            this.#scrollable.scroll(<ScrollToOptions>arg1);
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
            this.#scrollable.scrollBy(arg1, arg2);
        } else {
            this.#scrollable.scrollBy(<ScrollToOptions>arg1);
        }
        return this;
    }

    /**
     * Get the inner content container (the one which holds the components of the scrollable area).\
     * __Note:__ This property __must not be used to add/remove/... components__, instead use the
     * respective functions of `ScrollContainer` itself! `Content` should only be used for styling
     * or other (readonly) purposes!
     */
    public get Content(): IElementWithChildrenComponent<HTMLElement> {
        return this.#contentContainer;
    }

    /**
     * Removes _and disposes_ of all regular children from the scroll container.
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
     * Syncs the geometry and the position of the scroll bars. Although `ScrollContainer` tries to
     * detect any changes that may affect the geometry and the position of the scroll bars these
     * checks currently won't detect, for example, a change of `dir="rtl"` somewhere in the DOM.
     * Changes like this would need a rearrangement which can be carried out manually with `sync()`.
     * This can be remedied by calling `sync()` from within a custom suitable MutationObserver.
     */
    public sync(): void {
        this.#syncScrollBarGeometry();
    }

    /**
     * Syncs the geometry of the handles and the visibility of the scroll bars based on the current
     * scroll container size and the current settings/offsets.
     */
    #syncScrollBarGeometry(): void {
        if (this.#_native) {
            return;
        }
        let hboWidth = "";
        let hasHOff = false;
        let vboHeight = "";
        let hasVOff = false;
        this.#isRTL = getComputedStyle(this.#_dom_).direction === "rtl";
        this.#isRTL
            ? this.#_dom_.classList.add("rtl")
            : this.#_dom_.classList.remove("rtl");
        if (this.#_horizontal) {
            const w = this.#scrollable.clientWidth;
            const sw = this.#scrollable.scrollWidth || 0.000001;
            this.#hBarOverlay.style.display = w < sw ? "" : "none";
            hboWidth = Math.max(w - this.#hBarStartOffset - this.#hBarReduceWidth, 0) + "px";
            this.#hBarOverlay.style.insetInlineStart = this.#hBarStartOffset + this.#hBarReduceWidth + "px";
            hasHOff = w >= sw;
            hasHOff ? this.#_dom_.classList.add("h-off") : this.#_dom_.classList.remove("h-off");
            hasHOff ? this.#vBarOverlay.style.height = "" : undefined;
            this.#hBarThumb.style.width = w < sw ? (w / sw * 100) + "%" : "100%";
        } else {
            this.#hBarOverlay.style.display = "none";
        }
        if (this.#_vertical) {
            const h = this.#scrollable.clientHeight;
            const sh = this.#scrollable.scrollHeight || 0.000001;
            this.#vBarOverlay.style.display = h < sh ? "" : "none";
            vboHeight = Math.max(h - this.#vBarStartOffset - this.#vBarReduceHeight, 0) + "px";
            this.#vBarOverlay.style.insetBlockStart = this.#vBarStartOffset + this.#vBarReduceHeight + "px";
            hasVOff = h >= sh;
            hasVOff ? this.#_dom_.classList.add("v-off") : this.#_dom_.classList.remove("v-off");
            hasVOff ? this.#hBarOverlay.style.width = "" : undefined;
            this.#vBarThumb.style.height = h < sh ? (h / sh * 100) + "%" : "100%";
        } else {
            this.#vBarOverlay.style.display = "none";
        }
        let repositionScrollBars = false;
        if (this.#_horizontal && !this.#scrollable.classList.contains("v-off")) {
            this.#hBarOverlay.style.width = !hasVOff
                ? `calc(${Math.max(this.#scrollable.clientWidth - this.#hBarStartOffset - this.#hBarReduceWidth - this.#vBar.offsetWidth, 0)}px - var(--scroll-bar-thumb-gap))`
                : hboWidth;
            repositionScrollBars = true;
        }
        if (this.#_vertical && !this.#scrollable.classList.contains("h-off")) {
            this.#vBarOverlay.style.height = !hasHOff
                ? `calc(${Math.max(this.#scrollable.clientHeight - this.#vBarStartOffset - this.#vBarReduceHeight - this.#hBar.offsetHeight, 0)}px - var(--scroll-bar-thumb-gap))`
                : vboHeight;
            repositionScrollBars = true;
        }
        this.#hScrollRange = this.#scrollable.scrollWidth - this.#scrollable.offsetWidth;
        this.#hBarScrollRange = this.#hBar.offsetWidth - this.#hBarThumb.offsetWidth;
        this.#vScrollRange = this.#scrollable.scrollHeight - this.#scrollable.offsetHeight;
        this.#vBarScrollRange = this.#vBar.offsetHeight - this.#vBarThumb.offsetHeight;
        repositionScrollBars
            ? this.#repositionScrollBars()
            : undefined;
    }

    /**
     * Syncs the position of the handles and the scroll bars with the current scroll position.
     * @param _event The scroll event.
     */
    #syncScrollBars(_event?: Event): void {
        this.#_dom_.classList.add("scrolling");
        this.#repositionScrollBars();
    }

    /**
     * Repositions the position of the handles and the scroll bars according to the current scroll
     * position.
     */
    #repositionScrollBars(): void {
        if (this.#_native) {
            return;
        }
        /**
         * - `transform: translate` works but would need additional calculations in
         *   `onDragThumbPointerDown()` since the coordinates are translated.
         * - `animate()` also works very well but it doesn't seem to consume less CPU than
         *   `insetInlineStart` or `insetBlockStart`.
         * - `insetInlineStart` and `insetBlockStart` work very well and requiere the least amount
         *   of code.
         */
        if (this.#_horizontal && this.#hBarScrollRange > 0) {
            // ---
            this.#hBarThumb.style.insetInlineStart = this.#putIntoRange(
                this.#hBarScrollRange * (this.#isRTL ? -this.#scrollable.scrollLeft : this.#scrollable.scrollLeft) / this.#hScrollRange,
                0, this.#hBarScrollRange
            ) + "px";
            // ---
            // const offset = this.#hBarScrollRange * this.#scrollable.scrollLeft / this.#hScrollRange;
            // this.#isRTL
            //     ? this.#hBarThumb.style.transform = `translateX(${this.#putIntoRange(offset, 0, -this.#hBarScrollRange)}px)`
            //     : this.#hBarThumb.style.transform = `translateX(${this.#putIntoRange(offset, 0, this.#hBarScrollRange)}px)`;
            // ---
            // const animatedProp = this.#putIntoRange(this.#hBarScrollRange * (this.#isRTL ? -this.#scrollable.scrollLeft : this.#scrollable.scrollLeft) / this.#hScrollRange, 0, this.#hBarScrollRange) + "px";
            // const animation = this.#hBarThumb.animate([
            //     { insetInlineStart: animatedProp } // eslint-disable-line jsdoc/require-jsdoc
            // ],
            //     { duration: 1, fill: "forwards", iterations: 1 } // eslint-disable-line jsdoc/require-jsdoc
            // );
            // await animation.finished;
            // animation.commitStyles();
            // animation.finish();
        } else {
            this.#hBarOverlay.style.display = "none";
            this.#hBarThumb.style.insetInlineStart = "";
        }
        if (this.#_vertical && this.#vBarScrollRange > 0) {
            // ---
            this.#vBarThumb.style.insetBlockStart = this.#putIntoRange(
                this.#vBarScrollRange * this.#scrollable.scrollTop / this.#vScrollRange,
                0, this.#vBarScrollRange
            ) + "px";
            // ---
            // this.#vBarThumb.style.transform = `translateY(${this.#putIntoRange(this.#vBarScrollRange * this.#scrollable.scrollTop / this.#vScrollRange, 0, this.#vBarScrollRange)}px)`;
            // ---
            // const animation = this.#vBarThumb.animate([
            //     { insetBlockStart: this.#putIntoRange(this.#vBarScrollRange * this.#scrollable.scrollTop / this.#vScrollRange, 0, this.#vBarScrollRange) + "px" } // eslint-disable-line jsdoc/require-jsdoc
            // ],
            //     { duration: 1, fill: "forwards", iterations: 1 } // eslint-disable-line jsdoc/require-jsdoc
            // );
            // await animation.finished;
            // animation.commitStyles();
            // animation.finish();
        } else {
            this.#vBarOverlay.style.display = "none";
            this.#vBarThumb.style.insetInlineStart = "";
        }
    }

    /**
     * Execute scrolling caused by mouse wheel events on the scroll bars.
     * @param ev The mouse wheel event.
     */
    #onWheel(ev: WheelEvent): void {
        ev.preventDefault();
        this.#scrollable.scrollBy({
            /* eslint-disable jsdoc/require-jsdoc */
            left: ev.deltaX,
            top: ev.deltaY,
            // behavior: "auto"
            /* eslint-enable */
        });
    }

    /**
     * Handling for dragging the handles on the scroll bar. Triggered when the pointer is held down.
     * @param event The pointer event.
     */
    #onDragThumbPointerDown(event: PointerEvent): void {
        const target = event.target;
        if ((target === this.#vBarThumb) || (target === this.#hBarThumb)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.#dragging = true;
            this.#contScrollHorizontal = this.#draggingThumb === this.#hBarThumb;
            this.#dragStart.x = event.clientX;
            this.#dragStart.y = event.clientY;
            this.#dragStartElementPos.x = this.#scrollable.scrollLeft;
            this.#dragStartElementPos.y = this.#scrollable.scrollTop;
            this.#draggingThumb = <HTMLDivElement>target;
            this.#draggingThumbRect.x = this.#draggingThumb.offsetLeft;
            this.#draggingThumbRect.y = this.#draggingThumb.offsetTop;
            this.#draggingThumbRect.width = this.#draggingThumb.offsetWidth;
            this.#draggingThumbRect.height = this.#draggingThumb.offsetHeight;
            this.#draggingBarRect.width = this.#draggingThumb.parentElement!.offsetWidth;
            this.#draggingBarRect.height = this.#draggingThumb.parentElement!.offsetHeight;
            this.#draggingThumb.addEventListener("pointermove", this.#fncOnDragThumbPointerMove, this.#passiveTrue);
            this.#draggingThumb.setPointerCapture(event.pointerId);
            this.#_dom_.classList.add("dragging");
        }
    }

    /**
     * @see {@link #onDragThumbPointerDown()}
     * @param event The pointer event.
     */
    #onDragThumbPointerMove(event: PointerEvent): void {
        if (this.#draggingThumb === this.#hBarThumb) {
            const dx = event.clientX - this.#dragStart.x;
            // Map moveable area of the scroll bar to the scroll bar area.
            const f =
                // Width of the invisible area.
                (this.#scrollable.scrollWidth - this.#scrollable.offsetWidth) /
                // Width of the area which is available for moving with the mouse.
                (this.#draggingBarRect.width - this.#draggingThumbRect.width);
            this.#scrollable.scrollTo({
                left: this.#dragStartElementPos.x + (dx * f) // eslint-disable-line jsdoc/require-jsdoc
            });
        } else if (this.#draggingThumb === this.#vBarThumb) {
            const dy = event.clientY - this.#dragStart.y;
            // Map moveable area of the scroll bar to the scroll bar area.
            const f =
                // Height of the invisible area.
                (this.#scrollable.scrollHeight - this.#scrollable.offsetHeight) /
                // Height of the area which is available for moving with the mouse.
                (this.#draggingBarRect.height - this.#draggingThumbRect.height);
            this.#scrollable.scrollTo({
                top: this.#dragStartElementPos.y + (dy * f) // eslint-disable-line jsdoc/require-jsdoc
            });
        }
    }

    /**
     * @see {@link #onDragThumbPointerDown()}
     * @param event The pointer event.
     */
    #onDragThumbPointerUp(event: PointerEvent): void {
        if (this.#dragging) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setTimeout(() => {
                this.#dragging = false;
                this.#draggingThumb!.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove, this.#passiveTrue);
                this.#draggingThumb!.releasePointerCapture(event.pointerId);
                this.#draggingThumb = undefined;
                this.#dragStart.x = -Infinity;
                this.#dragStart.y = -Infinity;
                this.#dragStartElementPos.x = -Infinity;
                this.#dragStartElementPos.y = -Infinity;
                this.#_dom_.classList.remove("dragging");
            }, 1);
        }
    }

    /**
     * Handling for clicking on and holding down the scroll bar. Scrolls page by page when clicking
     * on a free area in the scroll bar and scrolls permanently when holding down on a free area in
     * the scroll bar.
     * @param event The pointer event.
     */
    #onScrollBarPointerDown(event: PointerEvent): void {
        if ((event.target === this.#hBar || event.target === this.#vBar)) {
            (<HTMLElement>event.target).setPointerCapture(event.pointerId);
        }
        this.#contScrollStartPos.x = event.offsetX;
        this.#contScrollStartPos.y = event.offsetY;
        if (event.target === this.#hBar) {
            event.preventDefault();
            this.#isPointerDown = true;
            this.#contScrollHorizontal = true;
            this.#contScrollBackwards = event.offsetX <= this.#hBarThumb.offsetLeft;
            this.#scrollPageLength = this.#scrollable.scrollWidth * this.#hBarThumb.offsetWidth / this.#hBar.offsetWidth;
            const scrollBy = event.offsetX < this.#hBarThumb.offsetLeft ? -this.#scrollPageLength : this.#scrollPageLength;
            /* eslint-disable jsdoc/require-jsdoc */
            this.#scrollable.scrollBy({
                left: scrollBy,
                behavior: "smooth"
            });
            /* eslint-enable */
        } else if (event.target === this.#vBar) {
            event.preventDefault();
            this.#isPointerDown = true;
            this.#contScrollHorizontal = false;
            this.#contScrollBackwards = event.offsetY <= this.#vBarThumb.offsetTop;
            this.#scrollPageLength = this.#scrollable.scrollHeight * this.#vBarThumb.offsetHeight / this.#vBar.offsetHeight;
            const scrollBy = event.offsetY < this.#vBarThumb.offsetTop ? -this.#scrollPageLength : this.#scrollPageLength;
            /* eslint-disable jsdoc/require-jsdoc */
            this.#scrollable.scrollBy({
                top: scrollBy,
                behavior: "smooth"
            });
            /* eslint-enable */
        }
    }

    /**
     * @see {@link #onScrollBarPointerDown()}
     * @param event The pointer event.
     */
    #onScrollBarPointerUp(event: PointerEvent): void {
        if ((event.target === this.#hBar || event.target === this.#vBar)) {
            (<HTMLElement>event.target).releasePointerCapture(event.pointerId);
        }
        this.#isPointerDown = false;
    }

    /**
     * @see {@link #onScrollBarPointerDown()}
     * @param _event The event.
     * @see https://bugs.webkit.org/show_bug.cgi?id=201556 Once implemented, this probably could be
     * made easier.
     */
    #onScrollEnd(_event: Event): void {
        this.#lastScrollPos.x = this.#scrollable.scrollLeft;
        this.#lastScrollPos.y = this.#scrollable.scrollTop;
        clearTimeout(this.#onScrollEndTimeout);
        this.#onScrollEndTimeout = setTimeout(() => {
            if ((this.#lastScrollPos.x !== this.#scrollable.scrollLeft) || (this.#lastScrollPos.y !== this.#scrollable.scrollTop)) {
                this.#_dom_.classList.remove("scrolling");
                return;
            }
            const rafScroll = () => { // eslint-disable-line jsdoc/require-jsdoc
                if (!this.#isPointerDown) {
                    this.#_dom_.classList.remove("scrolling");
                    return;
                }
                const thumbRect = this.#contScrollHorizontal ?
                    new DOMRect(this.#hBarThumb.offsetLeft, this.#hBarThumb.offsetTop, this.#hBarThumb.offsetWidth, this.#hBarThumb.offsetHeight)
                    : new DOMRect(this.#vBarThumb.offsetLeft, this.#vBarThumb.offsetTop, this.#vBarThumb.offsetWidth, this.#vBarThumb.offsetHeight);
                if (this.#rectContains(thumbRect, this.#contScrollStartPos)) {
                    this.#_dom_.classList.remove("scrolling");
                    return;
                }
                const contScrollDistance = this.#contScrollBackwards ? -this.#scrollPageLength / 10 : this.#scrollPageLength / 10;
                /* eslint-disable jsdoc/require-jsdoc */
                this.#scrollable.scrollBy({
                    left: this.#contScrollHorizontal ? contScrollDistance : 0,
                    top: this.#contScrollHorizontal ? 0 : contScrollDistance,
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
    #rectContains(rect: DOMRect, point: DOMPoint): boolean {
        return (point.x >= rect.left)
            && (point.y >= rect.top)
            && (point.x <= rect.right)
            && (point.y <= rect.bottom);
    }

    /**
     * Checks a value against the boundaries of `rangeEnd1` and `rangeEnd2`.
     * @param n The value to check against the boundaries given by `rangeEnd1` and `rangeEnd2`.
     * @param rangeEnd1 One end of the range to check against.
     * @param rangeEnd2 The other end of the range to check against.
     * @returns `n`, if `n` is equal to `rangeEnd1` or `rangeEnd2` or lies between `rangeEnd1` and
     * `rangeEnd2` or the boundary which is nearest to `n` (`rangeEnd1` or `rangeEnd2`).
     */
    #putIntoRange(n: number, rangeEnd1: number, rangeEnd2: number): number {
        return rangeEnd1 === rangeEnd2
            ? rangeEnd1
            : rangeEnd1 < rangeEnd2
                ? Math.max(Math.min(n, rangeEnd2), rangeEnd1)
                : Math.max(Math.min(n, rangeEnd1), rangeEnd2);
    }

    /** @inheritdoc */
    protected override clearOwner(): this {
        this.#mutationObserver.disconnect();
        this.#resizeObserver.disconnect();
        this.#scrollable.removeEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
        this.#scrollable.removeEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
        this.#hBar.removeEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
        this.#hBar.removeEventListener("pointerup", this.#fncOnScrollBarPointerUp);
        this.#hBarThumb.removeEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
        this.#hBarThumb.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove);
        this.#hBarThumb.removeEventListener("pointerup", this.#fncOnDragThumbPointerUp);
        this.#hBarOverlay.removeEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
        this.#hBarOverlay.remove();
        this.#hBar.remove();
        this.#hBarThumb.remove();
        this.#vBar.removeEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
        this.#vBar.removeEventListener("pointerup", this.#fncOnScrollBarPointerUp);
        this.#vBarThumb.removeEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
        this.#vBarThumb.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove);
        this.#vBarThumb.removeEventListener("pointerup", this.#fncOnDragThumbPointerUp);
        this.#vBarOverlay.removeEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
        this.#vBarOverlay.remove();
        this.#vBar.remove();
        this.#vBarThumb.remove();
        return super.clearOwner();
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
        this.#_dom_ = this.ui.DOM;
        // Horizontal scroll bar.
        this.#hBarOverlay = document.createElement("div");
        this.#hBarOverlay.classList.add("h-bar-overlay");
        this.#hBarOverlay.addEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
        this.#hBar = document.createElement("div");
        this.#hBar.classList.add("h-bar");
        this.#hBar.addEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
        this.#hBar.addEventListener("pointerup", this.#fncOnScrollBarPointerUp);
        this.#hBarOverlay.appendChild(this.#hBar);
        this.#hBarThumb = document.createElement("div");
        this.#hBarThumb.classList.add("h-bar-thumb");
        this.#hBarThumb.addEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
        this.#hBarThumb.addEventListener("pointerup", this.#fncOnDragThumbPointerUp);
        this.#hBar.appendChild(this.#hBarThumb);
        // Vertical scroll bar.
        this.#vBarOverlay = document.createElement("div");
        this.#vBarOverlay.classList.add("v-bar-overlay");
        this.#vBarOverlay.addEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
        this.#vBar = document.createElement("div");
        this.#vBar.classList.add("v-bar");
        this.#vBar.addEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
        this.#vBar.addEventListener("pointerup", this.#fncOnScrollBarPointerUp);
        this.#vBarOverlay.appendChild(this.#vBar);
        this.#vBarThumb = document.createElement("div");
        this.#vBarThumb.classList.add("v-bar-thumb");
        this.#vBarThumb.addEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
        this.#vBarThumb.addEventListener("pointerup", this.#fncOnDragThumbPointerUp);
        this.#vBar.appendChild(this.#vBarThumb);
        // Container for content elements.
        this.#contentContainer = new Div()
            .addClass("content");
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.#contentContainer.DOM);
        this.#scrollable = this.#contentContainer.DOM;
        // Sync scroll bars on scrolling and detect the end of a scroll process.
        this.#scrollable.addEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
        this.#scrollable.addEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
        // Sync scrollbar geometry on resizing.
        this.#resizeObserver = new ResizeObserver((entries => {
            if (this.#_vertical || this.#_horizontal) {
                for (const entry of entries) {
                    if ((entry.target === this.#_dom_) || (entry.target.parentElement === this.#contentContainer.DOM)) {
                        this.#syncScrollBarGeometry();
                        // console.log("resize");
                        break;
                    }
                }
            }
        }));
        this.#resizeObserver.observe(this.#_dom_);
        // Add/remove resize observing on adding/removing nodes.
        this.#mutationObserver = new MutationObserver(records => {
            for (const record of records) {
                for (const node of record.removedNodes) {
                    node instanceof Element
                        ? this.#resizeObserver.unobserve(node)
                        : undefined;
                }
                for (const node of record.addedNodes) {
                    node instanceof Element
                        ? this.#resizeObserver.observe(node)
                        : undefined;
                }
            }
            // console.log("mutate");
            this.#syncScrollBarGeometry();
        });
        this.#mutationObserver.observe(this.#contentContainer.DOM, { childList: true, subtree: true, attributes: true, characterData: true }); // eslint-disable-line jsdoc/require-jsdoc
        // Adjust `Offset` and `ReduceSize` if components are given for adjustments.
        this.#adjustmentResizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const ref = <HTMLElement>entry.target;
                let syncScrollBarGeometry = false;
                if (ref === (<INodeComponent<HTMLElement>>this.#hAdjustment.Offset).DOM) {
                    this.#hBarStartOffset = ref.offsetLeft;
                    syncScrollBarGeometry = true;
                }
                if (ref === (<INodeComponent<HTMLElement>>this.#hAdjustment.ReduceSize).DOM) {
                    this.#hBarReduceWidth = ref.offsetWidth;
                    syncScrollBarGeometry = true;
                }
                if (ref === (<INodeComponent<HTMLElement>>this.#vAdjustment.Offset).DOM) {
                    this.#vBarStartOffset = ref.offsetTop;
                    syncScrollBarGeometry = true;
                }
                if (ref === (<INodeComponent<HTMLElement>>this.#vAdjustment.ReduceSize).DOM) {
                    this.#vBarReduceHeight = ref.offsetHeight;
                    syncScrollBarGeometry = true;
                }
                syncScrollBarGeometry
                    ? this.#syncScrollBarGeometry()
                    : undefined;
            }
        });
        // Mount inner components.
        if (this.#_horizontal) {
            this.ui.addClass("horizontal");
            this.ui.DOM.appendChild(this.#hBarOverlay);
        }
        if (this.#_vertical) {
            this.ui.addClass("vertical");
            this.ui.DOM.appendChild(this.#vBarOverlay);
        }
        this.ui.append(this.#contentContainer);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.#contentContainer`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface ScrollContainer<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Div, EventMap>, AChildren<HTMLElement, EventMap> { } // eslint-disable-line jsdoc/require-jsdoc

/**
 * Factory for `ScrollContainer` components.
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

import { ACustomComponentEvent, ANodeComponent, AnyType, DEFAULT_EVENT_INIT_DICT, INodeComponent } from "@vanilla-ts/core";


/** Custom 'pinch-zoom' event for pinch zoom handlers. */
export class PinchZoomEvent extends ACustomComponentEvent<"pinch-zoom", PinchZoomGestureHandler, {
    /** The target component on which the pinch zoom gesture happened. */
    Target: INodeComponent<HTMLElement>;
    /**
     * The event target of the touch event. These can be different nodes for each event, depending
     * on the HTML elements inside of `target` and the pointer that is currently being moved.
     */
    EventTarget: EventTarget | null;
    /**
     * The coordinates of the center of the two pointers during a pinch zoom gesture. The
     * coordinates are relative to the viewport (`event.clientX`, `event.clientY`). The value is
     * always set to `{ x: 0, y: 0 }` on gesture start and gesture end.
     */
    Origin: DOMPoint;
    /**
     * The scaling amount caused by the pinch zoom gesture:
     * - The value `PINCH_ZOOM_START` (`-Infinity`) indicates that pinch zooming has been started
     *   (i.e. two pointers are down now).
     * - The value `PINCH_ZOOM_STOP` (`Infinity`) indicates that pinch zooming has been stopped
     *   (i.e. the number of pointers is not equal to `2`).
     */
    Scale: number;
    /**
     * The initial distance between the two pointers when the pinch zoom gesture started. This value
     * is always `-1` if the pinch zoom gesture has been stopped.
     */
    InitialDistance: number;
}> {
    /**
     * Create zoom event.
     * @param sender The event emitter (always `PinchZoomGestureHandler`).
     * @param target The target component on which the pinch zoom gesture happened.
     * @param eventTarget The event target of the touch event (i.e. a node inside the node tree of
     * `target`).
     * @param origin The coordinates of the center of the two pointers during a pinch zoom gesture.
     * @param scale The scaling amount caused by the pinch zoom gesture. This is the factor by which
     * the distance between the two pointers increased/decreased relative to the initial distance
     * between the two pointers when pinch zooming started.
     * to the
     * @param initialDistance The initial distance between the two pointers when the pinch zoom
     * gesture started.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: PinchZoomGestureHandler, target: INodeComponent<HTMLElement>, eventTarget: EventTarget | null, origin: DOMPoint, scale: number, initialDistance: number, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("pinch-zoom", sender, { Target: target, EventTarget: eventTarget, Origin: origin, Scale: scale, InitialDistance: initialDistance }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `PinchZoomGestureHandler`. */
export interface PinchZoomGestureHandlerEventMap extends HTMLElementEventMap {
    /** A pinch zoom gesture is executed or has been started/stopped. */
    "pinch-zoom": PinchZoomEvent;
}

/** Used as a value for `Scale` in `PinchZoomEvent` to indicate that pinch zooming has started. */
export const PINCH_ZOOM_START = -Infinity;

/** Used as a value for `Scale` in `PinchZoomEvent` to indicate that pinch zooming has stopped. */
export const PINCH_ZOOM_STOP = Infinity;

/**
 * Handles pinch zoom gestures on a component. The component dispatches `pinch-zoom` events on pinch
 * zoom gestures.
 *
 * This component is intended for use on mobile devices that support touch gestures. It can also
 * work in desktop browsers on devices with touch input support such as notebooks with touch
 * screens. Notable exceptions, according to MDN, are the desktop versions of Opera and Safari.
 *
 * __Note__: Although the handler extends `ANodeComponent` and is therefore a UI component, it is
 * _not_ intended to be mounted in another component. The reason for its dependency on
 * `ANodeComponent` is that the handler is able to emit/disptach events and uses the capabilities of
 * `ANodeComponent` for this. So if an instance of `PinchZoomGestureHandler` is created, it
 * must/should not be mounted in a component and thus disposed of manually! If, however, the handler
 * _is_ mounted in a component this component will dispose of the handler as usually. But in this
 * case the component will contain an empty HTML comment as a child component.
 */
export class PinchZoomGestureHandler<EventMap extends PinchZoomGestureHandlerEventMap = PinchZoomGestureHandlerEventMap> extends ANodeComponent<Node, EventMap> {
    protected _active: boolean;
    protected target: INodeComponent<HTMLElement>;
    protected initialDistance: number = -1;
    protected pinchZooming: boolean = false;
    protected fncOnTouchStart = this.onTouchStart.bind(this);
    protected fncOnTouchMove = this.onTouchMove.bind(this);
    protected fncOnTouchEnd = this.onTouchEnd.bind(this);

    /**
     * Create pinch zoom gesture handler.
     * @param target The target component for which the pinch zoom gesture is to be enabled.
     * @param active `true` if handling of the pinch zoom gesture is active, otherwise `false`.
     */
    constructor(target: INodeComponent<HTMLElement>, active: boolean = true) {
        super();
        this._dom = document.createComment("");
        this.target = target;
        this.active(active);
    }

    /**
     * Get/set the `Active` state of the pinch zoom gesture handler.
     */
    public get Active(): boolean {
        return this._active;
    }
    /** @inheritdoc */
    public set Active(v: boolean) {
        this.active(v);
    }

    /**
     * Set the `Active` state of the pinch zoom gesture handler.
     * @param active `true` if handling of the pinch zoom gesture is active, otherwise `false`.
     * @returns This instance.
     */
    public active(active: boolean): this {
        if (this._active !== active) {
            this._active = active;
            /* eslint-disable jsdoc/require-jsdoc */
            if (this._active) {
                this.target.on("touchstart", this.fncOnTouchStart, { passive: false, capture: true });
                this.target.on("touchmove", this.fncOnTouchMove, { passive: false, capture: true });
                this.target.on("touchend", this.fncOnTouchEnd, { passive: false, capture: true });
                this.target.on("touchcancel", this.fncOnTouchEnd, { passive: false, capture: true });
            } else {
                this.target.off("touchstart", this.fncOnTouchStart, { passive: false, capture: true });
                this.target.off("touchmove", this.fncOnTouchMove, { passive: false, capture: true });
                this.target.off("touchend", this.fncOnTouchEnd, { passive: false, capture: true });
                this.target.off("touchcancel", this.fncOnTouchEnd, { passive: false, capture: true });
            }
            /* eslint-enable */
        }
        return this;
    }

    /**
     * Handle `touchstart` event on the target component.
     * @param ev The touch event.
     */
    protected onTouchStart(ev: TouchEvent): AnyType {
        if (ev.touches.length > 2 && this.pinchZooming) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.pinchZooming = false;
            this.initialDistance = -1;
            this.emit(new PinchZoomEvent(this, this.target, ev.target, new DOMPoint(0, 0), PINCH_ZOOM_STOP, this.initialDistance));
            return;
        }
        if (ev.touches.length === 2 && !this.pinchZooming) {
            this.initialDistance = Math.sqrt(
                Math.pow(ev.touches[1].clientX - ev.touches[0].clientX, 2) +
                Math.pow(ev.touches[1].clientY - ev.touches[0].clientY, 2)
            );
            this.pinchZooming = true;
            this.emit(new PinchZoomEvent(this, this.target, ev.target, new DOMPoint(0, 0), PINCH_ZOOM_START, this.initialDistance));
        }
    }

    /**
     * Handle `touchmove` event on the target component.
     * @param ev The touch event.
     */
    protected onTouchMove(ev: TouchEvent): AnyType {
        if (ev.touches.length === 2 && this.pinchZooming) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            const X0 = ev.touches[0].clientX;
            const Y0 = ev.touches[0].clientY;
            const X1 = ev.touches[1].clientX;
            const Y1 = ev.touches[1].clientY;
            const origin = new DOMPoint(
                Math.min(X1, X0) + Math.abs(X1 - X0) / 2,
                Math.min(Y1, Y0) + Math.abs(Y1 - Y0) / 2
            );
            const currentDistance = Math.sqrt(
                Math.pow(X1 - X0, 2) +
                Math.pow(Y1 - Y0, 2)
            );
            // Would also work, but browser support is unclear.
            // this.emit(new PinchZoomEvent(this, this.target, origin, ev.scale, this.initialDistance));
            this.emit(new PinchZoomEvent(this, this.target, ev.target, origin, currentDistance / this.initialDistance, this.initialDistance));
        }

    }

    /**
     * Handle `touchend`/`touchcancel` event on the target component.
     * @param ev The touch event.
     */
    protected onTouchEnd(ev: TouchEvent): AnyType {
        if (ev.touches.length !== 2 && this.pinchZooming) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.pinchZooming = false;
            this.initialDistance = -1;
            this.emit(new PinchZoomEvent(this, this.target, ev.target, new DOMPoint(0, 0), PINCH_ZOOM_STOP, this.initialDistance));
        }
    }

    /** @inheritdoc */
    override dispose(): void {
        this.active(false);
        super.dispose();
    }
}

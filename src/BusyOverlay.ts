import { ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, IElementComponent } from "@vanilla-ts/core";
import { Dialog, Div, Span } from "@vanilla-ts/dom";


/** Custom 'busy' event for BusyOverlays. */
export class BusyOverlayBusyEvent extends ACustomComponentEvent<"busy", BusyOverlay> {
    /**
     * Create 'busy' event.
     * @param sender The event emitter (always `BusyOverlay`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: BusyOverlay, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("busy", sender, undefined, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'idle' event for BusyOverlays. */
export class BusyOverlayIdleEvent extends ACustomComponentEvent<"idle", BusyOverlay> {
    /**
     * Create 'idle' event.
     * @param sender The event emitter (always `BusyOverlay`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: BusyOverlay, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("idle", sender, undefined, customEventInitDict);
    }
}

/** Additional event(s) for `BusyOverlay`. */
export interface BusyOverlayEventMap extends HTMLElementEventMap {
    /**
     * A busy overlay is to be shown. Event handlers can prevent showing the overlay by calling
     * `preventDefault()`.
     */
    "busy": BusyOverlayBusyEvent;
    /**
     * A busy overlay is to be hidden. Event handlers can prevent hiding the dialog by calling
     * `preventDefault()`.
     */
    "idle": BusyOverlayIdleEvent;
}

/**
 * BusyOverlay is a component for displaying an overlay that indicates a 'busy-with-no-defined-end'
 * state. The overlay covers the complete viewport and prevents any user interaction with the UI
 * below. The usual use case is that the application does something that takes longer and needs to
 * be waited for. The component supports nested calls of `busy()` to facilitate use in scenarios
 * where multiple nested operations each want to signal longer execution times.\
 * __Notes:__
 * - Although the interface of `BusyOverlay` is that of a UI component, there is no need to
 *   mount/append instances of it to another component.
 * - Usually a single instance of `BusyOverlay` should be sufficient to be used in an application.
 * - The default visual indicator is an animated `Span` but `BusyOverlay` can also be given any
 *   other component to be shown when an application is 'busy'. Together with `AllowEscape` and the
 *   events that `BusyOverlay` dispatches when showing and hiding, this enables use cases other than
 *   just displaying a 'busy' state and blocking the user interface.
 */
export class BusyOverlay<EventMap extends BusyOverlayEventMap = BusyOverlayEventMap> extends AElementComponentWithInternalUI<Dialog, EventMap> {
    protected _delay: number;
    protected _busyIndicator: IElementComponent<HTMLElement> | undefined;
    protected defaultBusyIndicator: Span = new Span();
    protected content: Div;
    protected busyCount: number = 0;
    protected focusableElementsSelector = "button:not([tabindex='-1']), [href], input:not([tabindex='-1']), select:not([tabindex='-1']), textarea:not([tabindex='-1']), details:not([tabindex='-1']), [tabindex]:not([tabindex='-1'])";
    protected _allowEscape: boolean = false;

    /**
     * Create BusyOverlay component.
     * @param delay Set the default delay after which the overlay will be shown. See
     * function/property `delay()`/`Delay`.
     * @param allowEscape `true`, if the `Esc` key can be used to hide the overlay, otherwise
     * `false`. See function/property `allowEscape()`/`AllowEscape`.
     * @param busyIndicator A component which is displayed to visualize the 'busy' state. If
     * `undefined` an animated `Span` component is used by default.
     */
    constructor(delay: number = 0, allowEscape: boolean = false, busyIndicator?: IElementComponent<HTMLElement>) {
        super();
        super
            .initialize()
            .delay(delay)
            .allowEscape(allowEscape)
            .busyIndicator(busyIndicator);
    }

    /**
     * Get the current count of pending `busy()` calls.
     */
    public get BusyCount(): number {
        return this.busyCount;
    }

    /**
     * Get/set the default delay after which the overlay will be shown.
     * @see {@link BusyOverlay.delay()}
     */
    public get Delay(): number {
        return this._delay;
    }
    /** @inheritdoc */
    public set Delay(v: number) {
        this.delay(v);
    }

    /**
     * Set the default delay after which the overlay will be shown.\
     * __Note__: The overlay is immediately inserted into the DOM so that the user interface does
     * not respond to any user interaction after `busy()` is called. The delay is used to set the
     * value for the CSS property `animation-delay`, which makes the overlay visible after `delay`
     * milliseconds.
     * @param delay A delay in milliseconds. Negative values will be set to `0`.
     * @returns This instance.
     */
    public delay(delay: number): this {
        this._delay = Math.max(0, delay);
        this.style("animationDelay", `${this._delay}ms`);
        return this;
    }

    /**
     * Enable/disable using the 'Esc' button to hide the overlay.
     *  {@link BusyOverlay.allowEscape()}
     */
    public get AllowEscape(): boolean {
        return this._allowEscape;
    }
    /** @inheritdoc */
    public set AllowEscape(v: boolean) {
        this.allowEscape(v);
    }

    /**
     * Enable/disable using the 'Esc' button to hide the overlay. Setting this to `true` enables the
     * the user to hide the overlay by pressing the escape key.\
     * __Note:__ Pressing the `Esc` key calls `idle()` internally, so if several `busy()` calls have
     * already been executed, `Esc` must be pressed until the internal counter is back to `1` to
     * actually hide the overlay. `AllowEscape` is therefore rather intended to display an operation
     * that runs indefinitely with its own component (see `busyIndicator()`) and to give the user
     * the option of canceling this operation via `Esc`. The `BusyOverlayIdleEvent` event can be
     * used to detect, if the user wishes to cancel such an operation.
     * @param allowEscape `true`, if the `Esc` key can be used to hide the overlay, otherwise
     * `false`.
     * @returns This instance.
     */
    public allowEscape(allowEscape: boolean): this {
        this._allowEscape = allowEscape;
        return this;
    }

    /**
     * Get/set the component which is displayed to visualize the 'busy' state.
     * @see {@link BusyOverlay.busyIndicator()}
     */
    public get BusyIndicator(): IElementComponent<HTMLElement> | undefined {
        return this._busyIndicator;
    }
    /** @inheritdoc */
    public set BusyIndicator(v: IElementComponent<HTMLElement> | undefined) {
        this.busyIndicator(v);
    }

    /**
     * Set the component to be displayed to visualize the 'busy' state. By default an animated
     * `Span` component is used, but with `busyIndicator()` this can be changed to any other
     * component.
     * @param busyIndicator The component to be displayed to visualize the 'busy' state. If the
     * given value is undefined, the internal animated default `Span` component is used.\
     * __Notes:__
     * - No CSS is applied to the given component, this has to be done elsewhere.
     * - The component will be disposed of, if the `BusyOverlay` instance is disposed of, so in
     *   order to keep the component intact, `busyIndicator()` or `busyIndicator(undefined)` must
     *   be called before disposing of the `BusyOverlay` instance!
     * @returns This instance.
     */
    public busyIndicator(busyIndicator?: IElementComponent<HTMLElement>): this {
        this.content.remove();
        this._busyIndicator = busyIndicator;
        this.content.append(
            this._busyIndicator
                ? this._busyIndicator
                : this.defaultBusyIndicator
        );
        return this;
    }

    /**
     * Shows the busy overlay.\
     * __Notes:__
     * - In a synchronous context `busy()` must be awaited, otherwise the browser may not show the
     *   overlay immediately (or too late) due to DOM batching.
     * - Even if `busy()` is called multiple times, only one overlay is shown, so multiple calls
     *   in nested functions are possible.
     * - `BusyOverlay` maintains an internal counter for `busy()`/`idle()` calls. `busy()` only
     *   opens the overlay if the counter is `0` whereas `idle()` only closes the overlay if the
     *   counter is `1`. Therefore is it is very important that `busy()`/`idle()` should always be
     *   used in a `try/finally` context that calls `idle()` in the `finally` block!
     * - `busy()` dispatches a `BusyOverlayBusyEvent` that can be cancelled. If the event is
     *   cancelled `busy()` does nothing.
     * @param delay Temporarily overrides the current default delay (property `Delay`) for this
     * `busy()` call. The next call of `busy()` will use the default value again.
     * @example
     * ```
     * // Create an instance of `BusyOverlay`. It's perfectly valid to reuse this instance at
     * // different places.
     * const busyOverlay = new BusyOverlay(250);
     *
     * await busyOverlay.busy()
     * try {
     *   // `doSomeLengthyOperation()` could also call `busy()`/`idle()` in a similar way (i.e. in
     *   // a `try/finally` context).
     *   doSomeLengthyOperation()
     * } finally {
     *   busyOverlay.idle();
     * }
     * ```
     */
    public async busy(delay?: number): Promise<void> {
        if (this.dispatch(new BusyOverlayBusyEvent(this))) {
            this.busyCount++;
            if (this.busyCount === 1) {
                if (!this.Parent) {
                    document.body.appendChild(this.DOM);
                }
                delay !== undefined && this.style("animationDelay", `${Math.max(0, delay)}ms`);
                this.ui.showModal();
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
    }

    /**
     * Hide the busy overlay. Depending on the number of previous `busy()` calls, `idle()` may have
     * to be called multiple times before the overlay is actually hidden. If the overlay isn't
     * showing (`BusyCount` is `0`), `idle()` does nothing and also does not dispatch an
     * `BusyOverlayIdleEvent` event.
     */
    public idle(): void {
        if (this.busyCount !== 0 && this.dispatch(new BusyOverlayIdleEvent(this))) {
            this.busyCount--;
            if (this.busyCount === 0) {
                this.ui.close();
                if (!this.Parent) {
                    this.DOM.remove();
                }
                this.delay(this._delay);
            }
        }
    }

    /**
     * If, for whatever reason, the chain of `busy()`/`idle()` pairs is interrupted so that the
     * internal counter is not equal to `0`, `reset()` can be called. `reset()` closes the overlay
     * and sets the internal counter to `0`. No `BusyOverlayIdleEvent` is dispatched.
     */
    public reset(): void {
        this.ui.close();
        if (!this.Parent) {
            this.DOM.remove();
        }
        this.delay(this._delay);
        this.busyCount = 0;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI(): this {
        this.defaultBusyIndicator = new Span().addClass("busy-indicator");
        this.ui = new Dialog()
            .append(this.content = new Div().addClass("content"))
            .on("keydown", (ev) => {
                switch (ev.key) {
                    case "Escape":
                        ev.preventDefault();
                        ev.stopImmediatePropagation();
                        if (this._allowEscape) {
                            this.idle();
                        }
                        break;
                    case "Tab":
                        // Keep focus inside the overlay.
                        if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) {
                            const focusableElements = this.DOM.querySelectorAll(this.focusableElementsSelector);
                            const firstFocusableElement = <HTMLElement>focusableElements[0];
                            const lastFocusableElement = <HTMLElement>focusableElements[focusableElements.length - 1];
                            if (ev.shiftKey) {
                                if (ev.target === firstFocusableElement) {
                                    ev.preventDefault();
                                    ev.stopImmediatePropagation();
                                    lastFocusableElement?.focus?.();
                                }
                            } else {
                                if (ev.target === lastFocusableElement) {
                                    ev.preventDefault();
                                    ev.stopImmediatePropagation();
                                    firstFocusableElement?.focus?.();
                                }
                            }
                        }
                        break;
                    default:
                        return;
                }
            });
        return this;
    }

    /** @inheritdoc */
    public override dispose(): void {
        this.ui.close();
        this.busyCount = 0;
        // The default indicator can be mounted or not, => dispose of manually.
        this.content.remove(this.defaultBusyIndicator);
        this.defaultBusyIndicator.dispose();
        super.dispose();
    }
}

/**
 * Factory for `BusyOverlay` components.
 */
export class BusyOverlayFactory<T> extends ComponentFactory<BusyOverlay> {
    /**
     * Create, set up and return BusyOverlay component.
     * @param delay Set the default delay after which the overlay will be shown. See
     * function/property `delay()`/`Delay`.
     * @param allowEscape `true`, if the `Esc` key can be used to hide the overlay, otherwise
     * `false`.
     * @param busyIndicator A component which is displayed to visualize the 'busy' state. If
     * `undefined` an animated `Span` component is used by default.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns BusyOverlay component.
     */
    public busyOverlay(delay: number = 0, allowEscape: boolean = false, busyIndicator?: IElementComponent<HTMLElement>, data?: T): BusyOverlay {
        return this.setupComponent(new BusyOverlay(delay, allowEscape, busyIndicator), data);
    }
}

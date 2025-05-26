import { ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, IElementComponent } from "@vanilla-ts/core";
import { Button, Div } from "@vanilla-ts/dom";


/**
 * Interface that must be implemented in order to enable stepping/navigation in bjects that
 * implement `IStepper`.
 */
export interface ISteppable {
    /**
     * Current number of entries in the 'steppable' object.
     */
    Count: number;
    /**
     * Current position in the steppable object. The property must be readable _and_ writable; on
     * writing the object must set its current position accordingly. `Index` must also be an integer
     * value!
     */
    Index: number;
    /**
     * Number of elements to step backwards/forwards on step-by-page operations. Implementors can
     * return `-1` if no page-by-page stepping is or should be supported. A call to `Backward()` or
     * `Forward()` on an instance of `IStepper then has no effect. `PageSize` must also be an
     * integer value!
     */
    PageSize: number;
}

/**
 * Interface that allows to step forward/backward in objects that implement `ISteppable`.
 */
export interface IStepper {
    /**
     * Go to index/position `0` of the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and the index/position in
     * the steppable object is set to `0` after stepping, otherwise `false`. `false` is also
     * returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object must never be called, if the operation
     * wouldn't change its value.
     */
    First(): boolean;

    /**
     * Go backward one 'page' in the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and if the index/position
     * in the steppable object is set to `Index - PageSize` or `0` after stepping, otherwise
     * `false`. `false` is also returned if the property `PageSize` in the steppable object is `-1`
     * (the object doesn't support paging) or if `Count` of the steppable object is `0`.\
     * __Notes:__
     * - The setter `Index` on the steppable object must never be called, if the operation wouldn't
     *   change its value.
     * - If `PageSize` is greater than or equal to the current distance to `0`, `Index` will be set
     *   to `0`.
     */
    PageBackward(): boolean;

    /**
     * Go backward one position in the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and if the index/position
     * in the steppable object is set to `Index - 1` after stepping, otherwise `false`. `false` is
     * also returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object must never be called, if the operation
     * wouldn't change its value.
     */
    Backward(): boolean;

    /**
     * Go forward one position in the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and if the index/position
     * in the steppable object is set to `Index + 1` after stepping, otherwise `false`. `false` is
     * also returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object must never be called, if the operation
     * wouldn't change its value.
     */
    Forward(): boolean;

    /**
     * Go forward one 'page' in the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and if the index/position
     * in the steppable object is set to `Index - PageSize` or `Count - 1` after stepping, otherwise
     * `false`. `false` is also returned if the property `PageSize` in the steppable object is `-1`
     * (the object doesn't support paging) or if `Count` of the steppable object is `0`.\
     * __Notes:__
     * - The setter `Index` on the steppable object must never be called, if the operation wouldn't
     *   change its value.
     * - If `PageSize` is greater than or equal to the current distance to `Count - 1`,
     *   `Index` will be set to `Count - 1`.
     */
    PageForward(): boolean;

    /**
     * Go to index/position `Count - 1` of the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and the index/position in
     * the steppable object is set to `Count - 1` after stepping, otherwise `false`. `false` is also
     * returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object must never be called, if the operation
     * wouldn't change its value.
     */
    Last(): boolean;
}

/**
 * Appearance of a stepper.
 */
export enum StepperAppearance {
    /**
     * Horizontal arrangement of the stepper buttons.
     */
    HORIZONTAL = 0,
    /**
     * Alternative horizontal arrangement of the stepper buttons (e.g. buttons rotated by 90°).
     */
    HORIZONTAL_ALT = 1,
    /**
     * Vertical arrangement of the stepper buttons.
     */
    VERTICAL = 2,
    /**
     * Alternative vertical arrangement of the stepper buttons (e.g. buttons rotated by 90°).
     */
    VERTICAL_ALT = 3
}

/**
 * `Stepper` options. The options are used to initialze the stepper _and_ they can be used to
 * completely re-configure an existing instance of a stepper. All option properties are optional, a
 * missing property will be replaced by its default value (when using
 * `new Stepper(steppable, options)`) or by the value already existing in the steppers options (when
 * reconfiguring a stepper with `someStepper.options({...})`).
 * @example
 * ```typescript
 * // Get a stepper instance and without showing the 'PageBackward' and 'PageForward' buttons.
 * const stepper = new Stepper(steppable, {
 *   PageBackward: false,
 *   PageForwad: false
 * })
 *
 * // Re-enable the 'PageBackward' and 'PageForward' buttons, set their titles (tooltips) according
 * // to the current page size of the stepper and set the appearance to show buttons with a vertical
 * // orientation.
 * stepper.options({
 *   Appearance: StepperAppearance.HORIZONTAL_ALT,
 *   PageBackward: true,
 *   PageBackwardTitle: `Go back ${stepper.PageSize} entries`,
 *   PageForward: true,
 *   PageForwardTitle: `Go forwad ${stepper.PageSize} entries`
 * })
 *
 * // Add a component which displays the current index and count of the steppable object.
 * const index = new Span(`${stepper.Index + 1} / ${stepper.Count}`);
 * stepper
 *   .on("stepped", () => index.Text = `${stepper.Index + 1} / ${stepper.Count}`)
 *   .options({
 *     Separator: index
 *   });
 * ```
 */
export interface StepperOptions {
    /** Appearance of the stepper. */
    Appearance?: StepperAppearance;
    /**
     * If `true`, buttons that cannot be used (e.g. the `First` button with `Index === 0`) are not
     * only deactivated but the CSS class `hidden` is be added. Usually this should make the buttons
     * invilible (`visibility: hidden`) but they could also be styled differently.
     */
    HideButtons?: boolean;
    /** Timings for a held down pointer/mouse button. */
    // Continuous?: OnHeldDownOptions;
    /**
     * A separator component is inserted between the button groups which step backwards and
     * forwards. Such a component could be used, for example, to display the current index of the
     * steppable object. When using `Separator` the following rules apply:
     * 1. If the value is a component, it is inserted and the CSS class `separator` is added to it.
     * 2. If the value is `null`, the current separator component (if present) is removed from the
     *    stepper.
     * 3. If the value is `undefined`, nothing happens. If the stepper already contains a separator
     *    component, it stays untouched.
     * 4. If the stepper is disposed of and it contains a separator component, this separator is also
     *    disposed of.
     *
     * The following applies to cases 1 and 2: A previous separator component (if present) is
     * removed from the stepper and its CSS class `separator` is also removed. But this previous
     * separator is not disposed of, this must be done elsewhere!
     */
    Separator?: IElementComponent<HTMLElement> | null;
    /** Show button 'First'? Default: `true`. */
    First?: boolean;
    /** Title/tooltip for button 'First'. Default: empty string. */
    FirstTitle?: string;
    /** Show button 'Page back'? Default: `true`. */
    PageBackward?: boolean;
    /** Support for holding the pointer down on 'Page backward'? */
    // PageBackwardContinuous?: boolean;
    /** Title/tooltip for button 'Page back'. Default: empty string. */
    PageBackwardTitle?: string;
    /** Show button 'Backward'? Default: `true`. */
    Backward?: boolean;
    /** Support for holding the pointer down on 'Backward'? */
    // BackwardContinuous?: boolean;
    /** Title/tooltip for button 'Backward'. Default: empty string. */
    BackwardTitle?: string;
    /** Show button 'Forward'? Default: `true`. */
    Forward?: boolean;
    /** Support for holding the pointer down on 'Forward'? */
    // ForwardContinuous?: boolean;
    /** Title/tooltip for button 'Forward'. Default: empty string. */
    ForwardTitle?: string;
    /** Show button 'Page forward'? Default: `true`. */
    PageForward?: boolean;
    /** Support for holding the pointer down on 'Page forward'? */
    // PageForwardContinuous?: boolean;
    /** Title/tooltip for button 'Page forward'. Default: empty string. */
    PageForwardTitle?: string;
    /** Show button 'Last'? Default: `true`. */
    Last?: boolean;
    /** Title/tooltip for button 'Last'. Default: empty string. */
    LastTitle?: string;
}

/** Custom 'step' event for objects implementing `IStepper`. */
export class StepEvent extends ACustomComponentEvent<"step", Stepper, {
    /** The new index/position in the steppable object. */
    Index: number;
}> {
    /**
     * Create StepEvent event.
     * @param sender The event emitter (always `Stepper`).
     * @param index The new index to which the current index/position in the steppable object is to
     * be moved.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Stepper, index: number, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("step", sender, { Index: index }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'stepped' event for objects implementing `IStepper`. */
export class SteppedEvent extends ACustomComponentEvent<"stepped", Stepper, {
    /** The new index/position in the steppable object. */
    Index: number;
}> {
    /**
     * Create SteppedEvent event.
     * @param sender The event emitter (always `Stepper`).
     * @param index The new index of the steppable object.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Stepper, index: number, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("stepped", sender, { Index: index }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for objects implementing `IStepper`. */
export interface StepperEventMap extends HTMLElementEventMap {
    /**
     * The stepper wants to go to a new index/position in the steppable object. Event handlers can
     * prevent changing the index/position by calling `preventDefault()`.
     */
    "step": StepEvent;
    /**
     * The stepper has changed the index in the steppable object. This event is purely informative
     * and can't be canceled.
     */
    "stepped": SteppedEvent;
}

/**
 * All stepper buttons.
 */
export type StepperButtons = [Button, Button, Button, Button, Button, Button];

/**
 * Stepper component with configurable buttons for stepping through an instance of `ISteppable`.
 */
export class Stepper<EventMap extends StepperEventMap = StepperEventMap> extends AElementComponentWithInternalUI<Div, EventMap> implements IStepper {
    protected steppable: ISteppable;
    protected _options: StepperOptions = {};
    protected btns: StepperButtons;
    protected btnFirst: Button;
    protected btnPageBackward: Button;
    protected btnBackward: Button;
    protected btnForward: Button;
    protected btnPageForward: Button;
    protected btnLast: Button;
    protected fncFirst = this.First.bind(this);
    protected fncPageBackward = this.PageBackward.bind(this);
    protected fncBackward = this.Backward.bind(this);
    protected fncForward = this.Forward.bind(this);
    protected fncPageForward = this.PageForward.bind(this);
    protected fncLast = this.Last.bind(this);

    /**
     * Create stepper component.
     * @param steppable An object that imüplements `ISteppable`.
     * @param options Options for the stepper.
     */
    constructor(steppable: ISteppable, options?: StepperOptions) {
        super();
        this.steppable = steppable;
        super
            .initialize()
            .createButtons()
            .options(options ?? this._options);
    }

    /**
     * Get/set the stepper options. The returned object is a _copy_, modifying this copy has no
     * effect on the corresponding stepper instance.
     */
    public get Options(): StepperOptions {
        return {
            ...this._options,
            // Continuous: { ...this.options.Continuous } // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    public set Options(v: StepperOptions) {
        this.options(v);
    }

    /**
     * Sets the options for the stepper. See also the documentation for `StepperOptions`.
     * @param options The new stepper options.
     * @returns This instance.
     */
    public options(options: StepperOptions) {
        let separator = this._options.Separator;
        if (options.Separator !== undefined) {
            if (options.Separator === null) {
                this.ui.remove(separator?.removeClass("separator"));
                separator = undefined;
            } else {
                separator = options.Separator;
            }
        }
        this._options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Appearance: options.Appearance ?? this._options.Appearance ?? StepperAppearance.HORIZONTAL,
            HideButtons: options.HideButtons ?? this._options.HideButtons ?? false,
            Separator: separator,
            First: options.First ?? this._options.First ?? true,
            FirstTitle: options.FirstTitle ?? this._options.FirstTitle ?? "",
            PageBackward: options.PageBackward ?? this._options.PageBackward ?? true,
            // PageBackwardContinuous: options.PageBackwardContinuous ?? this._options.PageBackwardContinuous ?? false,
            PageBackwardTitle: options.PageBackwardTitle ?? this._options.PageBackwardTitle ?? "",
            Backward: options.Backward ?? this._options.Backward ?? true,
            // BackwardContinuous: options.BackwardContinuous ?? this._options.BackwardContinuous ?? true,
            BackwardTitle: options.BackwardTitle ?? this._options.BackwardTitle ?? "",
            Forward: options.Forward ?? this._options.Forward ?? true,
            // ForwardContinuous: options.ForwardContinuous ?? this._options.ForwardContinuous ?? true,
            ForwardTitle: options.ForwardTitle ?? this._options.ForwardTitle ?? "",
            PageForward: options.PageForward ?? this._options.PageForward ?? true,
            // PageForwardContinuous: options.PageForwardContinuous ?? this._options.PageForwardContinuous ?? false,
            PageForwardTitle: options.PageForwardTitle ?? this._options.PageForwardTitle ?? "",
            Last: options.Last ?? this._options.Last ?? true,
            LastTitle: options.LastTitle ?? this._options.LastTitle ?? ""
            /* eslint-enable */
        };
        const backwardButtons: Button[] = [];
        const forwardButtons: Button[] = [];
        !this._options.First || backwardButtons.push(this.btnFirst);
        this.btnFirst.Title = this._options.FirstTitle ?? null;
        !this._options.PageBackward || backwardButtons.push(this.btnPageBackward);
        // this.btnBackward.OnHeldDown = this.options.BackwardContinuous ? this.fncBackward : undefined;
        // this.btnBackward.OnHeldDownOptions = this.options.Continuous;
        this.btnPageBackward.Title = this._options.PageBackwardTitle ?? null;
        !this._options.Backward || backwardButtons.push(this.btnBackward);
        // this.btnPrevious.OnHeldDown = this.options.PreviousContinuous ? this.fncPrevious : undefined;
        // this.btnPrevious.OnHeldDownOptions = this.options.Continuous;
        this.btnBackward.Title = this._options.BackwardTitle ?? null;
        !this._options.Forward || forwardButtons.push(this.btnForward);
        // this.btnNext.OnHeldDown = this.options.NextContinuous ? this.fncNext : undefined;
        // this.btnNext.OnHeldDownOptions = this.options.Continuous;
        this.btnForward.Title = this._options.ForwardTitle ?? null;
        !this._options.PageForward || forwardButtons.push(this.btnPageForward);
        // this.btnForward.OnHeldDown = this.options.ForwardContinuous ? this.fncForward : undefined;
        // this.btnForward.OnHeldDownOptions = this.options.Continuous;
        this.btnPageForward.Title = this._options.PageForwardTitle ?? null;
        !this._options.Last || forwardButtons.push(this.btnLast);
        this.btnLast.Title = this._options.LastTitle ?? null;
        this.ui.remove()
            .append(...backwardButtons)
            .append(this._options.Separator?.addClass("separator"))
            .append(...forwardButtons);
        this
            .appearance(this._options.Appearance!)
            .updateButtons(this.steppable.Index, this.steppable.Count);
        return this;
    }

    /**
     * Get/set the appearance of the stepper.
     */
    public get Appearance(): StepperAppearance {
        return this._options.Appearance!;
    }
    /** @inheritdoc */
    public set Appearance(v: StepperAppearance) {
        this.appearance(v);
    }

    /**
     * Set the appearance of the stepper.
     * @param appearance The new appearance of the stepper.
     * @returns This instance.
     */
    public appearance(appearance: StepperAppearance): this {
        this._options.Appearance = appearance;
        this.ui.removeClass("horizontal", "horizontal-alt", "vertical", "vertical-alt");
        switch (appearance) {
            case StepperAppearance.HORIZONTAL_ALT:
                this.ui.addClass("horizontal-alt");
                break;
            case StepperAppearance.VERTICAL:
                this.ui.addClass("vertical");
                break;
            case StepperAppearance.VERTICAL_ALT:
                this.ui.addClass("vertical-alt");
                break;
            default:
                this.ui.addClass("horizontal");
        }
        return this;
    }

    /**
     * Get the current number of entries in the steppable object.
     */
    public get Count(): number {
        return this.steppable.Count;
    }

    /**
     * Get the number of elements of a 'page' in the steppable object.
     */
    public get PageSize(): number {
        return this.steppable.PageSize;
    }

    /**
     * Get/set current index of the steppable object.
     */
    public get Index(): number {
        return this.steppable.Index;
    }
    /** @inheritdoc */
    public set Index(v: number) {
        this.index(v);
    }

    /**
     * Sets the index/position in the steppable object to a new value.\
     * __Notes:__
     * - If the index/position does not differ from the current index, the setter of `Index` on the
     *   steppable object isn't called!
     * - If the index/position is lower than `0` or greater or equal to `Count` of the steppable
     *   object it will always be corrected be in the range of `0`...`Count - 1`.
     * @param index The index/position to step to in the steppable object.
     * @returns `true` if no event handler has canceled the `step` event and if the index/position
     * in the steppable object could be set to the required value, otherwise `false`. `false` is
     * also returned, if `Count` of the steppable object is `0`.
     */
    public index(index: number): boolean {
        return this.dispatch(new StepEvent(this, index))
            ? this.internalSetIndex(0)
            : false;
    }

    /**
     * Called internally by all functions that change the index in the steppable object.
     * @see {@link Stepper.index()}
     */
    /* eslint-disable-next-line jsdoc/require-jsdoc */
    protected internalSetIndex(index: number): boolean {
        const count = this.steppable.Count;
        const oldIndex = this.steppable.Index;
        if (count === 0) {
            return false;
        }
        const newIndex = index < 0
            ? 0
            : index >= count
                ? count - 1
                : Math.trunc(index);
        if (newIndex === oldIndex) {
            return true;
        }
        this.steppable.Index = newIndex;
        this.updateButtons(this.steppable.Index, this.steppable.Count);
        this.emit(new SteppedEvent(this, newIndex));
        return this.steppable.Index === newIndex;
    }

    /**
     * Get all buttons of the stepper. The returned array always contains _all_ buttons of the
     * stepper, regardless of whether they are displayed or not. The order of the buttons in the
     * array is also always the same: `First`, `PageBackward`, `Backward`, `Forward`, `PageForward`
     * and `Last`.
     */
    public get Buttons(): StepperButtons {
        return <StepperButtons>this.btns.slice();
    }

    /** @inheritdoc */
    public First(): boolean {
        return this.dispatch(new StepEvent(this, 0))
            ? this.internalSetIndex(0)
            : false;
    }

    /** @inheritdoc */
    public PageBackward(): boolean {
        const pageSize = Math.trunc(this.steppable.PageSize);
        if (pageSize === -1) {
            return false;
        }
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index - pageSize)))
            ? this.internalSetIndex(this.steppable.Index - pageSize)
            : false;
    }

    /** @inheritdoc */
    public Backward(): boolean {
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index - 1)))
            ? this.internalSetIndex(this.steppable.Index - 1)
            : false;
    }

    /** @inheritdoc */
    public Forward(): boolean {
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index + 1)))
            ? this.internalSetIndex(this.steppable.Index + 1)
            : false;
    }

    /** @inheritdoc */
    public PageForward(): boolean {
        const pageSize = Math.trunc(this.steppable.PageSize);
        if (pageSize === -1) {
            return false;
        }
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index + pageSize)))
            ? this.internalSetIndex(this.steppable.Index + pageSize)
            : false;
    }

    /** @inheritdoc */
    public Last(): boolean {
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Count - 1)))
            ? this.internalSetIndex(this.steppable.Count - 1)
            : false;
    }

    /**
     * Synchronizes the stepper with the steppable object. This function _must_ always be called by
     * the steppable object when the current index/position or the number of elements in it changes!
     * This is particularly necessary for changes to the index/position that were _not_ triggered by
     * this stepper instance (e.g. by navigating with the keyboard in a table).
     */
    public sync(): void {
        this.updateButtons(this.steppable.Index, this.steppable.Count);
    }

    /**
     * Checks and adjusts an index value against the limits of `this.steppable`.
     * @param index The index to be checked.
     * @returns An index in the range `0 >= index <= this.steppable.Count-1`.
     */
    protected adjustIndex(index: number): number {
        return Math.min(Math.max(index, 0), this.steppable.Count - 1);
    }

    /**
     * Create all stepper buttons.
     * @returns This instance.
     */
    protected createButtons(): this {
        this.btns = [
            this.btnFirst = new Button(), this.btnPageBackward = new Button(), this.btnBackward = new Button(),
            this.btnForward = new Button(), this.btnPageForward = new Button(), this.btnLast = new Button()
        ];
        const props: Array<[string, () => boolean]> = [
            ["first", this.fncFirst],
            ["page-backward", this.fncPageBackward],
            ["backward", this.fncBackward],
            ["forward", this.fncForward],
            ["page-forward", this.fncPageForward],
            ["last", this.fncLast]
        ];
        for (let i = 0; i < this.btns.length; i++) {
            this.btns[i]
                .addClass("stepper-button", props[i][0])
                .on("click", props[i][1]);
        }
        return this;
    }

    /**
     * Updates the buttons in the stepper to match the status of the steppable object.
     * @param index The current index of the steppable object.
     * @param count The current number of entries in the steppable object.
     */
    protected updateButtons(index: number, count: number): void {
        const isAtBegin = (count <= 0) || (index <= 0);
        const isAtEnd = (count <= 0) || (index >= count - 1);
        const cssHideAtBegin = this._options.HideButtons && isAtBegin ? "hidden" : "";
        const cssHideAtEnd = this._options.HideButtons && isAtEnd ? "hidden" : "";
        for (const btn of this.btns) {
            btn.removeClass("hidden");
        }
        this.btnFirst
            .disabled(isAtBegin)
            .addClass(cssHideAtBegin)
            .title(isAtBegin ? "" : this._options.FirstTitle || "");
        this.btnPageBackward
            .disabled(isAtBegin)
            .addClass(cssHideAtBegin)
            .title(isAtBegin ? "" : this._options.PageBackwardTitle || "");
        this.btnBackward
            .disabled(isAtBegin)
            .addClass(cssHideAtBegin)
            .title(isAtBegin ? "" : this._options.BackwardTitle || "");
        this.btnForward
            .disabled(isAtEnd)
            .addClass(cssHideAtEnd)
            .title(isAtEnd ? "" : this._options.ForwardTitle || "");
        this.btnPageForward
            .disabled(isAtEnd)
            .addClass(cssHideAtEnd)
            .title(isAtEnd ? "" : this._options.PageForwardTitle || "");
        this.btnLast
            .disabled(isAtEnd)
            .addClass(cssHideAtEnd)
            .title(isAtEnd ? "" : this._options.LastTitle || "");
    }

    /** @inheritdoc */
    protected override clearOwner(): this {
        // All buttons can be mounted or not, so remove and dispose of them manually.
        this.ui.remove();
        for (const btn of this.btns) {
            btn.dispose();
        }
        // Also remove and dispose a separator.
        this._options.Separator?.dispose();
        super.clearOwner();
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new Div();
        return this;
    }
}

/**
 * Factory for Stepper components.
 */
export class StepperFactory<T> extends ComponentFactory<Stepper> {
    /**
     * Create, set up and return Stepper component.
     * @param steppable An object that imüplements `ISteppable`.
     * @param options Options for the stepper.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Stepper component.
     */
    public stepper(steppable: ISteppable, options?: StepperOptions, data?: T): Stepper {
        return this.setupComponent(new Stepper(steppable, options), data);
    }
}

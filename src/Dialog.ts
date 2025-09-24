import { AChildren, ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, IElementComponent, INodeComponent, mixin } from "@vanilla-ts/core";
import { Div, Dialog as DOMDialog } from "@vanilla-ts/dom";


/**
 * All corners/edges that can be used to change the size of a dialog box. The values must be set as
 * a bit mask on {@link DialogOptions.Resizable} in the dialog options.
 */
export enum DlgResizable {
    NONE = 0,
    N = 1,
    NE = 2,
    E = 4,
    SE = 8,
    S = 16,
    SW = 32,
    W = 64,
    NW = 128
}

/**
 * Bit mask for {@link DialogOptions.Resizable} in the dialog options that allows resizing the
 * dialog on _all_ corners/edges.
 */
export const DLG_RESIZABLE_ALL =
    DlgResizable.N |
    DlgResizable.NE |
    DlgResizable.E |
    DlgResizable.SE |
    DlgResizable.S |
    DlgResizable.SW |
    DlgResizable.W |
    DlgResizable.NW;

/**
 * Bit mask for {@link DialogOptions.Resizable} in the dialog options that allows resizing the
 * dialog only on the right and bottom side and on the bottom right corner.
 */
export const DLG_RESIZABLE_EAST_SOUTH =
    DlgResizable.E |
    DlgResizable.SE |
    DlgResizable.S;

/**
 * `Dialog` options. The options are used to initialze the dialog _and_ they can be used to
 * completely re-configure an existing instance of a dialog. All option properties are optional, a
 * missing property will be replaced by its default value (using `new Dialog(options, ...)`) or by
 * the value already existing in the dialogs options (when reconfiguring a dialog instance).
 */
export type DialogOptions = {
    /**
     * The left/top dialog position with regard to the viewport (in pixels). This is done by setting
     * the `translate` CSS property on the dialog element.\
     * Default: `{ x: 0, y: 0 }`.
     */
    Position?: DOMPoint;
    /**
     * `true` if the dialog is to be centered horizontally with regard to the viewport, otherwise
     * `false`. If `Position` is also given, `Position.x` is added as an _offset_ to the calculated
     * value of the horizontally centered position.\
     * Default: `true`.
     */
    HCentered?: boolean;
    /**
     * `true` if the dialog is to be centered vertically with regard to the viewport, otherwise
     * `false`. If `Position` is also given, `Position.y` is added as an _offset_ to the calculated
     * value of the vertically centered position.\
     * Default: `true`.
     */
    VCentered?: boolean;
    /**
     * If `true`, the dialog is cancelled (and closed) when the `Esc` key is pressed. With `false`
     * the dialog must be cancelled/closed by other means (e.g. a button action or by calling
     * `dlg.close()`/`dlg.cancel()` elsewhere).\
     * Default: `true`.
     */
    CloseWithEscape?: boolean;
    /**
     * If `true`, the dialog can be moved by the user by holding down and moving the pointer on (an
     * element inside) the dialog. When set to `false`, the dialog remains fixed in the position
     * configured with `HCentered`, `VCentered` and `Position` and cannot be moved interactively.\
     * Default: `false`.
     * @see {@link DialogOptions.MoveHandle}
     */
    Movable?: boolean;
    /**
     * The component that acts as the drag handle for moving the dialog (typically a title bar). If
     * not set (and {@link DialogOptions.Movable} is `true`), the default handle is the dialog's
     * inner content container. This container contains all child components of the dialog, but it
     * isn't directly accessible as a property of the dialog.\
     * __Notes:__
     * - If `MoveHandle` _is not included_ in the options object, the move handle component is the
     *   previous move handle component that was set via the constructor or by setting new options.
     * - If `MoveHandle` _is included_ in the options object with the value `undefined`, the move
     *   handle component is the inner content container. So actively setting `MoveHandle` to
     *   `undefined` is the only way to switch the move handle to the inner content container from
     *   another component.
     * - If `MoveHandle` is the inner content container, the `pointerdown` event will be handled
     *   _only for the inner content container itself_ but not for any children that may have
     *   received the `pointerdown` event first (`event.target === MoveHandle.DOM`).
     * - If `MoveHandle` is a component, the `pointerdown` event will be handled for the given
     *   component _and all of it's children_ (`MoveHandle.DOM.contains(event.target) === true`)!
     * - If `MoveHandle` is not a child of the dialog, the behavior is undefined.
     *
     * Default: The dialog's inner content container.
     */
    MoveHandle?: IElementComponent<HTMLElement>;
    /**
     * If `Resizable` is given and is unequal to `Resizable.NONE` the dialog can be resized. The
     * value must be set as a bit mask of values of `Resizable`.
     * @see {@link DlgResizable} for possible values.\
     * Default: `Resizable.NONE`.
     */
    Resizable?: number;
    /**
     * If `true`, the focus remains within the dialog when pressing the `Tab` and `Shift-Tab` keys,
     * so, for example, if `Tab` is pressed when the last focusable element is focused, the focus
     * will move to the first focusable element in the dialog and not to another element on the page
     * or to the browser itself.\
     * Default: `true`.
     */
    LockFocusCycleInside?: boolean;
    /**
     * The `Dialog` component changes the Z-order of currently open non-modal dialogs automatically
     * if one of those dialogs receives focus by setting the CSS property `z-index` accordingly (the
     * focused dialog will be made the topmost dialog). The value of `BaseZIndex` is the minimum
     * base value which is used to set the `z-index` values on the open non-modal dialogs.\
     * __Note:__ If multiple dialogs are created, each with its own `BaseZIndex` value, the
     * following applies (`BaseZIndex` sets a static property on `Dialog`):
     * - The `BaseZIndex` option value of the _last_ dialog instance created is used as the new base
     *   value for all non modal dialogs.
     * - If an instance of a dialog is reconfigured with an explicitly set value for `BaseZIndex`,
     *   this value is used as the new base value for all non modal dialogs.
     *
     * Default: `1000` (values lower than `0` are set to `0`).
     */
    BaseZIndex?: number;
};

/**
 * State of a dialog.
 */
export enum DialogState {
    /** The dialog is not showing (closed). */
    CLOSED = 0,
    /** The dialog is shown non-modally. */
    NON_MODAL = 1,
    /** The dialog is shown modally. */
    MODAL = 2
}

/** Custom 'dlg-show' event for dialogs. */
export class DialogShowEvent extends ACustomComponentEvent<"dlg-show", Dialog, {
    /** `true` if the dialog is about to be displayed modal, otherwise false. */
    Modal: boolean;
}> {
    /**
     * Create dialog show event. Event handlers can prevent showing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param modal `true` if the dialog is about to be displayed modal, otherwise false.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, modal: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-show", sender, { Modal: modal }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-shown' event for dialogs. */
export class DialogShownEvent extends ACustomComponentEvent<"dlg-shown", Dialog, {
    /** `true` if the dialog is shown modal, otherwise false. */
    Modal: boolean;
}> {
    /**
     * Create dialog shown event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param modal `true` if the dialog is shown modal, otherwise false.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, modal: boolean, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("dlg-shown", sender, { Modal: modal }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-close' event for dialogs. */
export class DialogCloseEvent extends ACustomComponentEvent<"dlg-close", Dialog, {
    /**
     * The return value with which the dialog is to be closed/cancelled.\
     * __Note:__ The `ReturnValue` property of the events `detail` property is either
     * - the current `ReturnValue` property of the dialog,
     * - the return value which has been set through calling `close(someValue)` (if any)
     * - or `DLG_CANCELLED`, if the dialog is to be cancelled (then `Cancel` is also `true`).
     */
    ReturnValue: string;
    /**
     * `true`, if the dialog was cancelled instead of closed regularly, otherwise `false`. If
     * `Cancel` is `true`, `ReturnValue` is always `DLG_CANCELLED`.
     */
    Cancel: boolean;
}> {
    /**
     * Create dialog close event. Event handlers can prevent closing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param returnValue The return value with which the dialog is to be closed/cancelled.\
     * __Note:__ The `ReturnValue` property of the events `detail` property is either
     * - the current `ReturnValue` property of the dialog,
     * - the return value which has been set through calling `close(someReturnValue)` (if any)
     * - or `DLG_CANCELLED`, if the dialog is to be cancelled (then `Cancel` is also `true`).
     * @param cancel `true`, if the dialog was cancelled instead of closed regularly, otherwise
     * `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, returnValue: string, cancel: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-close", sender, { ReturnValue: cancel ? DLG_CANCELLED : returnValue, Cancel: cancel }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `Dialog`. */
export interface DialogEventMap extends HTMLElementEventMap {
    /**
     * A dialog is to be shown. Event handlers can prevent showing the dialog by calling
     * `preventDefault()`.
     */
    "dlg-show": DialogShowEvent;
    /**
     * This event is emitted, when the `show()` or `showModal()` functions of a dialog have been
     * executed. This event is purely informative and can't be cancelled.
     */
    "dlg-shown": DialogShowEvent;
    /**
     * A dialog is to be closed. Event handlers can prevent closing the dialog by calling
     * `preventDefault()`.
     */
    "dlg-close": DialogCloseEvent;
}

/**
 * Special return value of dialogs in the case where the internal `Dialog` DOM element is closed
 * bypassing the regular `close()`/`forceClose()` functions. This should never happen, except the
 * browser has a bug or the component is misused by accessing protected properties.\
 * __Note:__ Do _not_ use this constant as a regular return value for dialogs!
 */
export const DLG_IRREGULAR_CLOSE = "__DLG_IRREGULAR_CLOSE__";

/**
 * Default return value of dialogs which have been cancelled using `cancel()`/`forceCancel()`.\
 * __Note:__ Do _not_ use this constant as a regular return value for dialogs!
 */
export const DLG_CANCELLED = "__DLG_CANCELLED__";

/**
 * Dialog component for displaying modal and non-modal dialogs.
 */
export class Dialog<EventMap extends DialogEventMap = DialogEventMap> extends AElementComponentWithInternalUI<DOMDialog, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    protected static nonModals: Array<Dialog> = [];
    protected static modals: Array<Dialog> = [];
    protected static baseZIndex: number;
    protected dlg: DOMDialog;
    protected _options: DialogOptions = {};
    protected modalResolver: (value?: unknown) => void;
    protected state: DialogState = DialogState.CLOSED;
    protected contentContainer: Div;
    protected focusableElementsSelector = "button:not([tabindex='-1']), [href], input:not([tabindex='-1']), select:not([tabindex='-1']), textarea:not([tabindex='-1']), details:not([tabindex='-1']), [tabindex]:not([tabindex='-1'])";
    protected closedRegularly: boolean;
    protected moving = false;
    protected pointerDownStart = new DOMPoint(0, 0);
    protected moveStartPositionOffset = new DOMPoint(0, 0);
    protected fncOnPointerDown = this.onPointerDown.bind(this);
    protected fncOnPointerMove = this.onPointerMove.bind(this);
    protected fncOnPointerUp = this.onPointerUp.bind(this);
    protected resizing = false;
    protected resizers: HTMLDivElement[] = [];
    protected rsN: HTMLDivElement;
    protected rsNE: HTMLDivElement;
    protected rsE: HTMLDivElement;
    protected rsSE: HTMLDivElement;
    protected rsS: HTMLDivElement;
    protected rsSW: HTMLDivElement;
    protected rsW: HTMLDivElement;
    protected rsNW: HTMLDivElement;
    protected fncOnResizerPointerDown = this.onResizerPointerDown.bind(this);
    protected fncOnResizerPointerMove = this.onResizerPointerMove.bind(this);
    protected fncOnResizerPointerUp = this.onResizerPointerUp.bind(this);
    protected resizer?: HTMLDivElement;
    protected resizeStart = new DOMRect();
    protected minSize = new DOMPoint();

    /**
     * Create dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()` or insert()) since this can cause
     * problems when centering or positioning the dialog relative to the viewport. If an instance of
     * `Dialog` is not mounted in another component, it is automatically added to `document.body` as
     * a child element in `show()`/`showModal()` and removed again in `close()`.
     * @param options Options for the dialog.
     * @param components The initial components that make up the content of this dialog.\
     * __Important note:__ If a dialog is disposed of (using `dispose()`), _all_ components given
     * in the constructor that are still children of this dialog (`Dialog` implements `IChildren`)
     * are also disposed of! If these components are to be used elsewhere after the dialog has been
     * disposed of, they must be extracted or removed using `dlg.extract(...)` or `dlg.remove()`
     * before the dialog is disposed of!
     */
    constructor(options?: DialogOptions, ...components: INodeComponent<Node>[]) {
        super();
        super
            .initialize()
            .options(options ?? {})
            .append(...components);
    }

    /**
     * Get/set the options for this dialog. The getter returns a _copy_ of the options.\
     * __Note:__ If the dialog is currently moved, setting `Options` does nothing.
     */
    public get Options(): DialogOptions {
        return { ...this._options };
    }
    /** @inheritdoc */
    public set Options(v: DialogOptions) {
        this.options(v);
    }

    /**
     * Set the options for this dialog. See also the documentation for `DialogOptions`.\
     * __Note:__ If the dialog is currently moved, `options()` does nothing.
     * @param options The new dialog options.
     * @returns This instance.
     */
    public options(options: DialogOptions): this {
        if (this.moving) {
            return this;
        }
        this._options.MoveHandle?.off("pointerup", this.fncOnPointerUp).off("pointerdown", this.fncOnPointerDown).removeClass("move-handle", "custom-move-handle");
        const moveHandle = (Object.hasOwn(options, "MoveHandle") && options.MoveHandle === undefined)
            ? this.contentContainer
            : options.MoveHandle;
        this.removeClass("h-centered", "v-centered", "movable");
        this._options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Position: options.Position ? DOMPoint.fromPoint(options.Position) : this._options.Position ? DOMPoint.fromPoint(this._options.Position) : new DOMPoint(0, 0),
            HCentered: options.HCentered ?? this._options.HCentered ?? true,
            VCentered: options.VCentered ?? this._options.VCentered ?? true,
            CloseWithEscape: options.CloseWithEscape ?? this._options.CloseWithEscape ?? true,
            Movable: options.Movable ?? this._options.Movable ?? false,
            MoveHandle: moveHandle ?? this._options.MoveHandle ?? this.contentContainer,
            Resizable: options.Resizable ?? this._options.Resizable ?? DlgResizable.NONE,
            LockFocusCycleInside: options.LockFocusCycleInside ?? this._options.LockFocusCycleInside ?? true,
            BaseZIndex: Math.max(options.BaseZIndex ?? Dialog.baseZIndex ?? 1000, 0),
            /* eslint-enable */
        };
        this._options.HCentered && this.addClass("h-centered");
        this._options.VCentered && this.addClass("v-centered");
        this.setPosition(this._options.HCentered!, this._options.VCentered!, this._options.Position!);
        if (this._options.Movable) {
            this.addClass("movable");
            this._options.MoveHandle?.on("pointerdown", this.fncOnPointerDown).on("pointerup", this.fncOnPointerUp);
            this._options.MoveHandle === this.contentContainer
                ? this._options.MoveHandle.addClass("move-handle")
                : this._options.MoveHandle!.addClass("custom-move-handle");
        }
        const resizable = [DlgResizable.N, DlgResizable.NE, DlgResizable.E, DlgResizable.SE, DlgResizable.S, DlgResizable.SW, DlgResizable.W, DlgResizable.NW];
        for (let i = 0; i < this.resizers.length; i++) {
            ((this._options.Resizable! & resizable[i]) === resizable[i]) // eslint-disable-line @typescript-eslint/no-unsafe-enum-comparison
                ? this.ui.DOM.appendChild(this.resizers[i])
                : this.resizers[i].remove();
        }
        Dialog.baseZIndex = this._options.BaseZIndex!;
        this.setZIndexes();
        return this;
    }

    /**
     * Get the state of this dialog.
     */
    public get State(): DialogState {
        return this.state;
    }

    /**
     * Get an array with all existing _open_ non-modal dialog instances.
     */
    public get NonModals(): Array<Dialog> {
        return Dialog.nonModals.slice(0);
    }

    /**
     * Get an array with all existing _open_ modal dialog instances.
     */
    public get Modals(): Array<Dialog> {
        return Dialog.modals.slice(0);
    }

    /**
     * Get/set the `ReturnValue` property of the dialog (the `returnValue` of the internal DOM
     * dialog element).
     */
    public get ReturnValue(): string {
        return this.dlg.ReturnValue;
    }
    /** @inheritdoc */
    public set ReturnValue(v: string) {
        this.dlg.ReturnValue = v;
    }

    /**
     * Set the `returnValue` property of the dialog (the `returnValue` of the internal DOM dialog
     * element).
     * @param v The value to be set.
     * @returns This instance.
     */
    public returnValue(v: string): this {
        this.dlg.ReturnValue = v;
        return this;
    }

    /**
     * Get the current position of the dialog with regard to the viewport (in pixels). This value is
     * only useful if the dialog is shown (`<dlg>.State !== DialogState.CLOSED`).
     */
    public get Position(): DOMPoint {
        const pos = this.DOM.getBoundingClientRect();
        return new DOMPoint(pos.left, pos.top);
    }

    /**
     * Closes the dialog. `dlg-close` event handlers may prevent closing the dialog.
     * @param returnValue An overridden/individual value for the `ReturnValue` of the dialog. This does
     * _not_ change the _current_ value of `ReturnValue` on this instance!
     * @returns This instance.
     */
    public close(returnValue?: string): this {
        return this.dispatch(new DialogCloseEvent(this, returnValue ?? this.ReturnValue, false))
            ? this.doClose(returnValue)
            : this;
    }

    /**
     * Forcibly closes the dialog. `dlg-close` event handlers _cannot_ prevent closing the dialog.
     * @param returnValue An updated value for the `ReturnValue` of the dialog.
     * @returns This instance.
     */
    public forceClose(returnValue?: string): this {
        return this.doClose(returnValue);
    }

    /**
     * Cancels (and closes) the dialog. `dlg-close` event handlers may prevent canceling the dialog.
     * The `ReturnValue` of the dialog is set to `DLG_CANCELLED`.
     * @returns This instance.
     */
    public cancel(): this {
        return this.dispatch(new DialogCloseEvent(this, DLG_CANCELLED, true))
            ? this.doClose(DLG_CANCELLED)
            : this;
    }

    /**
     * Forcibly cancels (and closes) the dialog. `dlg-close` event handlers _cannot_ prevent
     * canceling the dialog. The `ReturnValue` of the dialog is set to `DLG_CANCELLED`.
     * @returns This instance.
     */
    public forceCancel(): this {
        return this.doClose(DLG_CANCELLED);
    }

    /**
     * Displays the dialog (non-modal) and adds the class name `non-modal` to the dialog. `dlg-show`
     * event handlers may prevent showing the dialog.
     * @throws `InvalidStateError` (if the dialog is already open and modal).
     * @returns This instance.
     */
    public show(): this {
        return this.dispatch(new DialogShowEvent(this, false))
            ? this.doShow()
            : this;
    }

    /**
     * Forcibly displays the dialog (non-modal) and adds the class name `non-modal` to the dialog.
     * `dlg-show` event handlers _cannot_ prevent showing the dialog.
     * @throws `InvalidStateError` (if the dialog is already open and modal).
     * @returns This instance.
     */
    public forceShow(): this {
        return this.doShow();
    }

    /**
     * Displays the dialog (modal) and adds the class name `modal` to the dialog. If this is the
     * first modal dialog instance currently open, the class name `modal-dialog-first` is added to
     * the dialog. `dlg-show` event handlers may prevent showing the dialog.
     * @throws `InvalidStateError` (if the dialog is already open and non-modal).
     * @returns This instance.
     */
    public async showModal(): Promise<this> {
        return this.dispatch(new DialogShowEvent(this, true))
            ? await this.doShowModal()
            : this;
    }

    /**
     * Forcibly displays the dialog (modal) and adds the class name `modal` to the dialog. If this
     * is the first modal dialog instance currently open, the class name `modal-dialog-first` is
     * added to the dialog. `dlg-show` event handlers _cannot_ prevent showing the dialog.
     * @throws `InvalidStateError` (if the dialog is already open and non-modal).
     * @returns This instance.
     */
    public async forceShowModal(): Promise<this> {
        return await this.doShowModal();
    }

    /**
     * Closes the dialog.
     * @param returnValue An updated value for the `ReturnValue` of the dialog.
     * @returns This instance.
     */
    protected doClose(returnValue?: string): this {
        this.closedRegularly = true;
        this.ui.close(returnValue);
        if (this.state === DialogState.MODAL) {
            for (const dlg of Dialog.modals) {
                dlg.removeClass("modal-dialog-first");
            }
            const index = Dialog.modals.indexOf(this);
            (index !== -1) && Dialog.modals.splice(index, 1);
            Dialog.modals[0]?.addClass("modal-dialog-first");
            this.modalResolver?.();
        } else if (this.state === DialogState.NON_MODAL) {
            const index = Dialog.nonModals.indexOf(this);
            (index !== -1) && Dialog.nonModals.splice(index, 1);
            this.style("zIndex", null);
            this.setZIndexes();
        }
        if (!this.Parent) {
            this.DOM.remove();
        }
        this.state = DialogState.CLOSED;
        return this;
    }

    /**
     * Displays the dialog (non-modal) and adds the class name `non-modal` to the dialog.
     * @throws `InvalidStateError` (if the dialog is already open and modal).
     * @returns This instance.
     */
    protected doShow(): this {
        if (!this.Parent) {
            document.body.appendChild(this.DOM);
        }
        this.addClass("non-modal");
        this.ui.show();
        this.closedRegularly = false;
        this.state = DialogState.NON_MODAL;
        Dialog.nonModals.indexOf(this) === -1 && Dialog.nonModals.push(this);
        this.makeTopMost();
        this.emit(new DialogShownEvent(this, false));
        return this;
    }

    /**
     * Displays the dialog (modal) and adds the class name `modal` to the dialog. If this is the
     * first modal dialog instance currently open, the class name `modal-dialog-first` is added to
     * the dialog.
     * @throws `InvalidStateError` (if the dialog is already open and non-modal).
     * @returns This instance.
     */
    protected async doShowModal(): Promise<this> {
        if (!this.Parent) {
            document.body.appendChild(this.DOM);
        }
        this.addClass("modal");
        this.ui.showModal();
        this.closedRegularly = false;
        this.state = DialogState.MODAL;
        const index = Dialog.modals.indexOf(this);
        index === -1
            ? Dialog.modals.push(this)
            : Dialog.modals.push(Dialog.modals.splice(index, 1)[0]);
        for (const dlg of Dialog.modals) {
            dlg.removeClass("modal-dialog-first");
        }
        Dialog.modals[0]?.addClass("modal-dialog-first");
        this.emit(new DialogShownEvent(this, true));
        await new Promise(resolve => this.modalResolver = resolve);
        return this;
    }

    /**
     * Set the position of the dialog.
     * @param hCentered `true`, if the dialog is to be centered horizontally with regard to the
     * viewport, otherwise `false`.
     * @param vCentered `true`, if the dialog is to be centered vertically with regard to the
     * viewport, otherwise `false`.
     * @param offset The left/top dialog offset (in pixels) with regard to the position that is the
     * result of applying `hCentered` and `vCentered`.
     * @returns This instance.
     */
    protected setPosition(hCentered: boolean, vCentered: boolean, offset: DOMPoint): this {
        if (hCentered && vCentered) {
            this.style("left", "50%");
            this.style("top", "50%");
            this.style("translate", `calc(-50% + ${offset.x}px) calc(-50% + ${offset.y}px)`);
        } else if (hCentered) {
            this.style("left", "50%");
            this.style("top", `${offset.y}px`);
            this.style("translate", `calc(-50% + ${offset.x}px) 0`);
        } else if (vCentered) {
            this.style("left", `${offset.x}px`);
            this.style("top", "50%");
            this.style("translate", `0 calc(-50% + ${offset.y}px)`);
        } else {
            this.style("left", "0");
            this.style("top", "0");
            this.style("translate", `${offset.x}px ${offset.y}px`);
        }
        return this;
    }

    /**
     * Make the dialog the topmost dialog.
     * @param _ev The `focus` event.
     */
    protected makeTopMost(_ev?: FocusEvent): void {
        if (this.state === DialogState.NON_MODAL) {
            const index = Dialog.nonModals.indexOf(this);
            index !== -1 && Dialog.nonModals.push(Dialog.nonModals.splice(index, 1)[0]);
            this.setZIndexes();
        }
    }

    /**
     * Changes the (CSS) Z-order of non-modal dialogs in ascending order. The dialog with the
     * highest Z-order becomes the topmost dialog.
     */
    protected setZIndexes(): void {
        let zIndex = Dialog.baseZIndex;
        for (const dlg of Dialog.nonModals) {
            // Just in case ...
            dlg.removeClass("modal-dialog-first");
            dlg.style("zIndex", (++zIndex).toString());
        }
    }

    /**
     * Keyboard handling for the dialog.
     * @param ev The keyboard event.
     */
    protected onKeyDown(ev: KeyboardEvent): void {
        switch (ev.key) {
            // case "Enter":
            //     break;
            case "Escape":
                ev.preventDefault();
                ev.stopImmediatePropagation();
                if (this._options.CloseWithEscape) {
                    this.cancel();
                }
                break;
            case "Tab":
                if (this._options.LockFocusCycleInside && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
                    const focusableElements = this.dlg.DOM.querySelectorAll(this.focusableElementsSelector);
                    const firstFocusableElement = <HTMLElement>focusableElements[0];
                    const lastFocusableElement = <HTMLElement>focusableElements[focusableElements.length - 1];
                    if (ev.shiftKey) {
                        if (!firstFocusableElement || ev.target === firstFocusableElement) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            lastFocusableElement?.focus?.();
                        }
                    } else {
                        if (!lastFocusableElement || ev.target === lastFocusableElement) {
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
    }

    /**
     * Handle the `pointerdown` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    protected onPointerDown(ev: PointerEvent): void {
        if (
            (!this.moving && ev.target instanceof HTMLElement)
            && (
                (this._options.MoveHandle === this.contentContainer && ev.target === this._options.MoveHandle?.DOM)
                || (this._options.MoveHandle !== this.contentContainer && this._options.MoveHandle!.DOM.contains(ev.target))
            )
        ) {
            this.pointerDownStart.x = ev.clientX;
            this.pointerDownStart.y = ev.clientY;
            this.moveStartPositionOffset.x = this._options.Position!.x;
            this.moveStartPositionOffset.y = this._options.Position!.y;
            this._options.MoveHandle!.DOM.setPointerCapture(ev.pointerId);
            this._options.MoveHandle!.on("pointermove", this.fncOnPointerMove);
            this.addClass("move-start");
            this.moving = true;
        }
    }

    /**
     * Handle the `pointermove` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    protected onPointerMove(ev: PointerEvent): void {
        if (this.moving) {
            this._options.Position = new DOMPoint(ev.clientX - this.pointerDownStart.x + this.moveStartPositionOffset.x, ev.clientY - this.pointerDownStart.y + this.moveStartPositionOffset.y);
            this.removeClass("move-start").addClass("moving");
            this.setPosition(this._options.HCentered!, this._options.VCentered!, this._options.Position);
        }
    }

    /**
     * Handle the `pointerup` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    protected onPointerUp(ev: PointerEvent): void {
        if (this.moving) {
            this.moving = false;
            this._options.MoveHandle?.DOM.releasePointerCapture(ev.pointerId);
            this._options.MoveHandle?.off("pointermove", this.fncOnPointerMove);
            this.removeClass("move-start", "moving");
        }
    }

    /**
     * Handle the `pointerdown` event on a resizer element.
     * @param ev The pointer event.
     */
    protected onResizerPointerDown(ev: PointerEvent): void {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (!this.resizing && ev.target instanceof HTMLDivElement) {
            this.resizer = ev.target;
            this.resizer.setPointerCapture(ev.pointerId);
            this.resizer.addEventListener("pointermove", this.fncOnResizerPointerMove);
            this.pointerDownStart.x = ev.clientX;
            this.pointerDownStart.y = ev.clientY;
            this.resizeStart.x = this._options.Position!.x;
            this.resizeStart.y = this._options.Position!.y;
            const rect = this.DOM.getBoundingClientRect();
            this.resizeStart.width = rect.width;
            this.resizeStart.height = rect.height;
            this.addClass("resize-start");
            this.resizing = true;
            const gcs = getComputedStyle(this.DOM);
            this.minSize.x = parseFloat(gcs.minWidth.slice(0, -2)) || 0;
            this.minSize.y = parseFloat(gcs.minHeight.slice(0, -2)) || 0;
        }
    }

    /**
     * Handle the `pointermove` event on a resizer element.
     * @param ev The pointer event.
     */
    protected onResizerPointerMove(ev: PointerEvent): void {
        const offset = new DOMPoint(ev.clientX - this.pointerDownStart.x, ev.clientY - this.pointerDownStart.y);
        let width: number | undefined = undefined;
        let height: number | undefined = undefined;
        const rss = this.resizeStart;
        const minSize = this.minSize;
        // - Return early if moving an edge violates the `minSize` constraint.
        // - For the edges the offset has to be adjusted.
        switch (this.resizer) {
            case this.rsN:
                height = rss.height - offset.y;
                if (rss.height - offset.y < minSize.y) {
                    return;
                }
                break;
            case this.rsNE:
                width = rss.width + offset.x;
                if (rss.width + offset.x < minSize.x) {
                    offset.x = -(rss.width - minSize.x);
                }
                height = rss.height - offset.y;
                if (rss.height - offset.y < minSize.y) {
                    offset.y = (rss.height - minSize.y);
                }
                break;
            case this.rsE:
                width = rss.width + offset.x;
                if (rss.width + offset.x < minSize.x) {
                    return;
                }
                break;
            case this.rsSE:
                width = rss.width + offset.x;
                if (rss.width + offset.x < minSize.x) {
                    offset.x = -(rss.width - minSize.x);
                }
                height = rss.height + offset.y;
                if (rss.height + offset.y < minSize.y) {
                    offset.y = -(rss.height - minSize.y);
                }
                break;
            case this.rsS:
                height = rss.height + offset.y;
                if (rss.height + offset.y < minSize.y) {
                    return;
                }
                break;
            case this.rsSW:
                width = rss.width - offset.x;
                if (rss.width - offset.x < minSize.x) {
                    offset.x = (rss.width - minSize.x);
                }
                height = rss.height + offset.y;
                if (rss.height + offset.y < minSize.y) {
                    offset.y = -(rss.height - minSize.y);
                }
                break;
            case this.rsW:
                width = rss.width - offset.x;
                if (rss.width - offset.x < minSize.x) {
                    return;
                }
                break;
            case this.rsNW:
                width = rss.width - offset.x;
                if (rss.width - offset.x < minSize.x) {
                    offset.x = (rss.width - minSize.x);
                }
                height = rss.height - offset.y;
                if (rss.height - offset.y < minSize.y) {
                    offset.y = (rss.height - minSize.y);
                }
                break;
            default:
                return;
        }
        ev.preventDefault();
        ev.stopImmediatePropagation();
        this.removeClass("resize-start").addClass("resizing", "resized");
        const resizer = this.resizer;
        const pos = this._options.Position!;
        if (this._options.HCentered && this._options.VCentered) {
            if (resizer === this.rsN || resizer === this.rsS) {
                pos.y = rss.y + (offset.y / 2);
            } else if (resizer === this.rsE || resizer === this.rsW) {
                pos.x = rss.x + (offset.x / 2);
            } else {
                pos.x = rss.x + (offset.x / 2);
                pos.y = rss.y + (offset.y / 2);
            }
        } else if (this._options.HCentered) {
            if (resizer === this.rsN) {
                pos.y = rss.y + offset.y;
            } else if (resizer === this.rsNE || resizer === this.rsNW) {
                pos.x = rss.x + (offset.x / 2);
                pos.y = rss.y + offset.y;
            } else if (resizer === this.rsE || resizer === this.rsSE || resizer === this.rsSW || resizer === this.rsW) {
                pos.x = rss.x + (offset.x / 2);
            } else if (resizer === this.rsS) {
                // pos.x = rss.x;
                // pos.y = rss.y;
            }
        } else if (this._options.VCentered) {
            if (resizer === this.rsN || resizer === this.rsNE || resizer === this.rsSE || resizer === this.rsS) {
                pos.y = rss.y + (offset.y / 2);
            } else if (resizer === this.rsE) {
                // pos.x = rss.x;
                // pos.y = rss.y;
            } else if ((resizer === this.rsSW || resizer === this.rsNW)) {
                pos.x = rss.x + offset.x;
                pos.y = rss.y + (offset.y / 2);
            } else if (resizer === this.rsW) {
                pos.x = rss.x + offset.x;
            }
        } else {
            if (resizer === this.rsN || resizer === this.rsNE) {
                pos.y = rss.y + offset.y;
            } else if (resizer === this.rsE) {
                // pos.x = rss.x;
            } else if (resizer === this.rsSE) {
                // pos.x = rss.x;
                // pos.y = rss.y;
            } else if (resizer === this.rsS) {
                // pos.y = rss.y;
            } else if (resizer === this.rsSW || resizer === this.rsW) {
                pos.x = rss.x + offset.x;
            } else if (resizer === this.rsNW) {
                pos.x = rss.x + offset.x;
                pos.y = rss.y + offset.y;
            }
        }
        this.setPosition(this._options.HCentered!, this._options.VCentered!, pos);
        width !== undefined && this.style("width", `${Math.max(minSize.x, width)}px`);
        height !== undefined && this.style("height", `${Math.max(minSize.y, height)}px`);
    }

    /**
     * Handle the `pointerup` event on a resizer element.
     * @param ev The pointer event.
     */
    protected onResizerPointerUp(ev: PointerEvent): void {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (this.resizing) {
            this.resizing = false;
            this.resizer?.releasePointerCapture(ev.pointerId);
            this.resizer?.removeEventListener("pointermove", this.fncOnResizerPointerMove);
            this.resizer = undefined;
            this.removeClass("resize-start", "resizing");
        }
    }

    /** @inheritdoc */
    protected override clearOwner(): this {
        for (const resizer of this.resizers) {
            resizer.remove();
            resizer.removeEventListener("pointerdown", this.fncOnResizerPointerDown);
            resizer.removeEventListener("pointerup", this.fncOnResizerPointerUp);
        }
        super.clearOwner();
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = this.dlg = new DOMDialog()
            .append(
                this.contentContainer = new Div()
                    .addClass("content")
            )
            .on("keydown", this.onKeyDown.bind(this))
            .on("focusin", this.makeTopMost.bind(this))
            /**
             * This handles the case where the internal `Dialog` DOM element is closed bypassing the
             * regular `close()` function of this instance. This would leave some properties in an
             * incorrect state and might not remove the DOM from its parent. The manual call of
             * `doClose()` fixes this.
             */
            .on("close", () => {
                this.closedRegularly || this.doClose(DLG_IRREGULAR_CLOSE);
            });
        this.resizers.push(
            this.rsN = document.createElement("div"),
            this.rsNE = document.createElement("div"),
            this.rsE = document.createElement("div"),
            this.rsSE = document.createElement("div"),
            this.rsS = document.createElement("div"),
            this.rsSW = document.createElement("div"),
            this.rsW = document.createElement("div"),
            this.rsNW = document.createElement("div")
        );
        const suffixes = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
        for (let i = 0; i < this.resizers.length; i++) {
            this.resizers[i].classList.add(`rs-${suffixes[i]}`);
            this.resizers[i].addEventListener("pointerdown", this.fncOnResizerPointerDown);
            this.resizers[i].addEventListener("pointerup", this.fncOnResizerPointerUp);
        }
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, Dialog, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface Dialog<EventMap extends DialogEventMap = DialogEventMap> extends AElementComponentWithInternalUI<DOMDialog, EventMap>, AChildren<HTMLElement, EventMap> { } // eslint-disable-line jsdoc/require-jsdoc

/**
 * Factory for `Dialog` components.
 */
export class DialogFactory<T> extends ComponentFactory<Dialog> {
    /**
     * Create, set up and return Dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()` or insert()) since this can cause
     * problems when centering or positioning the dialog relative to the viewport. If an instance of
     * `Dialog` is not mounted in another component, it is automatically added to `document.body` as
     * a child element in `show()`/`showModal()` and removed again in `close()`.
     * @param options Options for the dialog.
     * @param components The initial components that make up the content of this dialog.\
     * __Important note:__ If a dialog is disposed of (using `dispose()`), _all_ components given
     * in the constructor that are still children of this dialog (`Dialog` implements `IChildren`)
     * are also disposed of! If these components are to be used elsewhere after the dialog has been
     * disposed of, they must be extracted or removed using `dlg.extract(...)` or `dlg.remove()`
     * before the dialog is disposed of!
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Dialog component.
     */
    public dialog(options: DialogOptions | undefined = undefined, components: INodeComponent<Node>[] = [], data?: T): Dialog {
        return this.setupComponent(new Dialog(options, ...components), data);
    }
}

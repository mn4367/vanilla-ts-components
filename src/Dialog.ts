import { AChildren, ACustomComponentEvent, AElementComponent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, getProp, IElementComponent, INodeComponent, mixin, tabKeyFocusCycle } from "@vanilla-ts/core";
import { Div, Dialog as DOMDialog } from "@vanilla-ts/dom";


/**
 * All corners/edges that can be used to change the size of a dialog. The values must be set as a
 * bit mask on {@link DialogOptions.Resizers} in the dialog options.
 */
export enum DlgResizers {
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
 * Bit mask for {@link DialogOptions.Resizers} in the dialog options that allows resizing the
 * dialog on _all_ corners/edges.
 */
export const DLG_RESIZERS_ALL =
    DlgResizers.N |
    DlgResizers.NE |
    DlgResizers.E |
    DlgResizers.SE |
    DlgResizers.S |
    DlgResizers.SW |
    DlgResizers.W |
    DlgResizers.NW;

/**
 * Bit mask for {@link DialogOptions.Resizers} in the dialog options that allows resizing the
 * dialog only on the right and bottom side and on the bottom right corner.
 */
export const DLG_RESIZERS_EAST_SOUTH =
    DlgResizers.E |
    DlgResizers.SE |
    DlgResizers.S;

/**
 * Bit mask for {@link DialogOptions.Resizers} in the dialog options that allows resizing the
 * dialog only on the left and bottom side and on the bottom left corner.
 */
export const DLG_RESIZERS_WEST_SOUTH =
    DlgResizers.W |
    DlgResizers.SW |
    DlgResizers.S;

/**
 * `Dialog` options. The options are used to initialze the dialog _and_ they can be used to
 * completely re-configure an existing instance of a dialog. All option properties are optional:
 * - A _missing_ property does not change the current value of the respective property in the
 *   current dialog options (set in the constructor or by calling `<instance>.options(opts)`).
 * - A property _which is given_ but with the value `undefined` will set the property to its default
 *   value.
 */
export type DialogOptions = {
    /**
     * The dialog position (offset in pixels) with regard to the viewport. This is done by setting
     * the `inset-inline-start` and/or `inset-block-start` CSS property on the dialog element.\
     * __Note__: If the dialog is centered horizontally or vertically this is _not_ the offset
     * with regard to the viewport/parent but instead the offset with regard to the calculated
     * horizontally and/or vertically centered position of the dialog.\
     * Default: `{ x: 0, y: 0 }`.
     */
    Position?: { X: number; Y: number; }; // eslint-disable-line jsdoc/require-jsdoc
    /**
     * `true` if the dialog is to be centered horizontally with regard to the viewport, otherwise
     * `false`. If `Position` is also given, `Position.X` is used as an _offset_ to the calculated
     * value of the horizontally centered position. As long as `HCentered` is `true` `Position.X` is
     * only the offset to the calculated horizontal position of the dialog and not the horizontal
     * offset to the viewport/parent.\
     * Default: `true`.
     * @see {@link DialogOptions.Position}
     */
    HCentered?: boolean;
    /**
     * `true` if the dialog is to be centered vertically with regard to the viewport, otherwise
     * `false`. If `Position` is also given, `Position.Y` is used as an _offset_ to the calculated
     * value of the vertically centered position. As long as `VCentered` is `true` `Position.Y` is
     * only the offset to the calculated vertical position of the dialog and not the vertical
     * offset to the viewport/parent.\
     * Default: `true`.
     * @see {@link DialogOptions.Position}
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
     * If `true`, the dialog is cancelled (and closed) when the user clicks outside the dialog. With
     * `false` the dialog must be cancelled/closed by other means (e.g. a button action or by
     * calling `dlg.close()`/`dlg.cancel()` elsewhere).\
     * __Note:__ Setting `CloseWithClickOutside` to `true` for modal dialogs is possible, but
     * somewhat defeats the purpose of modal dialogs.\
     * Default: `false`.
     */
    CloseWithClickOutside?: boolean;
    /**
     * If `true`, the dialog can be moved by the user by holding down and moving the pointer on (an
     * element inside) the dialog. When set to `false`, the dialog remains fixed in the position
     * configured with `HCentered`, `VCentered` and `Position` and cannot be moved interactively.\
     * __Note__: If the dialog is moved, `HCentered` and `VCentered` are set to `false` and Position
     * is updated accordingly.\
     * Default: `false`.
     * @see {@link DialogOptions.MoveHandle}
     */
    Movable?: boolean;
    /**
     * The component that acts as the drag handle for moving the dialog (typically a title bar). If
     * not set (and {@link DialogOptions.Movable} is `true`), the default handle is the dialog's
     * inner content container. This container contains all child components of the dialog.\
     * __Notes:__
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
     * If `Resizers` is given and is unequal to `DlgResizers.NONE` the dialog can be resized. The
     * value must be set as a bit mask of values of `DlgResizers`.\
     * __Note__: If the dialog is resized, `HCentered` and `VCentered` are set to `false` and
     * Position is updated accordingly.\
     * Default: `DlgResizers.NONE`.
     * @see {@link DlgResizers} for possible values.
     */
    Resizers?: number;
    /**
     * If `true`, the center of the dialog does not move when resizing. Instead, when a resizer is
     * moved, the opposite corner/edge is also moved by the same amount in the opposite direction.
     * If `CenteredResize` is a function, it will receive the current dialog instance as a
     * parameter. If the function returns `true`, the behavior when resizing is as described above.
     * Using a function is useful if, for example, the current status of a modifier key (Shift, Alt,
     * etc.) is to be used to control the resizing behavior.\
     * Default: `false`.
     */
    CenteredResize?: boolean | ((dlg: Dialog) => boolean);
    /**
     * If `true`, the focus remains within the dialog when pressing the `Tab` and `Shift-Tab` keys,
     * so, for example, if `Tab` is pressed when the last focusable element is focused, the focus
     * will move to the first focusable element in the dialog and not to another element on the page
     * or to the browser itself.\
     * Default: `true`.
     */
    LockFocusInside?: boolean;
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

/** Custom 'dlg-closed' event for dialogs. */
export class DialogClosedEvent extends ACustomComponentEvent<"dlg-closed", Dialog, {
    /**
     * The return value with which the dialog was closed/cancelled.\
     * __Note:__ The `ReturnValue` property of the events `detail` property is either
     * - the current `ReturnValue` property of the dialog,
     * - the return value which has been set through calling `close(someValue)` (if any)
     * - or `DLG_CANCELLED`, if the dialog was cancelled (then `Cancel` is also `true`).
     */
    ReturnValue: string;
    /**
     * `true`, if the dialog was cancelled instead of closed regularly, otherwise `false`. If
     * `Cancel` is `true`, `ReturnValue` is always `DLG_CANCELLED`.
     */
    Cancel: boolean;
}> {
    /**
     * Create dialog closed event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param returnValue The return value with which the dialog was closed/cancelled.\
     * __Note:__ The `ReturnValue` property of the events `detail` property is either
     * - the current `ReturnValue` property of the dialog,
     * - the return value which has been set through calling `close(someReturnValue)` (if any)
     * - or `DLG_CANCELLED`, if the dialog was cancelled (then `Cancel` is also `true`).
     * @param cancel `true`, if the dialog was cancelled instead of closed regularly, otherwise
     * `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, returnValue: string, cancel: boolean, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("dlg-closed", sender, { ReturnValue: cancel ? DLG_CANCELLED : returnValue, Cancel: cancel }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-move-start' event for dialogs. */
export class DialogMoveStartEvent extends ACustomComponentEvent<"dlg-move-start", Dialog> {
    /**
     * Create dialog move start event. Event handlers can prevent moving the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-move-start", sender, undefined, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-move' event for dialogs. */
export class DialogMoveEvent extends ACustomComponentEvent<"dlg-move", Dialog, {
    /** The offset of the move event. */
    Offset: { X: number; Y: number; }; // eslint-disable-line jsdoc/require-jsdoc
}> {
    /**
     * Create dialog move event. Event handlers can prevent moving the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param offset The offset of the move event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, offset: { X: number; Y: number; }, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) { // eslint-disable-line jsdoc/require-jsdoc
        super("dlg-move", sender, { Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-moved' event for dialogs. */
export class DialogMovedEvent extends ACustomComponentEvent<"dlg-moved", Dialog, {
    /** The offset of the move event. */
    Offset: { X: number; Y: number; }; // eslint-disable-line jsdoc/require-jsdoc
}> {
    /**
     * Create dialog moved event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param offset The offset of the move event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, offset: { X: number; Y: number; }, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) { // eslint-disable-line jsdoc/require-jsdoc
        super("dlg-moved", sender, { Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-resize-start' event for dialogs. */
export class DialogResizeStartEvent extends ACustomComponentEvent<"dlg-resize-start", Dialog, {
    /** The resizer which is used to resize the dialog. */
    Resizer: DlgResizers;
}> {
    /**
     * Create dialog resize start event. Event handlers can prevent resizing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param resizer The resizer which is used to resize the dialog.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, resizer: DlgResizers, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-resize-start", sender, { Resizer: resizer }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-resize' event for dialogs. */
export class DialogResizeEvent extends ACustomComponentEvent<"dlg-resize", Dialog, {
    /** The resizer which is used to resize the dialog. */
    Resizer: DlgResizers;
    /** The offset of the resize event. */
    Offset: { X: number; Y: number; }; // eslint-disable-line jsdoc/require-jsdoc
}> {
    /**
     * Create dialog resize event. Event handlers can prevent resizing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param resizer The resizer which is used to resize the dialog.
     * @param offset The offset of the resize event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, resizer: DlgResizers, offset: { X: number; Y: number; }, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) { // eslint-disable-line jsdoc/require-jsdoc
        super("dlg-resize", sender, { Resizer: resizer, Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-resized' event for dialogs. */
export class DialogResizedEvent extends ACustomComponentEvent<"dlg-resized", Dialog, {
    /** The resizer which was used to resize the dialog. */
    Resizer: DlgResizers;
    /** The offset of the resize event. */
    Offset: { X: number; Y: number; }; // eslint-disable-line jsdoc/require-jsdoc
}> {
    /**
     * Create dialog resized event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param resizer The resizer which was used to resize the dialog.
     * @param offset The offset of the resize event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, resizer: DlgResizers, offset: { X: number; Y: number; }, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) { // eslint-disable-line jsdoc/require-jsdoc
        super("dlg-resized", sender, { Resizer: resizer, Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
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
     * This event is emitted, when the `show()` or `showModal()` function of a dialog has been
     * executed. This event is purely informative and can't be cancelled.
     */
    "dlg-shown": DialogShownEvent;
    /**
     * A dialog is to be closed. Event handlers can prevent closing the dialog by calling
     * `preventDefault()`.
     */
    "dlg-close": DialogCloseEvent;
    /**
     * This event is emitted, when the `close()` function of a dialog has been executed. This event
     * is purely informative and can't be cancelled.
     */
    "dlg-closed": DialogClosedEvent;
    /**
     * A dialog is to be moved. Event handlers can prevent moving the dialog at all by calling
     * `preventDefault()`.
     */
    "dlg-move-start": DialogMoveStartEvent;
    /**
     * A dialog is being moved. Event handlers can prevent moving the dialog by calling
     * `preventDefault()`.
     */
    "dlg-move": DialogMoveEvent;
    /**
     * A dialog was moved (the pointer was released). This event is purely informative and can't be
     * cancelled.
     */
    "dlg-moved": DialogMovedEvent;
    /**
     * A dialog is to be resized. Event handlers can prevent resizing the dialog at all by calling
     * `preventDefault()`.
     */
    "dlg-resize-start": DialogResizeStartEvent;
    /**
     * A dialog is being resized. Event handlers can prevent resizing the dialog at all by calling
     * `preventDefault()`.
     */
    "dlg-resize": DialogResizeEvent;
    /**
     * A dialog was resized (the pointer was released). This event is purely informative and can't
     * be cancelled.
     */
    "dlg-resized": DialogResizedEvent;
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
    protected lastActiveElement?: HTMLElement;
    protected closedRegularly: boolean;
    protected isRTL: boolean;
    protected rsObserver: ResizeObserver;
    protected fncOnResize = this.onResize.bind(this);
    protected moveResizeStart: boolean;
    protected pointerDownStart = { X: 0, Y: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    protected moving = false;
    protected moveStartPositionOffset = { X: 0, Y: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    protected fncOnNonModalPointerDown = this.onNonModalPointerDown.bind(this);
    protected fncOnModalPointerDown = this.onModalPointerDown.bind(this);
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
    protected resizeDir: DlgResizers;
    protected resizer?: HTMLDivElement;
    protected resizeStart = { X: 0, Y: 0, W: 0, H: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    protected minSize = { W: 0, H: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    protected maxSize = { W: 0, H: 0 }; // eslint-disable-line jsdoc/require-jsdoc

    /**
     * Create dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()` or insert()) since this can cause
     * problems when centering or positioning the dialog (by default relative to the viewport). This
     * is especially true for modal dialogs where it can be hard to calculate the position of the
     * dialog with regard to its parent. For non-modal dialogs centering and positioning the dialog
     * relative to its parent usually works as expected, but use cases for this scenario are rather
     * rare.\
     * If an instance of `Dialog` is not mounted in another component, it is automatically added to
     * `document.body` as a child element in `show()`/`showModal()` and removed again in `close()`.
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
     * __Note:__ If the dialog is currently moved or resized, `options()` does nothing.
     * @param opts The new dialog options.
     * @returns This instance.
     */
    public options(opts: DialogOptions): this {
        if (this.moving || this.resizing) {
            return this;
        }
        this._options.MoveHandle?.off("pointerup", this.fncOnPointerUp)
            .off("pointerdown", this.fncOnPointerDown)
            .removeClass("move-handle", "custom-move-handle");
        this._options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Position: getProp(opts, this._options, "Position", { X: 0, Y: 0 }),
            HCentered: getProp(opts, this._options, "HCentered", true),
            VCentered: getProp(opts, this._options, "VCentered", true),
            CloseWithEscape: getProp(opts, this._options, "CloseWithEscape", true),
            CloseWithClickOutside: getProp(opts, this._options, "CloseWithClickOutside", false),
            Movable: getProp(opts, this._options, "Movable", false),
            MoveHandle: getProp(opts, this._options, "MoveHandle", this.contentContainer),
            Resizers: getProp(opts, this._options, "Resizers", DlgResizers.NONE),
            CenteredResize: getProp(opts, this._options, "CenteredResize", false),
            LockFocusInside: getProp(opts, this._options, "LockFocusInside", true),
            BaseZIndex: Math.max(getProp(opts, this._options, "BaseZIndex", 1000), 0),
            /* eslint-enable */
        };
        if (this._options.Movable) {
            this._options.MoveHandle!.on("pointerdown", this.fncOnPointerDown)
                .on("pointerup", this.fncOnPointerUp)
                .addClass(this._options.MoveHandle === this.contentContainer ? "move-handle" : "custom-move-handle");
        }
        const resizable = [DlgResizers.N, DlgResizers.NE, DlgResizers.E, DlgResizers.SE, DlgResizers.S, DlgResizers.SW, DlgResizers.W, DlgResizers.NW];
        for (let i = 0; i < this.resizers.length; i++) {
            ((this._options.Resizers! & resizable[i]) === resizable[i]) // eslint-disable-line @typescript-eslint/no-unsafe-enum-comparison
                ? this.ui.DOM.appendChild(this.resizers[i])
                : this.resizers[i].remove();
        }
        Dialog.baseZIndex = this._options.BaseZIndex!;
        this.setZIndexes();
        this
            .removeClass("h-centered", "v-centered", "movable", "resizable")
            .addClass(
                this._options.HCentered ? "h-centered" : null,
                this._options.VCentered ? "v-centered" : null,
                this._options.Movable ? "movable" : null,
                (this._options.Resizers !== DlgResizers.NONE) ? "resizable" : null
            );
        this.state !== DialogState.CLOSED && this.placeDlg(this.getPosition());
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
     * Get the inner content container of the dialog.\
     * __Note:__ This property __must not be used to add/remove/... components__, instead use the
     * respective functions of `Dialog` itself! `Content` should only be used for styling or other
     * (readonly) purposes!
     */
    public get Content(): IElementComponent<HTMLElement> {
        return this.contentContainer;
    }

    /**
     * Get the current bounding rectangle of the dialog with regard to the viewport (in pixels).
     * This value is only useful if the dialog is shown (`<dlg>.State !== DialogState.CLOSED`).
     */
    public get BoundingRect(): DOMRect {
        return this.DOM.getBoundingClientRect();
    }

    /**
     * Closes the dialog. `dlg-close` event handlers may prevent closing the dialog.
     * @param returnValue An overridden/individual value for the `ReturnValue` of the dialog. This
     * does _not_ change the _current_ value of `ReturnValue` on this instance!
     * @returns This instance.
     */
    public close(returnValue?: string): this {
        return this.dispatch(new DialogCloseEvent(this, returnValue ?? this.ReturnValue, false))
            ? this.doClose(returnValue)
            : this;
    }

    /**
     * Forcibly closes the dialog. `dlg-close` event handlers _are not called_ and thus _cannot_
     * prevent closing the dialog.
     * @param returnValue An overridden/individual value for the `ReturnValue` of the dialog. This
     * does _not_ change the _current_ value of `ReturnValue` on this instance!
     * @returns This instance.
     */
    public forceClose(returnValue?: string): this {
        return this.doClose(returnValue);
    }

    /**
     * Cancels (and closes) the dialog. `dlg-close` event handlers may prevent canceling the dialog.
     * The `ReturnValue` of the dialog is set to {@link DLG_CANCELLED}.
     * @returns This instance.
     */
    public cancel(): this {
        return this.dispatch(new DialogCloseEvent(this, DLG_CANCELLED, true))
            ? this.doClose(DLG_CANCELLED)
            : this;
    }

    /**
     * Forcibly cancels (and closes) the dialog. `dlg-close` event handlers _are not called_ and
     * thus _cannot_ prevent canceling the dialog. The `ReturnValue` of the dialog is set to
     * {@link DLG_CANCELLED}.
     * @returns This instance.
     */
    public forceCancel(): this {
        return this.doClose(DLG_CANCELLED);
    }

    /**
     * Displays the dialog (non-modal) and adds the class name `non-modal` to the dialog. `dlg-show`
     * event handlers may prevent showing the dialog.
     * @param focus The component to be focused after showing the dialog. `focus` can have the
     * following values:
     * - An instance of `IElementComponent`: if the instance is a child of this dialog this instance
     *   is focused, otherwise the dialog itself is focused.
     * - Not given or `undefined`: If the dialog is shown _for the first time_ the dialog will be
     *   focused. Subsequent calls to `show()` or `show(undefined)` try to focus the element that
     *   was active _immediately before the dialog was closed_ (if the dialog contains it, otherwise
     *   the dialog itself is focused).
     * - `null`: Normally, displaying a dialog removes the focus from the currently active element
     *   in the document (`document.activeElement`). By passing `null`, the currently active element
     *   is saved before the dialog is displayed and refocused after the dialog became visible (of
     *   course, this only works if `document.activeElement` is not `null`, otherwise the dialog
     *   itself is focused).\
     *   `null` can be useful for creating toolbars/palettes/overlays, etc. that do not destroy the
     *   current focus state when displayed.
     * @throws `InvalidStateError` (if the dialog is already open and modal).
     * @returns This instance.
     */
    public show(focus?: IElementComponent<HTMLElement> | null): this {
        return this.dispatch(new DialogShowEvent(this, false))
            ? this.doShow(focus)
            : this;
    }

    /**
     * Forcibly displays the dialog (non-modal) and adds the class name `non-modal` to the dialog.
     * `dlg-show` event handlers _are not called_ and thus _cannot_ prevent showing the dialog.
     * @param focus see {@link show()}
     * @throws see {@link show()}
     * @returns This instance.
     */
    public forceShow(focus?: IElementComponent<HTMLElement> | null): this {
        return this.doShow(focus);
    }

    /**
     * Displays the dialog (modal) and adds the class name `modal` to the dialog. If this is the
     * first modal dialog instance currently open, the class name `modal-dialog-first` is added to
     * the dialog. `dlg-show` event handlers may prevent showing the dialog.
     * @param focus The component to be focused after showing the dialog. `focus` can have the
     * following values:
     * - An instance of `IElementComponent`: if the instance is a child of this dialog this instance
     *   is focused, otherwise the dialog itself is focused.
     * - Not given or `undefined`: If the dialog is shown _for the first time_ the dialog will be
     *   focused. Subsequent calls to `show()` or `show(undefined)` try to focus the element that
     *   was active _immediately before the dialog was closed_ (if the dialog contains it, otherwise
     *   the dialog itself is focused).
     * @throws `InvalidStateError` (if the dialog is already open and non-modal).
     * @returns This instance.
     */
    public async showModal(focus?: IElementComponent<HTMLElement>): Promise<this> {
        return this.dispatch(new DialogShowEvent(this, true))
            ? await this.doShowModal(focus)
            : this;
    }

    /**
     * Forcibly displays the dialog (modal) and adds the class name `modal` to the dialog. If this
     * is the first modal dialog instance currently open, the class name `modal-dialog-first` is
     * added to the dialog. `dlg-show` event handlers  _are not called_ and thus _cannot_ prevent
     * showing the dialog.
     * @param focus see {@link showModal()}
     * @throws see {@link showModal()}
     * @returns This instance.
     */
    public async forceShowModal(focus?: IElementComponent<HTMLElement>): Promise<this> {
        return await this.doShowModal(focus);
    }

    /**
     * Closes the dialog.
     * @param returnValue An updated value for the `ReturnValue` of the dialog.
     * @returns This instance.
     */
    protected doClose(returnValue?: string): this {
        this.closedRegularly = true;
        this.Parent
            ? this.rsObserver.unobserve(this.Parent.DOM)
            : window.removeEventListener("resize", this.fncOnResize); // eslint-disable-line jsdoc/require-jsdoc
        const lastActive = document.activeElement;
        this.lastActiveElement = (lastActive instanceof HTMLElement && this.DOM.contains(lastActive)) ? lastActive : undefined;
        this.ui.close(returnValue);
        document.removeEventListener("pointerdown", this.fncOnNonModalPointerDown);
        this.off("pointerdown", this.fncOnModalPointerDown);
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
        this.emit(new DialogClosedEvent(this, returnValue ?? this.ReturnValue, false));
        return this;
    }

    /**
     * See {@link show()} and {@link forceShow()}.
     * @param focus see {@link show()}
     * @throws see {@link show()}
     * @returns This instance.
     */
    protected doShow(focus?: IElementComponent<HTMLElement> | null): this {
        this.addClass("non-modal", "--calc-size");
        const lastActive = document.activeElement;
        this.Parent || document.body.appendChild(this.DOM);
        document.addEventListener("pointerdown", this.fncOnNonModalPointerDown);
        this.ui.show();
        this.closedRegularly = false;
        this.state = DialogState.NON_MODAL;
        Dialog.nonModals.indexOf(this) === -1 && Dialog.nonModals.push(this);
        this.makeTopMost();
        this.placeDlg(this.getPosition());
        this.Parent
            ? this.rsObserver.observe(this.Parent.DOM)
            : window.addEventListener("resize", this.fncOnResize); // eslint-disable-line jsdoc/require-jsdoc
        this.removeClass("--calc-size");
        (
            focus === null && lastActive && lastActive instanceof HTMLElement
                ? lastActive
                : focus === undefined && this.lastActiveElement
                    ? this.lastActiveElement
                    : focus instanceof AElementComponent && this.contains(focus)
                        ? focus
                        : this
        ).focus();
        this.emit(new DialogShownEvent(this, false));
        return this;
    }

    /**
     * See {@link showModal()} and {@link forceShowModal()}.
     * @param focus see {@link showModal()}
     * @throws see {@link showModal()}
     * @returns This instance.
     */
    protected async doShowModal(focus?: IElementComponent<HTMLElement>): Promise<this> {
        this.addClass("modal", "--calc-size");
        this.Parent || document.body.appendChild(this.DOM);
        this.on("pointerdown", this.fncOnModalPointerDown);
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
        this.placeDlg(this.getPosition());
        this.Parent
            ? this.rsObserver.observe(this.Parent.DOM)
            : window.addEventListener("resize", this.fncOnResize); // eslint-disable-line jsdoc/require-jsdoc
        this.removeClass("--calc-size");
        (
            focus === undefined && this.lastActiveElement
                ? this.lastActiveElement
                : focus instanceof AElementComponent && this.contains(focus)
                    ? focus
                    : this
        ).focus();
        this.emit(new DialogShownEvent(this, true));
        await new Promise(resolve => this.modalResolver = resolve);
        return this;
    }

    /**
     * Set the position and size of the dialog.
     * @param offset The left/top dialog offset (in pixels)
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param width The width of the dialog.
     * @param height The height of the dialog.
     * @returns This instance.
     */
    protected placeDlg(offset: { X: number; Y: number; }, width?: number, height?: number): this { // eslint-disable-line jsdoc/require-jsdoc
        width !== undefined && this.style("width", width + "px");
        height !== undefined && this.style("height", height + "px");
        this
            .style("insetInlineStart", `${offset.X}px`)
            .style("insetBlockStart", `${offset.Y}px`);
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
                this._options.LockFocusInside
                    && !ev.ctrlKey
                    && !ev.altKey
                    && !ev.metaKey
                    && tabKeyFocusCycle(this.dlg.DOM, ev);
                break;
            default:
                return;
        }
    }

    /**
     * Handle window and parente resizing.
     */
    protected onResize(): void {
        this.state == DialogState.CLOSED || this.placeDlg(this.getPosition());
    }

    /**
     * Handle the `pointerdown` event on the document in non-modal state.
     * @param ev The pointer event.
     */
    protected onNonModalPointerDown(ev: PointerEvent): void {
        if (
            this._options.CloseWithClickOutside
            && ev.target
            && ev.target instanceof HTMLElement
            && !this.DOM.contains(ev.target)
        ) {
            this.cancel();
        }
    }

    /**
     * Handle the `pointerdown` event on the dialog in modal state.
     * @param ev The pointer event.
     */
    protected onModalPointerDown(ev: PointerEvent): void {
        const rect = this.BoundingRect;
        if (
            ev.offsetX < 0
            || ev.offsetY < 0
            || ev.offsetX > rect.width
            || ev.offsetY > rect.height
        ) {
            if (this._options.CloseWithClickOutside) {
                this.cancel();
            } else {
                ev.preventDefault();
                ev.stopImmediatePropagation();
            }
        }
    }

    /**
     * Handle the `pointerdown` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    protected onPointerDown(ev: PointerEvent): void {
        if (this.moving) {
            return;
        }
        if (ev.target instanceof HTMLElement
            && (
                (this._options.MoveHandle === this.contentContainer && ev.target === this._options.MoveHandle?.DOM)
                || (this._options.MoveHandle !== this.contentContainer && this._options.MoveHandle!.DOM.contains(ev.target))
            )
        ) {
            if (!this.dispatch(new DialogMoveStartEvent(this))) {
                return;
            }
            this.isRTL = this.DOM.parentElement !== null && getComputedStyle(this.DOM.parentElement).direction === "rtl";
            this.pointerDownStart.X = ev.clientX;
            this.pointerDownStart.Y = ev.clientY;
            this.moveStartPositionOffset.X = parseFloat(this.Style.insetInlineStart?.slice(0, -2)) || 0;
            this.moveStartPositionOffset.Y = parseFloat(this.Style.insetBlockStart?.slice(0, -2)) || 0;
            this.addClass("move-start");
            this._options.MoveHandle!.DOM.setPointerCapture(ev.pointerId);
            this._options.MoveHandle!.on("pointermove", this.fncOnPointerMove);
            this.moveResizeStart = true;
            this.moving = true;
        }
    }

    /**
     * Handle the `pointermove` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    protected onPointerMove(ev: PointerEvent): void {
        if (!this.moving) {
            return;
        }
        const offset = {
            /* eslint-disable jsdoc/require-jsdoc */
            X: ev.clientX - this.pointerDownStart.X,
            Y: ev.clientY - this.pointerDownStart.Y
            /* eslint-enable */
        };
        if (!this.dispatch(new DialogMoveEvent(this, offset))) {
            return;
        }
        if (this.moveResizeStart) {
            this.moveResizeStart = false;
            this._options.HCentered = false;
            this._options.VCentered = false;
            this
                .removeClass("h-centered", "v-centered", "move-start")
                .addClass("moving", "moved");
        }
        this._options.Position!.X = this.moveStartPositionOffset.X + (this.isRTL ? -offset.X : offset.X);
        this._options.Position!.Y = this.moveStartPositionOffset.Y + offset.Y;
        this.placeDlg(this._options.Position!);
    }

    /**
     * Handle the `pointerup` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    protected onPointerUp(ev: PointerEvent): void {
        if (!this.moving) {
            return;
        }
        this.moveResizeStart = false;
        this.moving = false;
        this._options.MoveHandle?.DOM.releasePointerCapture(ev.pointerId);
        this._options.MoveHandle?.off("pointermove", this.fncOnPointerMove);
        this
            .removeClass("move-start")
            .addClass(this.hasClass("moving") ? "moved" : null)
            .removeClass("moving");
        this.emit(new DialogMovedEvent(this, { X: ev.clientX - this.pointerDownStart.X, Y: ev.clientY - this.pointerDownStart.Y })); // eslint-disable-line jsdoc/require-jsdoc
    }

    /**
     * Handle the `pointerdown` event on a resizer element.
     * @param ev The pointer event.
     */
    protected onResizerPointerDown(ev: PointerEvent): void {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (this.resizing || !(ev.target instanceof HTMLDivElement)) {
            return;
        }
        switch (ev.target) {
            case this.rsN: this.resizeDir = DlgResizers.N; break;
            case this.rsNE: this.resizeDir = DlgResizers.NE; break;
            case this.rsE: this.resizeDir = DlgResizers.E; break;
            case this.rsSE: this.resizeDir = DlgResizers.SE; break;
            case this.rsS: this.resizeDir = DlgResizers.S; break;
            case this.rsSW: this.resizeDir = DlgResizers.SW; break;
            case this.rsW: this.resizeDir = DlgResizers.W; break;
            case this.rsNW: this.resizeDir = DlgResizers.NW; break;
            default:
                return;
        }
        if (!this.dispatch(new DialogResizeStartEvent(this, this.resizeDir))) {
            return;
        }
        this.isRTL = this.DOM.parentElement !== null && getComputedStyle(this.DOM.parentElement).direction === "rtl";
        this.pointerDownStart.X = ev.clientX;
        this.pointerDownStart.Y = ev.clientY;
        const pos = this.getPosition();
        const rect = this.DOM.getBoundingClientRect();
        this.resizeStart.X = pos.X;
        this.resizeStart.Y = pos.Y;
        this.resizeStart.W = rect.width;
        this.resizeStart.H = rect.height;
        const gcs = getComputedStyle(this.DOM);
        this.minSize.W = parseFloat(gcs.minWidth.slice(0, -2)) || 0;
        this.minSize.H = parseFloat(gcs.minHeight.slice(0, -2)) || 0;
        this.maxSize.W = parseFloat(gcs.maxWidth.slice(0, -2)) || Infinity;
        this.maxSize.H = parseFloat(gcs.maxHeight.slice(0, -2)) || Infinity;
        this.addClass("resize-start");
        this.resizer = ev.target;
        this.resizer.setPointerCapture(ev.pointerId);
        this.resizer.addEventListener("pointermove", this.fncOnResizerPointerMove);
        this.moveResizeStart = true;
        this.resizing = true;
    }

    /**
     * Handle the `pointermove` event on a resizer element.
     * @param ev The pointer event.
     */
    protected onResizerPointerMove(ev: PointerEvent): void {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (!this.resizing) {
            return;
        }
        const offset = {
            /* eslint-disable jsdoc/require-jsdoc */
            X: ev.clientX - this.pointerDownStart.X,
            Y: ev.clientY - this.pointerDownStart.Y
            /* eslint-enable */
        };
        if (!this.dispatch(new DialogResizeEvent(this, this.resizeDir, offset))) {
            return;
        }
        let width: number | undefined = undefined;
        let height: number | undefined = undefined;
        const centered = typeof this._options.CenteredResize === "boolean"
            ? this._options.CenteredResize
            : this._options.CenteredResize!(this);
        const fCentered = centered ? 2 : 1;
        const rss = this.resizeStart;
        const minSize = this.minSize;
        const maxSize = this.maxSize;
        const pos = this.moveResizeStart
            ? this.getPosition()
            : { ...this._options.Position! };
        // - Return early if resizing violates the `minSize` constraint.
        // - For the edges and corners the offset and position have to be adjusted.
        let cv = false; // constraintViolation
        switch (this.resizer) {
            case this.rsN:
                height = rss.H - offset.Y;
                if (rss.H - offset.Y < minSize.H || rss.H - offset.Y > maxSize.H) {
                    return;
                }
                pos.Y = rss.Y + offset.Y / fCentered;
                break;
            case this.rsNE:
                width = rss.W + offset.X;
                if (rss.W + offset.X < minSize.W) {
                    offset.X = -(rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W + offset.X > maxSize.W) {
                    offset.X = -(rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H - offset.Y;
                if (rss.H - offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = rss.H - minSize.H;
                }
                if (rss.H - offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = rss.H - maxSize.H;
                }
                this.isRTL
                    ? pos.X = rss.X - offset.X / fCentered
                    : centered && (pos.X = rss.X - offset.X / fCentered);
                pos.Y = rss.Y + offset.Y / fCentered;
                break;
            case this.rsE:
                width = rss.W + offset.X;
                if ((rss.W + offset.X < minSize.W) || (rss.W + offset.X > maxSize.W)) {
                    return;
                }
                this.isRTL
                    ? pos.X = rss.X - offset.X / fCentered
                    : centered && (pos.X = rss.X - offset.X / fCentered);
                break;
            case this.rsSE:
                width = rss.W + offset.X;
                if (rss.W + offset.X < minSize.W) {
                    offset.X = -(rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W + offset.X > maxSize.W) {
                    offset.X = -(rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H + offset.Y;
                if (rss.H + offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - minSize.H);
                }
                if (rss.H + offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - maxSize.H);
                }
                this.isRTL
                    ? pos.X = rss.X - offset.X / fCentered
                    : centered && (pos.X = rss.X - offset.X / fCentered);
                centered && (pos.Y = rss.Y - offset.Y / fCentered);
                break;
            case this.rsS:
                height = rss.H + offset.Y;
                if (rss.H + offset.Y < minSize.H || rss.H + offset.Y > maxSize.H) {
                    return;
                }
                centered && (pos.Y = rss.Y - offset.Y / fCentered);
                break;
            case this.rsSW:
                width = rss.W - offset.X;
                if (rss.W - offset.X < minSize.W) {
                    offset.X = (rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W - offset.X > maxSize.W) {
                    offset.X = (rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H + offset.Y;
                if (rss.H + offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - minSize.H);
                }
                if (rss.H + offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - maxSize.H);
                }
                this.isRTL
                    ? centered && (pos.X = rss.X + offset.X / fCentered)
                    : pos.X = rss.X + offset.X / fCentered;
                centered && (pos.Y = rss.Y - offset.Y / fCentered);
                break;
            case this.rsW:
                width = rss.W - offset.X;
                if ((rss.W - offset.X < minSize.W) || (rss.W - offset.X > maxSize.W)) {
                    return;
                }
                this.isRTL
                    ? centered && (pos.X = rss.X + offset.X / fCentered)
                    : pos.X = rss.X + offset.X / fCentered;
                break;
            case this.rsNW:
                width = rss.W - offset.X;
                if (rss.W - offset.X < minSize.W) {
                    offset.X = (rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W - offset.X > maxSize.W) {
                    offset.X = (rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H - offset.Y;
                if (rss.H - offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = (rss.H - minSize.H);
                }
                if (rss.H - offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = (rss.H - maxSize.H);
                }
                this.isRTL
                    ? centered && (pos.X = rss.X + offset.X / fCentered)
                    : pos.X = rss.X + offset.X / fCentered;
                pos.Y = rss.Y + offset.Y / fCentered;
                break;
            default:
                return;
        }
        if (this.moveResizeStart) {
            this.moveResizeStart = false;
            this._options.HCentered = false;
            this._options.VCentered = false;
            this
                .removeClass("h-centered", "v-centered", "resize-start")
                .addClass("resizing", "resized");
        }
        this._options.Position!.X = pos.X;
        this._options.Position!.Y = pos.Y;
        this.placeDlg(pos, Math.min(maxSize.W, Math.max(minSize.W, width ?? rss.W)), Math.min(maxSize.H, Math.max(minSize.H, height ?? rss.H)));
    }

    /**
     * Handle the `pointerup` event on a resizer element.
     * @param ev The pointer event.
     */
    protected onResizerPointerUp(ev: PointerEvent): void {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (!this.resizing) {
            return;
        }
        this.moveResizeStart = false;
        this.resizing = false;
        this.resizer?.releasePointerCapture(ev.pointerId);
        this.resizer?.removeEventListener("pointermove", this.fncOnResizerPointerMove);
        this.resizer = undefined;
        this.removeClass("resize-start")
            .addClass(this.hasClass("resizing") ? "resized" : null)
            .removeClass("resizing");
        this.emit(new DialogResizedEvent(this, this.resizeDir, { X: ev.clientX - this.pointerDownStart.X, Y: ev.clientY - this.pointerDownStart.Y })); // eslint-disable-line jsdoc/require-jsdoc
    }

    /**
     * Calculate the position of the dialog according to its current settings (offset, centered).
     * @returns An object containing the calculated position of the dialog.
     */
    protected getPosition(): { X: number; Y: number; } { // eslint-disable-line jsdoc/require-jsdoc
        const rect = this.DOM.getBoundingClientRect();
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            X: this._options.HCentered
                ? (this.Parent ? this.Parent.DOM.clientWidth : window.innerWidth) / 2 - rect.width / 2 + this._options.Position!.X
                : this._options.Position!.X,
            Y: this._options.VCentered
                ? (this.Parent ? this.Parent.DOM.clientHeight : window.innerHeight) / 2 - rect.height / 2 + this._options.Position!.Y
                : this._options.Position!.Y
            /* eslint-enable */
        };
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
        this.rsObserver = new ResizeObserver(() => {
            this.fncOnResize();
        });
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface Dialog<EventMap extends DialogEventMap = DialogEventMap> extends AElementComponentWithInternalUI<DOMDialog, EventMap>, AChildren<HTMLElement, EventMap> { } // eslint-disable-line jsdoc/require-jsdoc

/**
 * Factory for `Dialog` components.
 */
export class DialogFactory<T> extends ComponentFactory<Dialog> {
    /**
     * Create dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()` or insert()) since this can cause
     * problems when centering or positioning the dialog (by default relative to the viewport). This
     * is especially true for modal dialogs where it can be hard to calculate the position of the
     * dialog with regard to its parent. For non-modal dialogs centering and positioning the dialog
     * relative to its parent usually works as expected, but use cases for this scenario are rather
     * rare.\
     * If an instance of `Dialog` is not mounted in another component, it is automatically added to
     * `document.body` as a child element in `show()`/`showModal()` and removed again in `close()`.
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

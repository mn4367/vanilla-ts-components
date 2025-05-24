import { AChildren, ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, INodeComponent, mixin } from "@vanilla-ts/core";
import { Div, Dialog as DOMDialog } from "@vanilla-ts/dom";


/**
 * `Dialog` options. The options are used to initialze the dialog _and_ they can be used to
 * completely re-configure an existing instance of a dialog. All option properties are optional, a
 * missing property will be replaced by its default value (using `new Dialog(options, ...)`) or by
 * the value already existing in the dialogs options (when reconfiguring a dialog instance).
 */
export type DialogOptions = {
    /**
     * The left/top dialog position with regard to the viewport. This is done setting the
     * `margin-left` and `margin-top` CSS properties on the dialog element.\
     * Default: `{ x: 0, y: 0 }`.
     */
    Position?: DOMPoint;
    /**
     * `true` if the dialog is to be centered horizontally, otherwise `false`. If `Position` is also
     * given, `Position.x` is added as an offset to the calculated value of the horizontally
     * centered position.\
     * Default: `true`.
     */
    HCentered?: boolean;
    /**
     * `true` if the dialog is to be centered vertically, otherwise `false`. If `Position` is also
     * given, `Position.y` is added as an offset to the calculated value of the vertically centered
     * position.\
     * Default: `true`.
     */
    VCentered?: boolean;
    /**
     * If `true`, the dialog is canceled (and closed) when the `Esc` key is pressed. With `false`
     * the dialog must be canceled/closed by other means (e.g. a button action or by calling
     * `dlg.close()`/`dlg.cancel()` elsewhere).\
     * Default: `true`.
     */
    CloseWithEscape?: boolean;
    /**
     * If `true`, the focus remains within the dialog when pressing the `Tab` and `Shift-Tab` keys
     * keys, i.e. if e.g. `Tab` is pressed when the last focusable element is focused, the focus
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
    Closed = 0,
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
     * Create dialog show event.
     * @param sender The event emitter (always `Dialog`).
     * @param modal `true` if the dialog is about to be displayed modal, otherwise false.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, modal: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-show", sender, { Modal: modal }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'dlg-close' event for dialogs. */
export class DialogCloseEvent extends ACustomComponentEvent<"dlg-close", Dialog, {
    /**
     * The `returnValue` with which the dialog is to be closed/canceled. If `cancel` is `true`,
     * `returnValue` is always `DLG_CANCELED`.\
     * __Important note:__ The `ReturnValue` property of the events `detail` property is the return
     * value _which would be set_ if the dialog is closed/canceled, _not the current_ `ReturnValue`
     * property of the dialog!
     */
    ReturnValue: string;
    /**
     * `true`, if the dialog was canceled instead of closed regularly, otherwise `false`. If
     * `Cancel` is `true`, `ReturnValue` is always `DLG_CANCELED`.
     */
    Cancel: boolean;
}> {
    /**
     * Create dialog close event.
     * @param sender The event emitter (always `Dialog`).
     * @param returnValue The `returnValue` with which the dialog is to be closed/canceled. If
     * `cancel` is `true`, `returnValue` is always `DLG_CANCELED`.\
     * __Important note:__ The `ReturnValue` property of the events `detail` property is the return
     * value _which would be set_ if the dialog is closed/canceled, _not the current_ `ReturnValue`
     * property of the dialog!
     * @param cancel `true`, if the dialog was canceled instead of closed regularly, otherwise
     * `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, returnValue: string, cancel: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-close", sender, { ReturnValue: cancel ? DLG_CANCELED : returnValue, Cancel: cancel }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
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
     * A dialog is to be colsed. Event handlers can prevent closing the dialog by calling
     * `preventDefault()`.
     */
    "dlg-close": DialogCloseEvent;
}

/**
 * Special `returnValue` of dialogs in the case where the internal `Dialog` DOM element is closed
 * bypassing the regular `close()`/`forceClose()` functions. This should never happen, except the
 * browser has a bug or the component is misused by accessing protected properties.\
 * __Note:__ Do _not_ use this constant as a regular return value for dialogs!
 */
export const DLG_IRREGULAR_CLOSE = "__DLG_IRREGULAR_CLOSE__";

/**
 * Default `returnValue` of dialogs which have been canceled using `cancel()`/`forceCancel()`.\
 * __Note:__ Do _not_ use this constant as a regular return value for dialogs!
 */
export const DLG_CANCELED = "__DLG_CANCELED__";

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
    protected state: DialogState = DialogState.Closed;
    protected contentContainer: Div;
    protected focusableElementsSelector = "button:not([tabindex='-1']), [href], input:not([tabindex='-1']), select:not([tabindex='-1']), textarea:not([tabindex='-1']), details:not([tabindex='-1']), [tabindex]:not([tabindex='-1'])";
    protected closedRegularly: boolean;

    /**
     * Create dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()` or insert()) since this can cause
     * problems when centering or positioning the dialog relative to the viewport. If an instance of
     * `Dialog` is not mounted in another component, it is automatically added to `document.body` as
     * a child element in `show()`/`showModal()` and removed again in `close()`.
     * @param options Options for the dialog.
     * @param components The initial components that make up the content of this dialog.\
     * __Important note:__ If a dialog is disposed of (using`dispose()`), _all_ components given
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
     * Get/set the options for this dialog. The getter returns a _copy_ of the options.
     */
    public get Options(): DialogOptions {
        return structuredClone(this._options);
    }
    /** @inheritdoc */
    public set Options(v: DialogOptions) {
        this.options(v);
    }

    /**
     * Set the options for this dialog. See also the documentation for `DialogOptions`.
     * @param options The new dialog options.
     * @returns This instance.
     */
    public options(options: DialogOptions): this {
        this._options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Position: options.Position ? DOMPoint.fromPoint(options.Position) : this._options.Position ? DOMPoint.fromPoint(this._options.Position) : new DOMPoint(0, 0),
            HCentered: options.HCentered ?? this._options.HCentered ?? true,
            VCentered: options.VCentered ?? this._options.VCentered ?? true,
            CloseWithEscape: options.CloseWithEscape ?? this._options.CloseWithEscape ?? true,
            LockFocusCycleInside: options.LockFocusCycleInside ?? this._options.LockFocusCycleInside ?? true,
            BaseZIndex: Math.max(options.BaseZIndex ?? Dialog.baseZIndex ?? 1000, 0),
            /* eslint-enable */
        };
        this.style("marginLeft", `${this._options.Position!.x}px`);
        this.style("marginTop", `${this._options.Position!.y}px`);
        this._options.HCentered ? this.addClass("h-centered") : this.removeClass("h-centered");
        this._options.VCentered ? this.addClass("v-centered") : this.removeClass("v-centered");
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
     * Get/set the `returnValue` property of the dialog.
     */
    public get ReturnValue(): string {
        return this.dlg.ReturnValue;
    }
    /** @inheritdoc */
    public set ReturnValue(v: string) {
        this.dlg.ReturnValue = v;
    }

    /**
     * Set the `returnValue` property of the dialog.
     * @param v The value to be set.
     * @returns This instance.
     */
    public returnValue(v: string): this {
        this.dlg.ReturnValue = v;
        return this;
    }

    /**
     * Closes the dialog. `dlg-close` event handlers may prevent closing the dialog.
     * @param returnValue An updated value for the `returnValue` of the dialog.
     * @returns This instance.
     */
    public close(returnValue?: string): this {
        return this.dispatch(new DialogCloseEvent(this, returnValue ?? "", false))
            ? this.doClose(returnValue)
            : this;
    }

    /**
     * Forcibly closes the dialog. `dlg-close` event handlers _cannot_ prevent closing the dialog.
     * @param returnValue An updated value for the `returnValue` of the dialog.
     * @returns This instance.
     */
    public forceClose(returnValue?: string): this {
        return this.doClose(returnValue);
    }

    /**
     * Cancels (and closes) the dialog. `dlg-close` event handlers may prevent canceling the dialog.
     * The `returnValue` of the dialog is set to `DLG_CANCELED`.
     * @returns This instance.
     */
    public cancel(): this {
        return this.dispatch(new DialogCloseEvent(this, DLG_CANCELED, true))
            ? this.doClose(DLG_CANCELED)
            : this;
    }

    /**
     * Forcibly cancels (and closes) the dialog. `dlg-close` event handlers _cannot_ prevent
     * canceling the dialog. The `returnValue` of the dialog is set to `DLG_CANCELED`.
     * @returns This instance.
     */
    public forceCancel(): this {
        return this.doClose(DLG_CANCELED);
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
     * @param returnValue An updated value for the `returnValue` of the dialog.
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
            (index === -1) || Dialog.modals.splice(index, 1);
            Dialog.modals[0]?.addClass("modal-dialog-first");
            this.modalResolver?.();
        } else if (this.state === DialogState.NON_MODAL) {
            const index = Dialog.nonModals.indexOf(this);
            (index === -1) || Dialog.nonModals.splice(index, 1);
            this.style("zIndex", null);
            this.setZIndexes();
        }
        if (!this.Parent) {
            this.DOM.remove();
        }
        this.state = DialogState.Closed;
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
        Dialog.nonModals.indexOf(this) !== -1 || Dialog.nonModals.push(this);
        this.makeTopMost();
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
        await new Promise(resolve => this.modalResolver = resolve);
        return this;
    }

    /**
     * Make the dialog the topmost dialog.
     * @param _ev The `focus` event.
     */
    protected makeTopMost(_ev?: FocusEvent): void {
        if (this.state === DialogState.NON_MODAL) {
            const index = Dialog.nonModals.indexOf(this);
            index === -1 || Dialog.nonModals.push(Dialog.nonModals.splice(index, 1)[0]);
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

    /** @inheritdoc */
    protected override clearOwner(): this {
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
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, Dialog, AChildren);
    }
}

/** Augment class definition with `IChildren` (see `static`). */
export interface Dialog<EventMap extends DialogEventMap = DialogEventMap> extends AElementComponentWithInternalUI<DOMDialog, EventMap>, AChildren<HTMLElement, EventMap> { }

/**
 * Factory for Dialog components.
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
     * __Important note:__ If a dialog is disposed of (using`dispose()`), _all_ components given
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

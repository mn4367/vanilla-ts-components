import { ComponentFactory, DefaultEventMap, mixinDOMProperties, Orientation, OrientationAttr, ValueEvent } from "@vanilla-ts/core";
import { Button, Div, PressedEvent } from "@vanilla-ts/dom";
import { IconButton } from "./IconButton.js";


/**
 * An event that is emitted when the selection in a button group changes. This event is only emitted
 * if a user interaction causes a change in the selection. Multiple interactions are reported
 * together as one final selection change.
 */
export class ButtonGroupValueEvent extends ValueEvent<ButtonGroup, string[]> { }

/** Additional event(s) for `ButtonGroup`. */
export interface ButtonGroupEventMap extends DefaultEventMap {
    /**
     * A button or an icon button inside the button group is pressed/unpressed. Event handlers can
     * prevent changing the `Pressed` state by calling `preventDefault()`.
     * @see {@link PressedEvent}
     */
    "pressed": PressedEvent<Button | IconButton>;
    /**
     * The selection in a button group has changed. This event is purely informative and can't be
     * cancelled.
     */
    "value": ButtonGroupValueEvent;
}

/**
 * The selection behavior of the button group, determining how buttons can be/must be pressed.
 * "First" refers to the order in `Children`. Empty groups are allowed in every mode.
 */
export enum SelectionMode {
    /**
     * Only one button can be pressed at a time. If multiple buttons are already pressed, only the
     * first one will remain pressed. This implies that when a button is pressed, all other buttons
     * will be unpressed.
     */
    SINGLE = "single",
    /**
     * Only one button can be pressed at a time, and at least one button must be pressed. If this
     * condition is not met, the first button will be automatically pressed if no other button is
     * pressed already. If multiple buttons are already pressed, only the first one of these pressed
     * buttons will remain pressed. The button group ensures that at least one button is always
     * pressed.
     */
    SINGLE_REQUIRED = "single-required",
    /**
     * Multiple buttons can be pressed at the same time. Setting this style on an existing button
     * group will leave the `Pressed` state of all buttons unchanged.
     */
    MULTIPLE = "multiple",
    /**
     * Multiple buttons can be pressed at the same time, and at least one button must be pressed. If
     * this condition is not met, the first button will be automatically pressed if no other button
     * is pressed already. If one or multiple buttons are already pressed setting this style won't
     * change the state `Pressed` of any button in the group. The button group ensures that at least
     * one button is always pressed.
     */
    MULTIPLE_REQUIRED = "multiple-required",
}

/**
 * The semantic role of a button group. This also determines the tab order and keyboard navigation
 * behavior of a button group.
 */
export enum GroupRole {
    /** A toolbar with one tab stop and local arrow-key navigation. */
    Toolbar = "toolbar",
    /** A group whose tab order and keyboard navigation may be managed by its parent. */
    Group = "group",
}

/**
 * An orientation mixin that chooses the ARIA orientation variant or the normal orientation
 * according to the button group's role.
 */
abstract class ButtonGroupOrientationAttr extends OrientationAttr<HTMLDivElement> {
    /** @inheritdoc */
    public override orientation(v: Orientation): this {
        const vertical = v === Orientation.VERTICAL || v === Orientation.ARIA_VERTICAL;
        return super.orientation(
            v === Orientation.NONE
                ? Orientation.NONE
                : this.DOM.getAttribute("role") === GroupRole.Toolbar
                    ? vertical
                        ? Orientation.ARIA_VERTICAL
                        : Orientation.ARIA_HORIZONTAL
                    : vertical
                        ? Orientation.VERTICAL
                        : Orientation.HORIZONTAL);
    }
}

/**
 * A container for a group of buttons. Buttons added to this group will have their `Pressed` state
 * automatically enabled. A common use case is the implementation of toolbars or option groups.
 *
 * Features and usage notes:
 *
 * - The group allows to enforce specific selection modes, such as single selection or multiple
 *   selection, depending on the configured `SelectionMode` property.
 * - Changes made through `values()` and `selectionMode()` are checked and corrected with regard to
 *   the configured `SelectionMode` property, if necessary, to maintain a correct selection state.
 * - Disabled child button components do not interfere with the selection state of the group, they
 *   are handled the same way as non-disabled buttons.
 * - The correct behavior of the group is not guaranteed if it contains buttons with the same value.
 *   Using distinct values for each button must be ensured by the developer.
 * - `GroupRole.Toolbar` (the default) provides one tab stop on an enabled button. Arrow keys move
 *   the focus without changing the current selection: Left/Right for a horizontally aligned group,
 *   Up/Down for a vertically aligned group, wrapping at either end and skipping disabled buttons
 *   and buttons hidden by `hidden` or CSS `display: none`. Enter and Space toggle the focused
 *   button. The last focused button remains the tab stop; initially this is the first enabled
 *   button.
 * - `GroupRole.Group` disables local keyboard navigation and leaves tab indices unmanaged. Without
 *   a parent focus manager, buttons retain their natural tab order. Switching from Toolbar to Group
 *   restores the tab indices saved before local navigation was enabled.
 * - Both `GroupRole.Toolbar` and `GroupRole.Group` should have an accessible name supplied by the
 *   application via `aria-label` or `aria-labelledby`. Toolbar orientation is reflected in
 *   `aria-orientation`.
 * - Both emitted events are only triggered by user interactions and not by programmatic changes to
 *   any of the child buttons or the group itself.
 * - All `pressed` events triggered by the child buttons are propagated to the button group so that
 *   listeners on the group instead of the child buttons can respond to them.
 * - `pressed` is dispatched before the button changes state; its details contain the intended
 *   state and `preventDefault()` cancels the change. `values()` and `selectionMode()` normalize
 *   synchronously, while direct `Pressed` assignments and child list changes are normalized by a
 *   `MutationObserver`. Synchronous event handlers may therefore observe an intermediate selection.
 * - `value` is emitted in a microtask after a user interaction and selection normalization.
 *   Interactions within the same batch are reported as one final change. Programmatic changes alone
 *   do not emit it, but changes made before a pending user interaction is processed may affect its
 *   payload or suppress the event. Use `Values` to read the normalized result of user interactions.
 */
export class ButtonGroup<EventMap extends ButtonGroupEventMap = ButtonGroupEventMap> extends Div<Button | IconButton, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    #groupRole = GroupRole.Toolbar;
    #originalGroupTabIndex?: string | null;
    #selectionMode = SelectionMode.MULTIPLE;
    #selectionObserver: MutationObserver;
    #onPressedFnc = this.#onPressed.bind(this) as EventListener;
    #onKeyDownFnc = this.#onKeyDown.bind(this);
    #onFocusInFnc = this.#onFocusIn.bind(this);
    #tabStop?: Button | IconButton;
    #originalTabIndexes = new Map<Button | IconButton, string | null>();
    #pendingUserChanges: { Button: Button | IconButton; Event: PressedEvent<Button | IconButton>; }[] = []; // eslint-disable-line jsdoc/require-jsdoc

    /**
     * Create ButtonGroup component.
     * @param buttons The buttons to be added to the button group.
     * @param selectionMode The selection behavior of the button group, determining how buttons can
     * be/must be pressed.
     * @param orientation The orientation of the button group.
     * @param groupRole The semantic role and keyboard behavior. Defaults to Toolbar.
     */
    constructor(buttons: (Button | IconButton)[], selectionMode: SelectionMode = SelectionMode.MULTIPLE, orientation: Orientation = Orientation.HORIZONTAL, groupRole: GroupRole = GroupRole.Toolbar) {
        super();
        this.#startMutationObserver();
        this.DOM.addEventListener("pressed", this.#onPressedFnc);
        this.DOM.addEventListener("keydown", this.#onKeyDownFnc);
        this.DOM.addEventListener("focusin", this.#onFocusInFnc);
        for (const button of buttons) {
            button.Pressed === undefined && (button.Pressed = false);
        }
        this
            .orientation(orientation)
            .groupRole(groupRole)
            .append(...buttons)
            .selectionMode(selectionMode);
    }

    /** Get/set the semantic role and keyboard navigation behavior. */
    public get GroupRole(): GroupRole {
        return this.#groupRole;
    }
    /** @inheritdoc */
    public set GroupRole(v: GroupRole) {
        this.groupRole(v);
    }

    /**
     * Set the semantic role and keyboard navigation behavior.
     * @param v `GroupRole.Toolbar` manages focus locally; `GroupRole.Group` leaves focus management
     * to the application.
     * @returns This instance.
     */
    public groupRole(v: GroupRole): this {
        if (this.#groupRole === GroupRole.Toolbar && v === GroupRole.Group) {
            this.#restoreTabStops();
        }
        this.#groupRole = v;
        this.role(v);
        this.orientation(this.Orientation);
        if (v === GroupRole.Toolbar) {
            this.#syncTabStops();
        }
        return this;
    }

    /**
     * Get/set the values of all 'selected' buttons in the group. When setting `Values`, the
     * `Pressed` state of a button in the group is set to `true` only if the given array `v`
     * contains the button's value. The resulting selection is adjusted to the current group
     * selection style.
     */
    public get Values(): string[] {
        return this.Children
            .filter(button => button.Pressed)
            .map(button => button.Value);
    }
    /** @inheritdoc */
    public set Values(v: string[]) {
        this.values(v);
    }

    /**
     * Set the values of all buttons in the group. This will set the `Pressed` state of a button in
     * the group to `true` only if the given array `v` contains the button's value. Single-selection
     * modes keep the first matching button. If no value matches, the required modes keep the first
     * previously pressed button, or select the first button if none was pressed.
     * @param v The array of values to be set for the buttons in the group.
     * @returns This instance.
     */
    public values(v: string[]): this {
        const buttons = this.Children;
        const previouslyPressed = buttons.find(button => button.Pressed === true);
        for (const button of buttons) {
            button.Pressed = v.includes(button.Value);
        }
        this.#normalizeSelection(buttons.some(button => button.Pressed === true) ? undefined : previouslyPressed);
        return this;
    }

    /**
     * Get/set the selection mode of the button group.
     */
    public get SelectionMode(): SelectionMode {
        return this.#selectionMode;
    }
    /** @inheritdoc */
    public set SelectionMode(v: SelectionMode) {
        this.selectionMode(v);
    }

    /**
     * Set the selection mode and normalize the current selection, even if the style is unchanged.
     * @param v The new selection mode to be set for the button group.
     * @returns This instance.
     */
    public selectionMode(v: SelectionMode): this {
        this.#selectionMode = v;
        this.removeClass("select-single", "select-single-required", "select-multiple", "select-multiple-required");
        switch (this.#selectionMode) {
            case SelectionMode.SINGLE:
                this.addClass("select-single");
                break;
            case SelectionMode.SINGLE_REQUIRED:
                this.addClass("select-single-required");
                break;
            case SelectionMode.MULTIPLE:
                this.addClass("select-multiple");
                break;
            case SelectionMode.MULTIPLE_REQUIRED:
                this.addClass("select-multiple-required");
                break;
            default:
                break;
        }
        this.#normalizeSelection();
        return this;
    }

    /**
     * Enable toggle behavior and enforce the current selection rules.
     * @param preferred The changed button, which takes precedence when pressed in a
     * single-selection mode, or is restored if unpressing it would leave a required group without a
     * selection.
     */
    #normalizeSelection(preferred?: Button | IconButton): void {
        try {
            const buttons = this.Children;
            for (const button of buttons) {
                button.Pressed === undefined && (button.Pressed = false);
            }
            const single = this.#selectionMode === SelectionMode.SINGLE || this.#selectionMode === SelectionMode.SINGLE_REQUIRED;
            const required = this.#selectionMode === SelectionMode.SINGLE_REQUIRED || this.#selectionMode === SelectionMode.MULTIPLE_REQUIRED;
            const selected = preferred?.Pressed === true ? preferred : buttons.find(button => button.Pressed === true);
            if (single && selected) {
                for (const button of buttons) {
                    button !== selected && button.Pressed === true && (button.Pressed = false);
                }
            }
            if (required && !selected) {
                const fallback = preferred ?? buttons[0];
                fallback && (fallback.Pressed = true);
            }
        } finally {
            this.#syncTabStops();
            // Discard mutations produced by this normalization to avoid observer feedback loops.
            this.#selectionObserver.takeRecords();
        }
    }

    /**
     * Start observing mutations on the button group's DOM. This includes removing/adding buttons
     * from/to the group.
     */
    #startMutationObserver() {
        this.#selectionObserver = new MutationObserver(records => {
            const buttons = this.Children;
            const changed = records.findLast(record =>
                record.attributeName === "aria-pressed"
                && record.oldValue !== "true"
                && buttons.some(button => button.DOM === record.target && button.Pressed === true))
                ?? records.findLast(record =>
                    record.attributeName === "aria-pressed"
                    && buttons.some(button => button.DOM === record.target));
            this.#normalizeSelection(buttons.find(button => button.DOM === changed?.target));
        });
        this.#selectionObserver.observe(this.DOM, {
            /* eslint-disable jsdoc/require-jsdoc */
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["aria-pressed", "disabled", "aria-disabled", "tabindex", "hidden", "class", "style"],
            attributeOldValue: true
            /* eslint-enable */
        });
    }

    /**
     * Get the buttons currently available for keyboard navigation.
     * @returns Enabled buttons without the HTML hidden attribute or computed `display: none`.
     */
    #navigableButtons(): (Button | IconButton)[] {
        return this.Children.filter(button =>
            !button.Disabled
            && !button.ParentDisabled
            && !button.DOM.matches(":disabled")
            && !button.DOM.hidden
            && button.DOM.ownerDocument.defaultView?.getComputedStyle(button.DOM).display !== "none"
        );
    }

    /**
     * Maintain one child tab stop and restore the original tabindex of removed buttons.
     * @param preferred The button that has just received focus, if any.
     */
    #syncTabStops(preferred?: Button | IconButton): void {
        if (this.#groupRole !== GroupRole.Toolbar) {
            return;
        }
        const buttons = this.Children;
        for (const [button, original] of this.#originalTabIndexes) {
            if (!buttons.includes(button)) {
                if (!button.Disposed) {
                    if (button.Parent instanceof ButtonGroup && button.Parent.GroupRole === GroupRole.Toolbar) {
                        // Preserve the original value when a button is moved between groups.
                        button.Parent.#originalTabIndexes.set(button, original);
                    } else {
                        button.attrib("tabindex", original);
                    }
                }
                this.#originalTabIndexes.delete(button);
            }
        }
        const navigable = this.#navigableButtons();
        const focused = navigable.find(button => button.DOM.contains(this.DOM.ownerDocument.activeElement));
        this.#tabStop = preferred && navigable.includes(preferred)
            ? preferred
            : focused ?? (this.#tabStop && navigable.includes(this.#tabStop)
                ? this.#tabStop
                : navigable[0]);
        if (this.#originalGroupTabIndex === undefined) {
            this.#originalGroupTabIndex = this.DOM.getAttribute("tabindex");
        }
        this.tabbable(false);
        for (const button of buttons) {
            if (!this.#originalTabIndexes.has(button)) {
                this.#originalTabIndexes.set(button, button.DOM.getAttribute("tabindex"));
            }
            button.tabbable(button === this.#tabStop);
        }
    }

    /** Restore the tab indices managed by the toolbar without changing focus or selection. */
    #restoreTabStops(): void {
        for (const [button, original] of this.#originalTabIndexes) {
            if (!button.Disposed) {
                if (button.Parent instanceof ButtonGroup && button.Parent !== this
                    && button.Parent.GroupRole === GroupRole.Toolbar) {
                    button.Parent.#originalTabIndexes.set(button, original);
                } else {
                    button.attrib("tabindex", original);
                }
            }
        }
        this.#originalTabIndexes.clear();
        this.#tabStop = undefined;
        if (this.#originalGroupTabIndex !== undefined) {
            this.attrib("tabindex", this.#originalGroupTabIndex);
            this.#originalGroupTabIndex = undefined;
        }
    }

    /**
     * Remember focus changes caused by keyboard navigation, pointer input or code.
     * @param ev The focus event bubbling from a child button.
     */
    #onFocusIn(ev: FocusEvent): void {
        if (this.#groupRole !== GroupRole.Toolbar) {
            return;
        }
        if (ev.target instanceof Node) {
            const target = ev.target;
            const button = this.Children.find(child => child.DOM.contains(target));
            button && this.#syncTabStops(button);
        }
    }

    /**
     * Move focus along the group's orientation without changing the selection.
     * @param ev The keyboard event bubbling from a child button.
     */
    #onKeyDown(ev: KeyboardEvent): void {
        if (this.#groupRole !== GroupRole.Toolbar || ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || !(ev.target instanceof Node)) {
            return;
        }
        if (this.Orientation === Orientation.NONE) {
            return;
        }
        const horizontal = this.Orientation === Orientation.HORIZONTAL || this.Orientation === Orientation.ARIA_HORIZONTAL;
        let step = ev.key === (horizontal ? "ArrowRight" : "ArrowDown")
            ? 1
            : ev.key === (horizontal ? "ArrowLeft" : "ArrowUp")
                ? -1
                : 0;
        if (!step) {
            return;
        }
        if (horizontal && this.DOM.ownerDocument.defaultView?.getComputedStyle(this.DOM).direction === "rtl") {
            step = -step;
        }
        this.#syncTabStops();
        const buttons = this.#navigableButtons();
        const target = ev.target;
        const index = buttons.findIndex(button => button.DOM.contains(target));
        if (index < 0) {
            return;
        }
        ev.preventDefault();
        const next = buttons[(index + step + buttons.length) % buttons.length];
        this.#syncTabStops(next);
        next.focus();
    }

    /**
     * Handle the pressed event for a button within the group. This code ensures, that at least one
     * required button remains pressed, if the selection mode demands it.
     * @param ev The pressed event triggered by a button within the group.
     */
    #onPressed(ev: PressedEvent<Button | IconButton>) {
        const button = this.Children.find(child => child.DOM === ev.target);
        if (!button) {
            return;
        }
        const required = this.#selectionMode === SelectionMode.SINGLE_REQUIRED || this.#selectionMode === SelectionMode.MULTIPLE_REQUIRED;
        if (
            button
            && required
            && ev.$.Pressed === false
            && !this.Children.some(child => child !== button && child.Pressed === true)
        ) {
            ev.preventDefault();
        }
        if (ev.defaultPrevented) {
            return;
        }
        const before = this.Children.filter(child => child.Pressed === true);
        const scheduled = this.#pendingUserChanges.length > 0;
        this.#pendingUserChanges.push({ Button: button, Event: ev }); // eslint-disable-line jsdoc/require-jsdoc
        if (!scheduled) {
            queueMicrotask(() => {
                const changes = this.#pendingUserChanges;
                this.#pendingUserChanges = [];
                if (this.Disposed) {
                    return;
                }
                const buttons = this.Children;
                // Dispatch has finished: later handlers may also have cancelled the event.
                const changed = changes.findLast(change => !change.Event.defaultPrevented
                    && buttons.includes(change.Button)
                    && change.Button.Pressed === change.Event.$.Pressed);
                if (!changed) {
                    return;
                }
                this.#normalizeSelection(changed.Button);
                const after = this.Children.filter(child => child.Pressed === true);
                if (before.length !== after.length || before.some((child, index) => child !== after[index])) {
                    this.emit(new ButtonGroupValueEvent("value", this, { Value: this.Values })); // eslint-disable-line jsdoc/require-jsdoc
                }
            });
        }
    }

    /** @inheritdoc */
    public override dispose(): void {
        this.#pendingUserChanges = [];
        this.#selectionObserver.disconnect();
        this.DOM.removeEventListener("pressed", this.#onPressedFnc);
        this.DOM.removeEventListener("keydown", this.#onKeyDownFnc);
        this.DOM.removeEventListener("focusin", this.#onFocusInFnc);
        this.#originalTabIndexes.clear();
        this.#tabStop = undefined;
        super.dispose();
    }

    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(
            this,
            OrientationAttr<HTMLDivElement>,
            /** Overrides the accessor of the `OrientationAttr` mixin. */
            ButtonGroupOrientationAttr
        );
    }
}

// Augment the class with the orientation API supplied by mixinDOMProperties().
export interface ButtonGroup<EventMap extends ButtonGroupEventMap = ButtonGroupEventMap> extends Div<Button | IconButton, EventMap>, // eslint-disable-line jsdoc/require-jsdoc
    OrientationAttr<HTMLDivElement, EventMap> { }

/**
 * Factory for `ButtonGroup` components.
 */
export class ButtonGroupFactory<T> extends ComponentFactory<ButtonGroup> {
    /**
     * Create ButtonGroup component.
     * @param buttons The buttons to be added to the button group.
     * @param selectionMode The selection behavior of the button group, determining how buttons can
     * be/must be pressed.
     * @param orientation The orientation of the button group.
     * @param groupRole The semantic role and keyboard behavior. Defaults to Toolbar.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns ButtonGroup component.
     */
    public buttonGroup(buttons: (Button | IconButton)[], selectionMode: SelectionMode = SelectionMode.MULTIPLE, orientation: Orientation = Orientation.HORIZONTAL, groupRole: GroupRole = GroupRole.Toolbar, data?: T): ButtonGroup {
        return this.setupComponent(new ButtonGroup(buttons, selectionMode, orientation, groupRole), data);
    }
}

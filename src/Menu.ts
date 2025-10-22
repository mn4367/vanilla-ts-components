import { ACustomComponentEvent, AElementComponent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, DEFAULT_EVENT_INIT_DICT, IElementComponent, INodeComponent, Phrase, Phrases } from "@vanilla-ts/core";
import { Hr, LiUl, Menu, Span, Text } from "@vanilla-ts/dom";


/** Types of menu items. */
export type MenuEntry = MenuItem | MenuHeading | MenuSeparator;

/** Possible types of optional data to be attached to a menu item. */
type MenuItemData = bigint | boolean | number | object | string | symbol;

/**
 * Menu item component, an entry in a popup menu.
 */
export class MenuItem<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<LiUl, EventMap> {
    protected _checked: boolean = false;
    protected _hint: Span;
    protected _content: Span;
    protected _menuItemData?: MenuItemData;

    /**
     * Create menu item component.
     * @param content The content of the menu item.
     * @param hint The content of the menu item hint.
     * @param checked The `Checked` state of the menu item.
     * @param menuItemData Optional data attached to the menu item.
     */
    constructor(content: Phrase | Phrases | IElementComponent<HTMLElement>, hint?: Phrase | Phrases | IElementComponent<HTMLElement>, checked: boolean = false, menuItemData?: MenuItemData) {
        super();
        super
            .initialize()
            .content(content)
            .hint(hint)
            .checked(checked)
            .menuItemData(menuItemData)
            .tabIndex(0);
    }

    /**
     * Get/set the content of the menu item.\
     * __Notes:__
     * - The getter returns a _copy_ of the internal array of content items.
     * - The setter replaces _and_ disposes of _all_ content currently present in this menu item
     *   (the hint remains untouched)!
     * - The return type of the getter is very general since the content can be almost anything
     *   (instances of `@vanilla-ts/dom/Text`, phrasing content or a component like, for example, a
     *   labeled checkbox).
     * - For the further behaviour of this setter see function `content()`.
     * @see {@link MenuItem.Recontent}
     * @see {@link MenuItem.content()}
     */
    public get Content(): INodeComponent<Node>[] {
        return this._content.Children;
    }
    /** @inheritdoc */
    public set Content(content: Phrase | Phrases | IElementComponent<HTMLElement>) {
        this.internalContent(content, false);
    }

    /**
     * Set the content of the menu item.\
     * __Notes:__
     * - This setter first removes all content currently present in this menu item and then adds the
     *   new content. The removed content must be managed/cleared/disposed of by the consumer!
     * - For the further behaviour of this setter see function `recontent()`.
     * @see {@link MenuItem.Content}
     * @see {@link MenuItem.recontent()}
     */
    public set Recontent(content: Phrase | Phrases | IElementComponent<HTMLElement>) {
        this.internalContent(content, true);
    }

    /**
     * Set the content of the menu item.
     * @param content The content of the menu item.\
     * __Notes:__
     * - Setting new content replaces _and_ disposes of _all_ content currently present in this menu
     *   item (the hint remains untouched)!
     * - If `content` is a string, an instance of `@vanilla-ts/dom/Text` from that string will be
     *   created and appended.
     * - If `content` is an array with a length of `1` and `content[0]` is a string, an instance of
     *   `@vanilla-ts/dom/Text` from that string will be created and appended.
     * - If `content` is an array with a length greater than `0`, then an instance of
     *   `@vanilla-ts/dom/Text` is created and appended for each element of `content` that is a
     *   string. All other elements of the array `content` are added unchanged.
     * @see {@link MenuItem.recontent()}
     * @returns This instance.
     */
    public content(content: Phrase | Phrases | IElementComponent<HTMLElement>): this {
        return this.internalContent(content, false);
    }

    /**
     * Set the content of the menu item.
     * @param content The content of the menu item.\
     * __Notes:__
     * - Setting new content first removes all content currently present in this menu item and then
     *   adds the new content. The removed content must be managed/cleared/disposed of by the
     *   consumer (the hint remains untouched)!
     * - If `content` is a string, an instance of `@vanilla-ts/dom/Text` from that string will be
     *   created and appended.
     * - If `content` is an array with a length of `1` and `content[0]` is a string, an instance of
     *   `@vanilla-ts/dom/Text` from that string will be created and appended.
     * - If `content` is an array with a length greater than `0`, then an instance of
     *   `@vanilla-ts/dom/Text` is created and appended for each element of `content` that is a
     *   string. All other elements of the array `content` are added unchanged.
     * @see {@link MenuItem.content()}
     * @returns This instance.
     */
    public recontent(content: Phrase | Phrases | IElementComponent<HTMLElement>): this {
        return this.internalContent(content, true);
    }

    /**
     * Called internally by `Content`/`Recontent`/`content()`/`content()`.
     * @param content The menu item content to be set.
     * @param rephrase `true`, if the previous menu item content is disposed of, `false` if the
     * previous menu item content remains untouched.
     * @returns This instance.
     */
    public internalContent(content: Phrase | Phrases | IElementComponent<HTMLElement>, rephrase: boolean): this {
        this.removeClass("text", "phrase", "component");
        rephrase
            ? this._content.remove()
            : this._content.clear();
        if (typeof content === "string") {
            this._content.phrase(new Text(content));
            this.addClass("text");
        } else if (content instanceof Text) {
            this._content.append(content);
            this.addClass("text");
        } else if (Array.isArray(content)) {
            if (content.length === 1 && typeof content[0] === "string") {
                this._content.phrase(new Text(content[0]));
                this.addClass("text");
            } else {
                const elements = content.map(e => typeof e === "string" ? new Text(e) : e);
                this._content.phrase(...elements);
                this.addClass(
                    elements.every(e => e instanceof Text)
                        ? "text"
                        : "phrase"
                );
            }
        } else if (content instanceof AElementComponent) {
            this._content.append(content);
            this.addClass("component");
        }
        return this;
    }

    /**
     * Get/set the content of the menu item hint.\
     * __Notes:__
     * - The getter returns a _copy_ of the internal array of the hint contents.
     * - The setter replaces _and_ disposes of _all_ hint content currently present in this menu
     *   item hint!
     * - The return type of the getter is very general since the hint can be almost anything
     *   (instances of `@vanilla-ts/dom/Text`, phrasing content or a component like, for example, a
     *   labeled checkbox).
     * - For the further behaviour of this setter see function `hint()`.
     * @see {@link MenuItem.Rehint}
     * @see {@link MenuItem.hint()}
     */
    public get Hint(): INodeComponent<Node>[] {
        return this._hint.Children;
    }
    /** @inheritdoc */
    public set Hint(hint: Phrase | Phrases | IElementComponent<HTMLElement> | undefined) {
        this.internalHint(hint, false);
    }

    /**
     * Set the content of the menu item hint.\
     * __Notes:__
     * - This setter first removes all hint content currently present in this menu item hint and
     *   then adds the new hint content. The removed hint content must be managed/cleared/disposed
     *   of by the consumer!
     * - For the further behaviour of this setter see function `rehint()`.
     * @see {@link MenuItem.Hint}
     * @see {@link MenuItem.rehint()}
     */
    public set Rehint(hint: Phrase | Phrases | IElementComponent<HTMLElement> | undefined) {
        this.internalHint(hint, true);
    }

    /**
     * Set the content of the menu item hint.
     * @param hint The hint content of the menu item.\
     * __Notes:__
     * - Setting new hint content replaces _and_ disposes of _all_ hint content currently present
     *   in this menu item hint!
     * - If `hint` is undefined, the current hint content is removed _and_ disposed of!
     * - If `hint` is a string, an instance of `@vanilla-ts/dom/Text` from that string will be
     *   created and appended.
     * - If `hint` is an array with a length of `1` and `hint[0]` is a string, an instance of
     *   `@vanilla-ts/dom/Text` from that string will be created and appended.
     * - If `hint` is an array with a length greater than `0`, then an instance of
     *   `@vanilla-ts/dom/Text` is created and appended for each element of `hint` that is a string.
     *   All other elements of the array `hint` are added unchanged.
     * @see {@link MenuItem.rehint()}
     * @returns This instance.
     */
    public hint(hint?: Phrase | Phrases | IElementComponent<HTMLElement>): this {
        return this.internalHint(hint, false);
    }

    /**
     * Set the content of the menu item hint.
     * @param hint The hint content of the menu item.\
     * __Notes:__
     * - Setting new hint content first removes all hint content currently present in this menu item
     *   hint and then adds the new content. The removed hint content must be
     *   managed/cleared/disposed of by the consumer!
     * - If `hint` is undefined, all current hint content is removed. The removed hint content must
     *   be managed/cleared/disposed of by the consumer!
     * - If `hint` is a string, an instance of `@vanilla-ts/dom/Text` from that string will be
     *   created and appended.
     * - If `hint` is an array with a length of `1` and `hint[0]` is a string, an instance of
     *   `@vanilla-ts/dom/Text` from that string will be created and appended.
     * - If `hint` is an array with a length greater than `0`, then an instance of
     *   `@vanilla-ts/dom/Text` is created and appended for each element of `hint` that is a string.
     *   All other elements of the array `hint` are added unchanged.
     * @see {@link MenuItem.hint()}
     * @returns This instance.
     */
    public rehint(hint?: Phrase | Phrases | IElementComponent<HTMLElement>): this {
        return this.internalHint(hint, true);
    }

    /**
     * Called internally by `Hint`/`Rehint`/`hint()`/`rehint()`.
     * @param hint The hint content to be set.
     * @param rephrase `true`, if the previous hint content is disposed of, `false` if the previous
     * hint content remains untouched.
     * @returns This instance.
     */
    protected internalHint(hint: Phrase | Phrases | IElementComponent<HTMLElement> | undefined, rephrase: boolean): this {
        rephrase
            ? this._hint.remove()
            : this._hint.clear();
        if (hint === undefined) {
            return this;
        }
        if (typeof hint === "string") {
            this._hint.phrase(new Text(hint));
        } else if (hint instanceof Text) {
            this._hint.append(hint);
        } else if (Array.isArray(hint)) {
            if (hint.length === 1 && typeof hint[0] === "string") {
                this._hint.phrase(new Text(hint[0]));
            } else {
                this._hint.phrase(...hint.map(e => typeof e === "string" ? new Text(e) : e));
            }
        } else if (hint instanceof AElementComponent) {
            this._hint.append(hint);
        }
        return this;
    }

    /**
     * Get/set the `Checked` state of the menu item.
     */
    public get Checked(): boolean {
        return this._checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this.checked(v);
    }

    /**
     * Set the `Checked` state of the menu item.
     * @param checked The `Checked` state of the menu item.
     * @returns This instance.
     */
    public checked(checked: boolean) {
        this._checked = checked;
        this._checked
            ? this.addClass("checked")
            : this.removeClass("checked");
        return this;
    }

    /**
     * Get/set the data of the menu item.
     */
    public get MenuItemData(): MenuItemData | undefined {
        return this._menuItemData;
    }
    /** @inheritdoc */
    public set MenuItemData(v: MenuItemData | undefined) {
        this.menuItemData(v);
    }

    /**
     * Set the data of the menu item.
     * @param data The data to be set on the menu item.
     * @returns This instance.
     */
    public menuItemData(data?: MenuItemData) {
        this._menuItemData = data;
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new LiUl()
            .addClass("menu-item")
            .append(
                this._content = new Span(),
                this._hint = new Span().addClass("hint")
            );
        return this;
    }
}

/**
 * Factory for MenuItem components.
 */
export class MenuItemFactory<T> extends ComponentFactory<MenuItem> {
    /**
     * Create, set up and return MenuItem component.
     * @param content The content of the menu item.
     * @param hint The content of the menu item hint.
     * @param checked The `Checked` state of the menu item.
     * @param menuItemData Optional data attached to the menu item.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns MenuItem component.
     */
    public menuItem(content: Phrase | Phrases | IElementComponent<HTMLElement>, hint?: Phrase | Phrases | IElementComponent<HTMLElement>, checked: boolean = false, menuItemData?: MenuItemData, data?: T): MenuItem {
        return this.setupComponent(new MenuItem(content, hint, checked, menuItemData), data);
    }
}

/**
 * Menu heading component. A “Heading” menu item is not meant to be a normal menu item, but a
 * heading for a popup menu. The intended behavior is that such a heading does not show a hover
 * effect when the mouse pointer/mouse moves into it, and that the entry is ignored/skipped when
 * navigating with the keyboard through the list of (other) menu items in the popup menu.
 */
export class MenuHeading<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<LiUl, EventMap> {
    /**
     * Create menu heading component.
     * @param content The content of the menu heading.
     */
    constructor(content: Phrase | Phrases) {
        super();
        super
            .initialize()
            .content(content);
    }

    /**
     * Get/set the content of the menu heading.\
     * __Note:__ The return type of the getter is very general since the content can be a string or
     * (an array of) phrasing content.
     */
    public get Content(): INodeComponent<Node>[] {
        return this.ui.Children;
    }
    /** @inheritdoc */
    public set Content(content: Phrase | Phrases) {
        this.content(content);
    }

    /**
     * Set the content of the menu heading.
     * @param content The content of the menu heading.
     * @returns This instance.
     */
    public content(content: Phrase | Phrases): this {
        this.ui.removeClass("text", "phrase");
        if (typeof content === "string") {
            this.ui.phrase(content);
            this.ui.addClass("text");
        } else if (Array.isArray(content)) {
            this.ui.phrase(...content);
            this.ui.addClass("phrase");
        }
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new LiUl().addClass("menu-heading");
        return this;
    }
}

/**
 * Factory for MenuHeading components.
 */
export class MenuHeadingFactory<T> extends ComponentFactory<MenuHeading> {
    /**
     * Create, set up and return MenuHeading component.
     * @param content The content of the menu heading.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns MenuHeading component.
     */
    public menuHeading(content: Phrase | Phrases | IElementComponent<HTMLElement>, data?: T): MenuHeading {
        return this.setupComponent(new MenuHeading(content), data);
    }
}

/**
 * Menu separator component.
 */
export class MenuSeparator<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<LiUl, EventMap> {
    /**
     * Create menu separator component.
     */
    constructor() {
        super();
        super.initialize();
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new LiUl()
            .addClass("menu-separator")
            .append(new Hr());
        return this;
    }
}

/**
 * Factory for MenuSeparator components.
 */
export class MenuSeparatorFactory<T> extends ComponentFactory<MenuSeparator> {
    /**
     * Create, set up and return MenuSeparator component.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns MenuHeading component.
     */
    public menuSeparator(data?: T): MenuSeparator {
        return this.setupComponent(new MenuSeparator(), data);
    }
}

/** Custom 'show' event for popup menus. */
export class PopupMenuShowEvent extends ACustomComponentEvent<"show", PopupMenu> {
    /**
     * Create popup menu show event.
     * @param sender The event emitter (always `PopupMenu`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: PopupMenu, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("show", sender, undefined, customEventInitDict);
    }
}

/** Custom 'hide' event for popup menus. */
export class PopupMenuHideEvent extends ACustomComponentEvent<"hide", PopupMenu> {
    /**
     * Create popup menu hide event.
     * @param sender The event emitter (always `PopupMenu`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: PopupMenu, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("hide", sender, undefined, customEventInitDict);
    }
}

/** Custom 'select' event for menu items. */
export class PopupMenuItemSelectEvent extends ACustomComponentEvent<"select", PopupMenu, {
    MenuItem: MenuItem; // eslint-disable-line jsdoc/require-jsdoc
}> {
    /**
     * Create menu item select event.
     * @param sender The event emitter (always `PopupMenu`).
     * @param menuItem The menu item which was selected.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: PopupMenu, menuItem: MenuItem, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("select", sender, { MenuItem: menuItem }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `PopupMenu`. */
export interface PopupMenuEventMap extends HTMLElementEventMap {
    /**
     * A popup menu is to be shown. Event handlers can prevent showing the popup menu by calling
     * `preventDefault()`.
     */
    "show": PopupMenuShowEvent;
    /** A popup menu is to be hidden. This event is not cancelable. */
    "hide": PopupMenuHideEvent;
    /**
     * A menu item was selected. Event handlers can prevent the default handling of this event (e.g.
     * hide the corresponding popup menu) by calling `preventDefault()`.
     */
    "select": PopupMenuItemSelectEvent;
}

/**
 * PopupMenu component, a container for menu items, menu headings and menu separators.
 */
export class PopupMenu<EventMap extends PopupMenuEventMap = PopupMenuEventMap> extends AElementComponentWithInternalUI<Menu, EventMap> {
    protected focusableItems: MenuItem[] = [];
    protected focusedIndex: number = -1;
    protected lastFocusedElement: Element | null;
    protected fncOnClick = this.onMouseClick.bind(this);
    protected fncOnKeyDown = this.onKeyDown.bind(this);
    protected fncOnPointerMove = this.onPointerMove.bind(this);
    protected fncOnPointerLeave = this.onPointerLeave.bind(this);
    protected fncRemovePopupMenu = this.removePopupMenu.bind(this);
    protected passiveTrue = { passive: true }; // eslint-disable-line jsdoc/require-jsdoc
    protected menuMutationObserver: MutationObserver;

    /**
     * Create popup menu component.
     * @param items The menu items for the popup menu.
     */
    constructor(...items: MenuEntry[]) {
        super();
        super
            .initialize()
            .items(...items)
            .tabIndex(0);
    }

    /**
     * Get/set the popup menu items.\
     * __Notes:__
     * - The getter returns a _copy_ of the internal array of menu items.
     * - The setter replaces _and_ disposes of _all_ menu items currently present in this popup
     *   menu!
     */
    public get Items(): MenuEntry[] {
        return <MenuEntry[]>this.ui.Children;
    }
    /** @inheritdoc */
    public set Items(v: MenuEntry[]) {
        this.items(...v);
    }

    /**
     * Set the popup menu items.\
     * __Note:__ This replaces _and_ disposes of _all_ menu items currently present in this popup
     * menu!
     * @param items The menu items to be set.
     * @returns This instance.
     */
    public items(...items: MenuEntry[]): this {
        this.ui.clear();
        this.ui.append(...items);
        this.setFocusableItems();
        return this;
    }

    /**
     * Displays the pop-up menu.
     * @param position The position at which the pop-up menu is to be displayed. If no position is
     * specified, the position from CSS applies (if available there, otherwise 0,0). The position
     * refers to the top left corner of the page. If `position` is given, it is always adjusted in a
     * way that ensures that the menu is never clipped by the layout viewport. If another behavior
     * is desired, `adjustMenuPosition()` must be overridden.
     * @see {@link PopupMenu.adjustMenuPosition()}
     * @returns This instance.
     */
    public show(position?: DOMPoint): this {
        if (!this.dispatch(new PopupMenuShowEvent(this))) {
            return this;
        }
        this.lastFocusedElement = document.activeElement;
        this.setFocusableItems();
        const hasChecked = this.ui.Children.findIndex((e => e instanceof MenuItem && e.Checked)) !== -1;
        hasChecked ? this.ui.addClass("has-checked") : this.ui.removeClass("has-checked");
        document.body.appendChild(this.DOM);
        const d = this.DOM.style.display;
        const v = this.DOM.style.visibility;
        const layoutViewportWidth = document.documentElement.scrollWidth;
        const layoutViewportHeight = document.documentElement.scrollHeight;
        this.style("visibility", "hidden")
            .style("display", "");
        this.adjustMenuItemWidths();
        if (position) {
            this.adjustMenuPosition(position, layoutViewportWidth, layoutViewportHeight);
        }
        this.style("visibility", v)
            .style("display", d);
        window.addEventListener("pointerdown", this.fncRemovePopupMenu);
        window.addEventListener("resize", this.fncRemovePopupMenu);
        window.addEventListener("blur", this.fncRemovePopupMenu);
        this.on("click", this.fncOnClick)
            .on("keydown", this.fncOnKeyDown)
            .on("pointermove", this.fncOnPointerMove, this.passiveTrue)
            .on("pointerleave", this.fncOnPointerLeave, this.passiveTrue)
            .visible(true)
            .focus();
        this.menuMutationObserver.observe(this.ui.DOM, { childList: true, subtree: true }); // eslint-disable-line jsdoc/require-jsdoc
        return this;
    }

    /**
     * Hides the pop-up menu and removes it from the DOM.
     * @returns This instance.
     */
    public hide(): this {
        this.menuMutationObserver.disconnect();
        window.removeEventListener("pointerdown", this.fncRemovePopupMenu);
        window.removeEventListener("resize", this.fncRemovePopupMenu);
        window.removeEventListener("blur", this.fncRemovePopupMenu);
        this.off("click", this.fncOnClick)
            .off("keydown", this.fncOnKeyDown)
            .off("pointermove", this.fncOnPointerMove, this.passiveTrue)
            .off("pointerleave", this.fncOnPointerLeave, this.passiveTrue)
            .visible(false);
        this.DOM.remove();
        this.emit(new PopupMenuHideEvent(this))
            .style("left", "")
            .style("top", "");
        this.lastFocusedElement instanceof HTMLElement
            ? this.lastFocusedElement.focus()
            : undefined;
        return this;
    }

    /**
     * Adjust minimum widths of menu items.\
     * Calculate minimum with with regard to the hints. This code is far from ideal since it
     * first hides all hints to get the width of the widest menu text and then shows the
     * hints again, but it works. Care must be taken if `MenuItem` (or an inheriting class)
     * changes it's inner layout since the code here relies on this layout.
     */
    protected adjustMenuItemWidths(): void {
        const items = this.Items.filter(e => e instanceof MenuItem);
        let minItemWidth = 0;
        for (const item of items) {
            item.Hint[0]?.Parent?.visible(false);
            item.Content[0]?.Parent?.style("minWidth", null);
        }
        for (const item of items) {
            minItemWidth = Math.max(minItemWidth, item.Content[0]?.Parent?.DOM.clientWidth ?? 0);
        }
        for (const item of items) {
            item.Content[0]?.Parent?.style("minWidth", `${minItemWidth}px`);
            item.Hint[0]?.Parent?.visible(true);
        }
    }

    /**
     * Update the internal list of menu item components which can be focused.
     */
    protected setFocusableItems(): void {
        this.focusableItems.length = 0;
        for (const item of this.ui.Children) {
            if (item instanceof MenuItem && !item.Disabled /* !! */) {
                this.focusableItems.push(item); // eslint-disable-line @typescript-eslint/no-unsafe-argument
            }
        }
    }

    /**
     * Adjusts the position of the menu item in a way that ensures that the menu is never clipped by
     * the layout viewport.
     * @param position The position at which the pop-up menu is to be displayed.
     * @param layoutViewportWidth The width of the layout viewport.
     * @param layoutViewportHeight The height of the layout viewport.
     */
    protected adjustMenuPosition(position: DOMPoint, layoutViewportWidth: number, layoutViewportHeight: number): void {
        // Prevent clipped position for negative X and Y values.
        position.x = Math.max(0, position.x);
        position.y = Math.max(0, position.y);
        // this.style("insetInlineStart", `${position?.x}px`);
        // Initial position of the popup menu.
        this.style("left", `${position?.x}px`);
        this.style("top", `${position?.y}px`);
        /**
         * Adjust potential clipped positon at the right and the bottom.
         * @todo Handle other extreme positions?
         */
        const rect = this.DOM.getBoundingClientRect();
        if ((window.scrollX + rect.left + rect.width) > layoutViewportWidth) {
            this.style("left", `${layoutViewportWidth - rect.width}px`);
        }
        if ((window.scrollY + rect.top + rect.height) > layoutViewportHeight) {
            this.style("top", `${layoutViewportHeight - rect.height}px`);
        }
    }

    /**
     * A menu item was selected by the mouse/pointer.
     * @param _event The mouse/pointer event.
     */
    protected onMouseClick(_event: MouseEvent | PointerEvent): void {
        const menuItem = this.focusableItems[this.focusedIndex];
        if (menuItem && this.dispatch(new PopupMenuItemSelectEvent(this, menuItem))) {
            this.hide();
        }
    }

    /**
     * Keyboard navigation for the popup menu.
     * @param event The keyboard event.
     */
    protected onKeyDown(event: KeyboardEvent): void {
        const noKBModifiers = !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
        let focusTarget: MenuItem | IElementComponent<HTMLElement> | undefined = undefined;

        const setFocusedIndex = (backward: boolean): void => { // eslint-disable-line jsdoc/require-jsdoc
            if (this.focusedIndex === -1) {
                backward ? this.focusedIndex = this.focusableItems.length - 1 : this.focusedIndex = 0;
            } else if (backward) {
                this.focusedIndex === 0 ? this.focusedIndex = this.focusableItems.length - 1 : this.focusedIndex--;
            } else {
                this.focusedIndex === this.focusableItems.length - 1 ? this.focusedIndex = 0 : this.focusedIndex++;
            }
        };

        switch (event.key) {
            case " ":
            case "Enter":
                const menuItem = this.focusableItems[this.focusedIndex];
                if (menuItem && this.dispatch(new PopupMenuItemSelectEvent(this, menuItem))) {
                    this.hide();
                }
                break;
            case "Escape":
                if (noKBModifiers) {
                    this.hide();
                }
                return;
            case "Tab":
                event.preventDefault();
                event.stopImmediatePropagation();
                // 'Ctrl', 'Alt' and 'Meta' usually are handled by the operating system therefore
                // they are ignored.
                if (!event.ctrlKey && !event.altKey && !event.metaKey) {
                    setFocusedIndex(event.shiftKey);
                }
                break;
            case "ArrowUp":
            case "ArrowDown":
                if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    // => Equivalent to 'Home'/'End', at least on MacOS.
                    if (event.altKey) {
                        event.key === "ArrowUp"
                            ? this.focusedIndex = 0
                            : this.focusedIndex = this.focusableItems.length - 1;
                    } else {
                        setFocusedIndex(event.key === "ArrowUp");
                    }
                }
                break;
            case "Home":
            case "End":
                if (noKBModifiers) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.key === "Home"
                        ? this.focusedIndex = 0
                        : this.focusedIndex = this.focusableItems.length - 1;
                }
                break;
            default:
                return;
        }
        focusTarget = this.focusableItems[this.focusedIndex];
        focusTarget?.hasClass("component")
            ? (<IElementComponent<HTMLElement>>(<MenuItem>focusTarget).Content[0])?.focus()
            : focusTarget?.focus();
    }

    /**
     * Focusing of menu items on moving the pointer/mouse.
     * @param event The pointer event.
     */
    protected onPointerMove(event: PointerEvent): void {
        const target = event.target;
        if (target instanceof HTMLElement) {
            const menuItemIndex = this.focusableItems.findIndex((e) => e.DOM.contains(target));
            if (menuItemIndex !== -1) {
                this.focusedIndex = menuItemIndex;
                // In contrast to keyboard navigation, mouse movements do not focus any contained
                // component, but only the menu item itself, which otherwise would look unusual.
                this.focusableItems[this.focusedIndex]?.focus();
            } else {
                this.focusedIndex = -1;
                this.focus();
            }
        }
    }

    /**
     * Defocusing (`blur()`) of menu items when the pointer/mouse is moved outside the popup menu.
     * @param _event The pointer event.
     */
    protected onPointerLeave(_event: PointerEvent): void {
        for (const item of this.focusableItems) {
            item.blur();
        }
    }

    /**
     * Hides the pop-up menu when clicking outside the pop-up menu or when the window loses focus.
     * @param event The triggering event.
     */
    protected removePopupMenu(event: Event): void {
        if (this.Visible
            && event.target
            && (
                event.target instanceof Window
                || (this.DOM !== event.target && !this.DOM.contains(<Element>event.target))
            )) {
            this.hide();
        }
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new Menu();
        this.menuMutationObserver = new MutationObserver(records => {
            for (const record of records) {
                if (record.type === "childList") {
                    this.adjustMenuItemWidths();
                }
            }
        });
        return this;
    }
}

/**
 * Factory for `PopupMenu` components.
 */
export class PopupMenuFactory<T> extends ComponentFactory<PopupMenu> {
    /**
     * Create, set up and return PopupMenu component.
     * @param items The menu items for the popup menu.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns PopupMenu component.
     */
    public popupMenu(items: MenuEntry[], data?: T): PopupMenu {
        return this.setupComponent(new PopupMenu(...items), data);
    }
}

import { AChildren, ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_EVENT_INIT_DICT, HTMLElementWithChildren, IElementWithChildrenComponent, INodeComponent, mixin, NullableString, Phrases } from "@vanilla-ts/core";
import { Div, Span, Text } from "@vanilla-ts/dom";
import { IconButton, IconButtonOptions } from "./IconButton.js";
import { ScrollContainer } from "./ScrollContainer.js";


/////////////////////////////
// #region TabGroup class
/**
 * A (Div) class for the internal UI container of a tab group. This class has a `TabGroup` property,
 * that can be queried by instances of `Tab` in `onDidMount()` to detect its owner tab group.
 */
class TabGroupUI extends Div {
    protected tabGroupInstance: TabGroup;

    /**
     * Creates a new Div for the UI of a tab group.
     * @param tabGroup The tab group which uses this div as its UI container.
     */
    constructor(tabGroup: TabGroup) {
        super();
        this.tabGroupInstance = tabGroup;
    }

    /**
     * Get the tab group for which this UI container is used.
     */
    public get TabGroup(): TabGroup {
        return this.tabGroupInstance;
    }
}

/**
 * Apperance of the tab group (tab headers position).
 */
export enum TabGroupAppearance {
    /** Tab headers appear _above_ the tab content. */
    TOP = 0,
    /** Tab headers appear horizontally _after_ the tab content (depending on `dir="rtl"`). */
    END,
    /**
     * Tab headers appear horizontally _after_ the tab content (depending on `dir="rtl"`). The
     * vertical order of the tabs should be reversed (e.g. the first tab is placed on the bottom).
     */
    END_ALT,
    /** Tab headers appear _below_ the tab content. */
    BOTTOM,
    /** Tab headers appear horizontally _before_ the tab content (depending on `dir="rtl"`). */
    START,
    /**
     * Tab headers appear horizontally _before_ the tab content (depending on `dir="rtl"`). The
     * vertical order of the tabs should be reversed (e.g. the first tab is placed on the bottom).
     */
    START_ALT
}

/** Custom 'tab' event for tab groups. */
export class TabEvent extends ACustomComponentEvent<"tab", TabGroup, {
    /** The tab which was activated / deactivated. */
    Tab: Tab;
    /** `true`, if the tab was activated, otherwise`false`. */
    Active: boolean;
}> {
    /**
     * Create `tab` event.
     * @param sender The event emitter (always `TabGroup`).
     * @param tab The tab which is activated/deactivated.
     * @param active `true`, if the tab is was activated, otherwise `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: TabGroup, tab: Tab, active: boolean, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("tab", sender, { Tab: tab, Active: active }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Custom 'tab-close' event for tab groups. */
export class TabCloseEvent extends ACustomComponentEvent<"tab-close", TabGroup, {
    /** The tab which was closed (and disposed!). */
    Tab: Tab;
}> {
    /**
     * Create `tab-close` event.
     * @param sender The event emitter (always `TabGroup`).
     * @param tab The tab which is to be closed (and then disposed!).\
     * __Important note:__ This event can't be cancelled and the tab will be disposed of immediately
     * after the event has been dispatched to all listeners!
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: TabGroup, tab: Tab, customEventInitDict: EventInit = DEFAULT_EVENT_INIT_DICT) {
        super("tab-close", sender, { Tab: tab }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/** Additional event(s) for `TabGroup`. */
export interface TabGroupEventMap extends HTMLElementEventMap {
    /** A `tab` event occured (on activation/deactivation). */
    "tab": TabEvent;
    /** A `tab` event occured (on activation/deactivation). */
    "tab-close": TabCloseEvent;
}

/**
 * Component for displaying tabs.\
 * __Note__: The operations `append()`, `insert()`, `remove()`, `extract()`, `moveTo()` and
 * `moveToAt()` only perform minimal checks to ensure that the given tabs are qualified for the
 * respective operation, e.g. they belong to no other tab group or to this tab group. Since the UI
 * components of a tab (`Header`, `Content`) or the tab component itself are regular components,
 * they can easily be misused, e.g. appending them to arbitray other components is no problem but
 * leads to a completely undefined behavior.
 */
export class TabGroup<EventMap extends TabGroupEventMap = TabGroupEventMap> extends AElementComponentWithInternalUI<TabGroupUI, EventMap> {
    protected tabs: Tab[] = [];
    protected tabHeadersContainer: ScrollContainer;
    protected tabContent: IElementWithChildrenComponent<HTMLDivElement>;
    protected _appearance: TabGroupAppearance;
    protected activeTab?: Tab = undefined;

    /**
     * Creates a new tab group.
     * @param appearance The tab group appearance (tab headers position).
     */
    constructor(appearance: TabGroupAppearance = TabGroupAppearance.TOP) {
        super();
        super
            .initialize()
            .appearance(appearance);
    }

    /** @inheritdoc */
    public override get Text(): NullableString | null {
        let result = "";
        for (const tab of this.tabs) {
            result += (tab.Text + "\n");
        }
        return result.substring(0, result.length - 1);
    }

    /**
     * Get the tabs of this tab group (the array is always a copy).
     */
    public get Tabs(): Tab[] {
        return this.tabs.slice(0);
    }

    /**
     * Get/set the currently active tab.
     */
    public get Active(): Tab | undefined {
        return this.activeTab;
    }
    /** @inheritdoc */
    public set Active(v: Tab) {
        this.active(v);
    }

    /**
     * Activates a tab.
     * @param tab The tab to be activated.
     * @param makeVisisble If `true`, the tab group is scrolled (if needed) so that the tab is
     * visible to the user.
     * @returns This instance.
     */
    public active(tab?: Tab, makeVisisble: boolean = true): this {
        if (!tab || tab === this.activeTab || !this.tabs.includes(tab)) {
            return this;
        }
        for (const tab of this.tabs) {
            if (tab.Active) {
                this.emit(new TabEvent(this, tab, false));
            }
        }
        this.activeTab = tab;
        makeVisisble
            ? tab.DOM.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" }) // eslint-disable-line jsdoc/require-jsdoc
            : undefined;
        this.tabContent.remove();
        this.tabContent.append(tab.Content);
        this.emit(new TabEvent(this, tab, true));
        return this;
    }

    /**
     * Get/set the appearance of the tab group (tab headers position).
     */
    public get Appearance(): TabGroupAppearance {
        return this._appearance;
    }
    /** @inheritdoc */
    public set Appearance(v: TabGroupAppearance) {
        this.appearance(v);
    }

    /**
     * Sets the appearance of the tab group (tab headers position).
     * @param appearance The new appearance.
     * @returns This instance.
     */
    public appearance(appearance: TabGroupAppearance): this {
        if (this._appearance !== appearance) {
            this._appearance = appearance;
            this.tabHeadersContainer.horizontal(false);
            this.tabHeadersContainer.vertical(false);
            this.ui.removeClass("top", "end", "end-alt", "bottom", "start", "start-alt");
            let clazz: string;
            switch (this._appearance) {
                case TabGroupAppearance.TOP:
                    this.tabHeadersContainer.horizontal(true);
                    clazz = "top";
                    break;
                case TabGroupAppearance.END:
                    this.tabHeadersContainer.vertical(true);
                    clazz = "end";
                    break;
                case TabGroupAppearance.END_ALT:
                    this.tabHeadersContainer.vertical(true);
                    clazz = "end-alt";
                    break;
                case TabGroupAppearance.BOTTOM:
                    this.tabHeadersContainer.horizontal(true);
                    clazz = "bottom";
                    break;
                case TabGroupAppearance.START:
                    this.tabHeadersContainer.vertical(true);
                    clazz = "start";
                    break;
                case TabGroupAppearance.START_ALT:
                    this.tabHeadersContainer.vertical(true);
                    clazz = "start-alt";
                    break;
            }
            this.ui.addClass(clazz);
            this.syncTabs();
            this.tabHeadersContainer.sync();
            this.activeTab?.DOM.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" }); // eslint-disable-line jsdoc/require-jsdoc
        }
        return this;
    }

    /**
     * Makes the first tab the active tab.
     * @param makeVisisble If `true`, the tab group is scrolled (if needed) so that the tab is
     * visible to the user.
     * @returns This instance.
     */
    public first(makeVisisble: boolean = true): this {
        return this.active(this.tabs[0], makeVisisble);
    }

    /**
     * Makes the tab active, which preceeds the active tab. This function cycles, so if the first
     * tab is active the last tab is activated.
     * @param makeVisisble If `true`, the tab group is scrolled (if needed) so that the tab is
     * visible to the user.
     * @returns This instance.
     */
    public previous(makeVisisble: boolean = true): this {
        const index = this.tabs.indexOf(this.activeTab!);
        switch (index) {
            case -1:
                return this;
            case 0:
                return this.last(makeVisisble);
            default:
                return this.active(this.tabs[index - 1], makeVisisble);
        }
    }

    /**
     * Makes the tab active, which follows the active tab. This function cycles, so if the last
     * tab is active the first tab is activated.
     * @param makeVisisble If `true`, the tab group is scrolled (if needed) so that the tab is
     * visible to the user.
     * @returns This instance.
     */
    public next(makeVisisble: boolean = true): this {
        const index = this.tabs.indexOf(this.activeTab!);
        switch (index) {
            case -1:
                return this;
            case this.tabs.length - 1:
                return this.first(makeVisisble);
            default:
                return this.active(this.tabs[index + 1], makeVisisble);
        }
    }

    /**
     * Makes the last tab the active tab.
     * @param makeVisisble If `true`, the tab group is scrolled (if needed) so that the tab is
     * visible to the user.
     * @returns This instance.
     */
    public last(makeVisisble: boolean = true): this {
        return this.active(this.tabs.at(-1), makeVisisble);
    }

    /**
     * Requests the activation of a tab. The only reason for the existence of this function is that
     * tabs themselves can issue a request to be activated. The normal behavior is that every tab
     * calls this function if the user clicked inside the tab header or on the tab header itself
     * (except for the close button). The function can be used from elsewhere but this is considered
     * to be unusual.
     * @param tab The tab to be activated.
     * @returns `true`, if the tab was activated, `false`, if the tab wasn't activated. It is
     * impossible for the caller to determine why a tab was _not_ activated, so the class
     * `TabGroup` can/should be overridden if more detailed checks are required. Currently the
     * function always returns `true` (if `tab` is part of this tab group).
     */
    public requestActivateTab(tab: Tab): boolean {
        if (!this.tabs.includes(tab)) {
            return false;
        }
        this.active(tab);
        return true;
    }

    /**
     * Requests the closing of a tab. The only reason for the existence of this function is that
     * tabs themselves can issue a request to be closed. The function can be used from elsewhere but
     * this is considered to be unusual.
     * @param tab The tab to be closed.
     * @returns `true`, if the tab was closed, `false`, if the tab wasn't closed. It is impossible
     * for the caller to determine why a tab was _not_ closed, so the class `TabGroup` can/should be
     * overridden if more detailed checks are required. __Note:__ A tab that was closed by calling
     * `requestCloseTab` will also be disposed of! If this isn't the desired behavior, `remove()` or
     * `extract()` must be used.
     */
    public requestCloseTab(tab: Tab): boolean {
        const index = this.tabs.indexOf(tab);
        if (index === -1) {
            return false;
        }
        const wasActive = this.tabs[index] === this.activeTab;
        this.emit(new TabCloseEvent(this, tab));
        this.remove(tab);
        tab.dispose();
        wasActive
            ? this.active(this.tabs[index] ?? this.tabs.at(-1))
            : undefined;
        return true;
    }

    /**
     * Appends tabs to this tab group. If there were no tabs in this tab group before appending, the
     * first tab of `tabs` is activated.
     * @param tabs The tabs to be appended. Any tab, that is already part of this tab group or
     * connected or mounted elsewhere (header or content), is ignored.
     * @returns This instance.
     */
    public append(...tabs: (Tab | undefined | null)[]): this {
        const uniques = new Set(tabs.filter(e => e ?? e)) as Set<Tab>;
        if (uniques.size === 0) {
            return this;
        }
        const newTabs: Tab[] = [];
        for (const tab of uniques) {
            if (tab.Parent
                || tab.Connected
                || tab.Content.Parent
                || tab.Content.Connected
            ) {
                continue;
            }
            newTabs.push(tab);
        }
        const firstTab = newTabs[0];
        if (!firstTab) {
            return this;
        }
        const wasEmpty = this.tabs.length === 0;
        this.tabHeadersContainer.append(...newTabs);
        this.syncTabs();
        wasEmpty
            ? this.active(firstTab, true)
            : undefined;
        return this;
    }

    /**
     * Inserts tabs at a numeric index or the index of a tab reference of this tab group. This
     * function can be used to move tabs inside this tab group, e.g.
     * `this.insert(2, this.Tabs[3], this.Tabs.at(-1))`.
     * @param at The target index in this tab group. If `at` is lower than `0` it is considered to
     * be `0`. If `at` is greater than or equal to the number of tabs in this tab group the given
     * tabs will be appended. If `at` is a tab the tab will be inserted at the position of `at`
     * within this tab group. If this tab group has no tabs, `at` is ignored and the tabs are
     * appended.
     * @param tabs The tabs to insert. Any tab, that is already a part of another tab group, is
     * ignored. The only exception is tabs, that belong to this tab group (for moving tabs inside
     * this tab group).
     * @returns This instance.
     */
    public insert(at: number | Tab, ...tabs: (Tab | undefined | null)[]): this {
        const uniques = new Set(tabs.filter(e => e ?? e)) as Set<Tab>;
        if (uniques.size === 0) {
            return this;
        }
        const _tabs: Tab[] = [];
        /**
         * - Allow tabs from inside this tab group.
         * - Exclude tabs, that are already part of another tab group. `[...new Set(tabs)]` avoids
         *   multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
         */
        for (const tab of uniques) {
            if (this.tabs.includes(tab)) {
                _tabs.push(tab);
            } else if (tab.Parent
                || tab.Connected
                || tab.Content.Parent
                || tab.Content.Connected
            ) {
                continue;
            } else {
                _tabs.push(tab);
            }
        }
        this.tabHeadersContainer.insert(at, ..._tabs);
        this.syncTabs();
        return this;
    }

    /**
     * Removes tabs from this tab group.
     * @param tabs The tabs to be removed. If the length of `tabs` is `0`, _all_ tabs are removed
     * (but not disposed of). Any element of `tabs`, that isn't a tab of this tab group, is ignored.
     * @returns This instance.
     */
    public remove(...tabs: (Tab | undefined | null)[]): this {
        const tabsToRemove = tabs.length === 0
            ? this.tabs
            : [...new Set(tabs.filter(e => (e ?? e) && this.tabs.includes(e))) as Set<Tab>];
        if (tabsToRemove.length === 0) {
            return this;
        }
        // Get new tab to activate after removal (if `remove()` includes the active tab).
        const newActiveTab = tabs.length === 0
            ? undefined
            : this.getTabToActivateAfterRemoval(tabsToRemove);
        for (const tab of tabsToRemove) {
            tab.style("order", null);
            tab.Content.Parent?.remove(tab.Content);
        }
        this.tabHeadersContainer.remove(...tabsToRemove);
        this.syncTabs();
        this.active(newActiveTab);
        return this;
    }

    /**
     * Extracts tabs from this tab group. The extracted tabs will be pushed to the array given by
     * `to`.
     * @param to An array to which the extracted tabs will be pushed.
     * @param tabs The tabs to be extracted. If the length of `tabs` is `0`, _all_ tabs of this tab
     * group will be extracted and pushed to `to`. Any element of `tabs`, that isn't a tab of this
     * tab group, is ignored.
     * @returns This instance.
     */
    public extract(to: Tab[], ...tabs: (Tab | undefined | null)[]): this {
        if (tabs.length === 0) {
            for (const tab of this.tabs) {
                tab.style("order", null);
                tab.Content.Parent?.remove(tab.Content);
            }
            this.tabHeadersContainer.extract(to, ...tabs);
            this.syncTabs();
            return this;
        }
        const tabsToExtract = [...new Set(tabs.filter(e => (e ?? e) && this.tabs.includes(e))) as Set<Tab>];
        if (tabsToExtract.length === 0) {
            return this;
        }
        // Get new tab to activate after extraction (if `extract()` includes the active tab).
        const newActiveTab = this.getTabToActivateAfterRemoval(tabsToExtract);
        for (const tab of tabsToExtract) {
            tab.style("order", null);
            tab.Content.Parent?.remove(tab.Content);
        }
        this.tabHeadersContainer.extract(to, ...tabsToExtract);
        this.syncTabs();
        this.active(newActiveTab);
        return this;
    }

    /**
     * Extracts and appends tabs from this the instance to another `TabGroup` instance.
     * @param target The target instance to which the tabs are to be appended. If `target` is this
     * instance, an exception will be thrown.
     * @param tabs The tabs to be extracted and appended. If the length of `tabs` is `0`, _all_ tabs
     * of this tab group will be extracted and appended to `target`. Any element of `tabs`, that
     * isn't a tab of this tab group, is ignored.
     * @returns This instance.
     */
    public moveTo(target: TabGroup, ...tabs: (Tab | undefined | null)[]): this {
        if (target === this) {
            throw new Error("TabGroup: 'moveTo' isn't supported inside TabGroup.");
        }
        const extracted: Tab[] = [];
        this.extract(extracted, ...tabs);
        target.append(...extracted);
        // this.syncTabs(); // Done in `extract()`.
        return this;
    }

    /**
     * Extracts and inserts tabs from this the instance into another `TabGroup` instance.
     * @param target The target instance into which the tabs are to be inserted. If `target` is this
     * instance, an exception will be thrown.
     * @param at The target index in the tabs collection of `target`. If `at` is lower than `0` it
     * is considered to be `0`. If `at` is greater or equal to `target.Tabs.length` the given tabs
     * will be appended. If `at` is a tab in `target` the tabs will be inserted at the position of
     * `at` in `target.Tabs`. If `at` is not a tab of `target` an exception will be thrown.
     * @param tabs The tabs to be moved. If the length of `tabs` is `0`, _all_ tabs of this tab
     * group will be extracted and inserted into `target`. Any element of `tabs`, that isn't a tab
     * of this tab group, is ignored.
     * @returns This instance.
     */
    public moveToAt(target: TabGroup, at: number | Tab, ...tabs: (Tab | undefined | null)[]): this {
        if (target === this) {
            throw new Error("TabGroup: 'moveToAt' isn't supported inside TabGroup.");
        }
        if (typeof at !== "number" && !target.Tabs.includes(at)) {
            throw new Error("TabGroup: param 'at' for 'moveToAt' isn't a child of 'target'.");
        }
        const extracted: Tab[] = [];
        this.extract(extracted, ...tabs);
        target.insert(at, ...extracted);
        // this.syncTabs(); // Done in `extract()`.
        return this;
    }

    /**
     * Updates the internal array with tab components. The reference is always the container which
     * holds the tabs (`this.tabHeadersContainer`).
     */
    protected syncTabs(): void {
        this.tabs = <Tab[]>this.tabHeadersContainer.Children.slice(0);
        if (this.tabs.length === 0) {
            this.activeTab = undefined;
            return;
        }
        for (const tab of this.tabs) {
            tab.style("order", null);
        }
        if (this._appearance === TabGroupAppearance.START_ALT || this._appearance === TabGroupAppearance.END_ALT) {
            let l = 0;
            for (let i = this.tabs.length - 1; i > -1; i--) {
                this.tabs[i].style("order", (l++).toString());
            }
        }
    }

    /**
     * Returns the tab to be activated after removing some tabs.
     * @param tabsToRemove The tabs to be removed. Any element of `tabsToRemove`, that isn't a tab
     * of this tab group, is ignored.
     * @returns The tab that is to be activated after removing some tabs. If `undefined` is
     * returned, the active current tab is not included in the tabs to be removed or there is no tab
     * left that can be activated.
     */
    protected getTabToActivateAfterRemoval(tabsToRemove: Tab[]): Tab | undefined {
        if (!this.activeTab || !tabsToRemove.includes(this.activeTab)) {
            return undefined;
        }
        const uniques = [...new Set(tabsToRemove)].filter(e => this.tabs.includes(e));
        if (uniques.length === 0) {
            return undefined;
        }
        const sorted: { Index: number; Tab: Tab; }[] = []; // eslint-disable-line jsdoc/require-jsdoc
        for (const tab of uniques) {
            sorted.push({ Index: this.tabs.indexOf(tab), Tab: tab }); // eslint-disable-line jsdoc/require-jsdoc
        }
        let firstQualifiedIndexRightOfActiveTab = this.tabs.indexOf(this.activeTab) + 1;
        sorted.sort((a, b) => a.Index - b.Index);
        while (sorted.find(e => e.Index === firstQualifiedIndexRightOfActiveTab)) {
            firstQualifiedIndexRightOfActiveTab++;
        }
        return firstQualifiedIndexRightOfActiveTab >= this.tabs.length
            ? this.tabs[sorted[0].Index - 1]
            : this.tabs[firstQualifiedIndexRightOfActiveTab];
    }

    /**
     * Build UI of the component.
     * @returns This instance
     */
    protected buildUI(): this {
        this.ui = new TabGroupUI(this)
            .append(
                this.tabHeadersContainer = new ScrollContainer()
                    // .native(true)
                    .addClass(ScrollContainer.DefaultCSSClassName),
                this.tabContent = new Div()
                    .addClass("tab-content")
            );
        this.tabHeadersContainer.Content.addClass("tab-headers");
        return this;
    }

    /**
     * Removes _all_ child components from the tab group and this component (`this.ui`). All removed
     * components are also disposed of. Removal/disposal also includes every tab, so if the content
     * of tabs or the tabs themselves have to be preserved, tabs must be extracted or removed before
     * calling `clear()`.
     * @see {@link AElementComponentWithChildren.clear()}
     * @returns This instance.
     */
    public override clear(): this {
        const tabs: Tab[] = [];
        this.extract(tabs);
        for (const tab of tabs) {
            tab.dispose();
        }
        super.clear();
        return this;
    }
}

/**
 * Factory for `TabGroup` components.
 */
export class TabGroupFactory<T> extends ComponentFactory<TabGroup> {
    /**
     * Create, set up and return TabGroup component.
     * @param appearance The tab group appearance (tab headers position).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns TabGroup component.
     */
    public tabGroup(appearance: TabGroupAppearance = TabGroupAppearance.TOP, data?: T): TabGroup {
        return this.setupComponent(new TabGroup(appearance), data);
    }
}
// #endregion
/////////////////////////////


/////////////////////////////
// #region Tab class
/**
 * A tab group switches the content of a tab by removing/adding the content of the inner content
 * container. This makes it difficult to impossible for the content of a tab to track when it is
 * unmounted/mounted (for example to store/restore its scroll position). This class passes the
 * respective events forward to all of its children (the actual content of the tab).\
 * __Note:__ The `parent` given to `onBeforeMount()` and `onDidMount()` is not the Tab instance
 * itself but the inner opaque content container which holds an instance of `TabContentContainer` as
 * its only child!
 */
class TabContentContainer extends Div {
    /** @inheritdoc */
    constructor(protected ownerTab: Tab, ...phrase: Phrases) {
        super(...phrase);
        phrase.length > 0 && this.phrase(...phrase);
    }

    /** @inheritdoc */
    override onBeforeUnmount(): void {
        super.onBeforeUnmount();
        for (const child of this.ownerTab.Children) { child.onBeforeUnmount(); }
    }
    /** @inheritdoc */
    override onDidUnmount(): void {
        super.onDidUnmount();
        for (const child of this.ownerTab.Children) { child.onDidUnmount(); }
    }
    /** @inheritdoc */
    override onBeforeMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onBeforeMount(parent);
        for (const child of this.ownerTab.Children) { child.onBeforeMount(this); }
    }
    /** @inheritdoc */
    override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onDidMount(parent);
        for (const child of this.ownerTab.Children) { child.onDidMount(this); }
    }
}

/**
 * A tab for a TabGroup. This is a UI component that consists of a tab header (this component) and a
 * separate non-mounted tab content container which both will be used, mounted and handled by
 * `TabGroup`.
 */
export class Tab<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Div, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    protected headerContent: IElementWithChildrenComponent<HTMLDivElement>;
    protected closeTabBtn: IconButton;
    protected showCloseTabBtn: boolean;
    // Inner content container to make layout, content access/switching and tab switching easier.
    protected contentContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected tabGroup?: TabGroup;
    protected active = false;
    protected tabEventFnc = this.tabEvent.bind(this);

    /**
     * Creates a tab.
     * @param header The header content (components or string). In the case of a string, the header
     * content is a `Span` component with the string as the content. If `undefined` or an empty
     * array, the header is empty.
     * @param content The content for the tab. Any element of `content` that is a string is
     * converted into a `Text` component.
     * @param showCloseTabBtn If `true` (default), a standard close tab button is added to the tab
     * header, otherwise closing the tab must be done by other means (e.g. a keyboard shortcut).
     * @param closeTabBtnOptions Options for the standard close tab button.\
     * Default: `{ IconStart: null, Caption: ["X"], IconEnd: null, Title: null, Horizontal: true }`.
     */
    constructor(
        header?: (INodeComponent<Node> | undefined | null)[] | string,
        content?: (INodeComponent<Node> | undefined | null | string)[],
        showCloseTabBtn: boolean = true,
        closeTabBtnOptions: IconButtonOptions = { Caption: ["X"] } // eslint-disable-line jsdoc/require-jsdoc
    ) {
        super();
        super
            .initialize()
            .showCloseTabButton(showCloseTabBtn)
            .header(header)
            .append(...(content ? content.map(e => typeof e === "string" ? new Text(e) : e) : []))
            .CloseTabButton.options(closeTabBtnOptions);
    }

    /**
     * Get the TabGroup to which this tab belongs.
     */
    public get TabGroup(): TabGroup | undefined {
        return this.tabGroup;
    }

    /**
     * Get the status of this tab (active or inactive).
     */
    public get Active(): boolean {
        return this.active;
    }

    /** @inheritdoc */
    public override get Text(): NullableString | null {
        return this._dom.textContent + "\n" + this.contentContainer.Text;
    }

    /** @inheritdoc */
    public override disabled(disabled: boolean): this {
        super.disabled(disabled);
        this.contentContainer.disabled(disabled);
        return this;
    }

    /** @inheritdoc */
    public override parentDisabled(disabled: boolean): this {
        super.parentDisabled(disabled);
        this.contentContainer.parentDisabled(disabled);
        return this;
    }

    /**
     * Get the inner close tab button component. To be used for reconfiguring this button or for
     * getting its options.
     * @see {@link IconButton}
     */
    public get CloseTabButton(): IconButton {
        return this.closeTabBtn;
    }

    /**
     * Adds/removes a standard close tab button to/from the header of the tab.
     */
    public get ShowCloseTabButton(): boolean {
        return this.showCloseTabBtn;
    }
    /** @inheritdoc */
    public set ShowCloseTabButton(v: boolean) {
        this.showCloseTabButton(v);
    }

    /**
     * Adds/removes a standard close tab button to the header of the tab.
     * @param v `true`, if a standard close tab button is added to the header of the tab, otherwise
     * `false`.
     * @returns This instance.
     */
    public showCloseTabButton(v: boolean): this {
        if (v !== this.showCloseTabBtn) {
            this.showCloseTabBtn = v;
            this.showCloseTabBtn
                ? this.ui.insert(0, this.closeTabBtn)
                : this.ui.remove(this.closeTabBtn);
        }
        return this;
    }

    /**
     * Get the container component, that holds the header content (excluding the close button).
     */
    public get Header(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.headerContent;
    }

    /**
     * Set new content for the header (the close button is retained). Setting new content for the
     * the header _disposes the former content if `extractTo is `undefined`_!
     * @param header The new header content (components or string) In the case of a string, the
     * header content is a `Span` component with the string as the content. If `undefined` or an
     * empty array, the header is emptied.
     * @param extractTo An array, that, if given, will receive the former header component(s).
     * @returns This instance.
     */
    public header(header?: (INodeComponent<Node> | undefined | null)[] | string, extractTo?: INodeComponent<Node>[]): this {
        extractTo
            ? this.headerContent.extract(extractTo)
            : this.headerContent.clear();
        this.headerContent.removeClass("header-text");
        typeof header === "string"
            ? this.headerContent.append(new Span(header).addClass("header-text"))
            : this.headerContent.append(...(header ?? []));
        return this;
    }

    /**
     * Get the container component, that holds content of the tab.\
     * __Note:__ This property never should be used outside the context of a tab group. It only
     * exists to enable `TabGroup` to mount/unmount the content of tabs!
     */
    public get Content(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.contentContainer;
    }

    /**
     * Removes (_and disposes of_) all children from the tab (except the header).
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

    /** @inheritdoc */
    public override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren, EventMap>): void {
        super.onDidMount(parent);
        this.tabGroup = parent.Parent?.Parent instanceof TabGroup
            ? parent.Parent.Parent
            : undefined;
        // From now on handle 'tab' events.
        this.tabGroup?.on("tab", this.tabEventFnc);
    }

    /** @inheritdoc */
    public override onDidUnmount(): void {
        super.onDidUnmount();
        // Stop handling 'tab' events.
        this.tabGroup?.off("tab", this.tabEventFnc);
        this.tabGroup = undefined;
        this.active = false;
    }

    /**
     * Handles a tab groups `tab` event. If the tab passed as a member of the custom event `detail`
     * isn't this instance, handling the event must not do anything.
     * @param ev The custom tab event.
     */
    protected tabEvent(ev: TabEvent): void {
        if (ev.$.Tab == this) {
            this.active = ev.$.Active;
            this.active
                ? this.ui.addClass("active")
                : this.ui.removeClass("active");
        }
    }

    /**
     * Removes _and_ disposes of _all_ child components from the content container and this
     * component (`this.ui`).
     * @returns This instance.
     */
    protected override clearOwner(): this {
        // If the button is shown/mounted it is a child of `this.ui` and handled by `clear()`,
        // otherwise it has to be disposed of manually.
        this.showCloseTabBtn || this.closeTabBtn.dispose();
        // The content container is always cleared due to the `AChildren` but since it is never
        // mounted in `this.ui` it must be disposed of manually.
        // Remove first from a potential parent.
        this.contentContainer.Parent?.remove(this.contentContainer);
        this.contentContainer.dispose();
        super.clearOwner();
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        // The UI of a tab only consist of the tab header. The tab content (`this.contentContainer`)
        // is a separate container that will be mounted/unmounted by a `TabGroup` instance. See also
        // functions `clear()` and `dispose()`.
        // The close button is also a component that is only mounted/umounted on demand, so it has
        // to be handled separately in `clearOwner()`.
        this.ui = new Div()
            .addClass("header-container")
            .append(
                this.headerContent = new Div()
                    .addClass("header-content")
            )
            .on("pointerup", (ev) => {
                if (ev.target !== this.closeTabBtn.DOM) {
                    this.tabGroup?.requestActivateTab(this);
                }
            });
        this.closeTabBtn = new IconButton()
            .addClass("close", IconButton.DefaultCSSClassName)
            .on("click", () => this.tabGroup?.requestCloseTab(this));
        this.contentContainer = new TabContentContainer(this).addClass("content-container");
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets the `this.contentContainer`). */
        mixin(false, Tab, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface Tab<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponentWithInternalUI<Div, EventMap>, AChildren<HTMLElement, EventMap> { } // eslint-disable-line jsdoc/require-jsdoc

/**
 * Factory for `Tab` components.
 */
export class TabFactory<T> extends ComponentFactory<Tab> {
    /**
     * Create, set up and return Tab component.
     * @param header The header content (components or string). In the case of a string, the header
     * content is a `Span` component with the string as the content. If `undefined` or an empty
     * array, the header is empty.
     * @param content The content for the tab. Any element of `content` that is a string is
     * converted into a `Text` component.
     * @param showCloseTabBtn If `true` (default), a standard close tab button is added to the tab
     * header, otherwise closing the tab must be done by other means (e.g. a keyboard shortcut).
     * @param closeTabBtnOptions Options for the standard close tab button.\
     * Default: `{ IconStart: null, Caption: ["X"], IconEnd: null, Title: null, Horizontal: true }`.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns TabGroup component.
     */
    public tab(
        header?: INodeComponent<Node>[] | string,
        content?: (INodeComponent<Node> | undefined | null | string)[],
        showCloseTabBtn: boolean = true,
        closeTabBtnOptions: IconButtonOptions = { Caption: ["X"] }, // eslint-disable-line jsdoc/require-jsdoc
        data?: T
    ): Tab {
        return this.setupComponent(new Tab(header, content, showCloseTabBtn, closeTabBtnOptions), data);
    }
}
// #endregion
/////////////////////////////

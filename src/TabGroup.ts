import { ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, HTMLElementWithChildren, IElementWithChildrenComponent, INodeComponent, NullableBoolean, NullableString } from "@vanilla-ts/core";
import { Button, Div, P, Span } from "@vanilla-ts/dom";


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
    TOP = 0,
    RIGHT,
    BOTTOM,
    LEFT,
}

/**
 * Custom 'tab' event for tab groups.
 */
export class TabEvent<D extends object = {
    /** The tab which was activated / deactivated. */
    Tab: Tab;
    /** `true`, if the tab was activated, otherwise`false`. */
    Active: boolean;
}> extends ACustomComponentEvent<"tab", TabGroup, D> { }

/**
 * Additional event(s) for `Tab`.
 */
export interface TabGroupEventMap extends HTMLElementEventMap {
    /** A `tab` event occured (on activation/deactivation). */
    "tab": TabEvent;
}

/**
 * __Note__: The operations `append()`, `insert()`, `remove()`, `extract()`, `moveTo()` and
 * `moveToAt()` only perform minimal checks to ensure that the given tabs are qualified for the
 * respective operation, e.g. they belong to no other tab group or to this tab group. Since the UI
 * components of a tab (`Header`, `Content`) or the tab component itself are regular components,
 * they can easily be misused, e.g. appending them to arbitray other components is no problem but
 * leads to a completely undefined behavior.
 */
export class TabGroup<EventMap extends TabGroupEventMap = TabGroupEventMap> extends AElementComponentWithInternalUI<TabGroupUI, EventMap> {
    protected tabs: Tab[] = [];
    protected tabHeadersContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected tabContent: IElementWithChildrenComponent<HTMLDivElement>;
    protected _appearance: TabGroupAppearance;
    protected activeTab?: Tab = undefined;

    /**
     * Creates a new tab group.
     * @param appearance The tab group appearance (tab headers position).
     */
    constructor(appearance: TabGroupAppearance = TabGroupAppearance.TOP) {
        super();
        super.initialize()
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

    /** @inheritdoc */
    public override disabled(disabled: NullableBoolean): this {
        for (const tab of this.tabs) {
            tab.disabled(disabled);
        }
        super.disabled(disabled);
        return this;
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
                this._dom.dispatchEvent(new TabEvent("tab", this, { Tab: tab, Active: false })); // eslint-disable-line jsdoc/require-jsdoc
            }
        }
        this.activeTab = tab;
        makeVisisble
            ? tab.DOM.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" }) // eslint-disable-line jsdoc/require-jsdoc
            : undefined;
        this.tabContent.remove();
        this.tabContent.append(tab.Content);
        this._dom.dispatchEvent(new TabEvent("tab", this, { Tab: tab, Active: true })); // eslint-disable-line jsdoc/require-jsdoc
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
            this.ui.removeClass("top", "right", "bottom", "left");
            let clazz: string;
            switch (this._appearance) {
                case TabGroupAppearance.TOP:
                    clazz = "top";
                    break;
                case TabGroupAppearance.RIGHT:
                    clazz = "right";
                    break;
                case TabGroupAppearance.BOTTOM:
                    clazz = "bottom";
                    break;
                case TabGroupAppearance.LEFT:
                    clazz = "left";
                    break;
            }
            this.ui.addClass(clazz);
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
     * `requestCloseTab` will also be disposed! If this isn't the desired behavior, `remove()` or
     * `extract()` must be used.
     */
    public requestCloseTab(tab: Tab): boolean {
        const index = this.tabs.indexOf(tab);
        if (index === -1) {
            return false;
        }
        const wasActive = this.tabs[index] === this.activeTab;
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
    public append(...tabs: Tab[]): this {
        if (tabs.length === 0) {
            return this;
        }
        const newTabs: Tab[] = [];
        for (const tab of [...new Set(tabs)]) {
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
    public insert(at: number | Tab, ...tabs: Tab[]): this {
        if (tabs.length === 0) {
            return this;
        }
        const tabs_: Tab[] = [];
        /**
         * - Allow tabs from inside this tab group.
         * - Exclude tabs, that are already part of another tab group. `[...new Set(tabs)]` avoids
         *   multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
         */
        for (const tab of [...new Set(tabs)]) {
            if (this.tabs.includes(tab)) {
                tabs_.push(tab);
            } else if (tab.Parent
                || tab.Connected
                || tab.Content.Parent
                || tab.Content.Connected
            ) {
                continue;
            } else {
                tabs_.push(tab);
            }
        }
        this.tabHeadersContainer.insert(at, ...tabs_);
        this.syncTabs();
        return this;
    }

    /**
     * Removes tabs from this tab group.
     * @param tabs The tabs to be removed. If the length of `tabs` is `0`, _all_ tabs are removed
     * (but not disposed). Any element of `tabs`, that isn't a tab of this tab group, is ignored. 
     * @returns This instance.
     */
    public remove(...tabs: Tab[]): this {
        if (tabs.length === 0) {
            return this;
        }
        const tabsToRemove = [...new Set(tabs)].filter(e => this.tabs.includes(e));
        if (tabsToRemove.length === 0) {
            return this;
        }
        // Get new tab to activate after removal (if `remove()` includes the active tab).
        const newActiveTab = this.getTabToActivateAfterRemoval(tabsToRemove);
        for (const tab of tabsToRemove) {
            tab.Content.Parent?.remove(tab.Content);
        }
        this.tabHeadersContainer.remove(...tabsToRemove);
        this.syncTabs();
        this.active(newActiveTab);
        return this;
    }

    /**
     * Extracts tabs from this tab group. The extracted tabs will be pushed to the array given by
     * `to`. If the length of `tabs` is `0` _all_ tabs of this tab group will be extracted and
     * pushed to `to`.
     * @param to An array to which the extracted tabs will be pushed.
     * @param tabs The tabs to be extracted. Any element of `tabs`, that isn't a tab of this tab
     * group, is ignored.
     * @returns This instance.
     */
    public extract(to: Tab[], ...tabs: Tab[]): this {
        if (tabs.length === 0) {
            for (const tab of this.tabs) {
                tab.Content.Parent?.remove(tab.Content);
            }
            this.tabHeadersContainer.extract(to, ...tabs);
            this.syncTabs();
            return this;
        }
        const tabsToExtract = [...new Set(tabs)].filter(e => this.tabs.includes(e));
        if (tabsToExtract.length === 0) {
            return this;
        }
        // Get new tab to activate after extraction (if `extract()` includes the active tab).
        const newActiveTab = this.getTabToActivateAfterRemoval(tabsToExtract);
        for (const tab of tabsToExtract) {
            tab.Content.Parent?.remove(tab.Content);
        }
        this.tabHeadersContainer.extract(to, ...tabsToExtract);
        this.syncTabs();
        this.active(newActiveTab);
        return this;
    }

    /**
     * Extracts and appends tabs from this the instance to another `TabGroup` instance. If the
     * length of `tabs` is `0` _all_ tabs of this tab group will be extracted and appended to
     * `target`. If `target` is this instance, an exception will be thrown.
     * @param target The target instance to which the tabs are to be appended.
     * @param tabs The tabs to be extracted and appended. Any element of `tabs`, that isn't a tab of
     * this tab group, is ignored.
     * @returns This instance.
     */
    public moveTo(target: TabGroup, ...tabs: Tab[]): this {
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
     * Extracts and inserts tabs from this the instance into another `TabGroup` instance. If the
     * length of `tabs` is `0` _all_ tabs of this tab group will be extracted and inserted into
     * `target`. If `target` is this instance, an exception will be thrown.
     * @param target The target instance into which the tabs are to be inserted.
     * @param at The target index in the tabs collection of `target`. If `at` is lower than `0` it
     * is considered to be `0`. If `at` is greater or equal to `target.Tabs.length` the given tabs
     * will be appended. If `at` is a tab in `target` the tabs will be inserted at the position of
     * `at` in `target.Tabs`. If `at` is not a tab of `target` an exception will be thrown.
     * @param tabs The tabs to be moved. Any element of `tabs`, that isn't a tab of this tab group,
     * is ignored.
     * @returns This instance.
     */
    public moveToAt(target: TabGroup, at: number | Tab, ...tabs: Tab[]): this {
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
                this.tabHeadersContainer = new Div()
                    .addClass("tab-headers"),
                this.tabContent = new Div()
                    .addClass("tab-content")
            );
        return this;
    }

    /**
     * Removes _all_ child components from the tab group and this component (`this.ui`). All removed
     * components are also disposed. Removal/disposal also includes every tab, so if the content of
     * tabs or the tabs themselves have to be preserved, tabs must be extracted or removed before
     * calling `clear()`.
     * @see `AElementComponentWithChildren.clear()`.
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
 * Factory for TabGroup components.
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
 * Caption and title (tooltip) for the standard tab close button.
 */
export type TabCloseLabels = {
    /**
     * Caption for the standard tab close button.
     */
    Caption: string;
    /**
     * Title (tooltip) for the standard tab close button.
     */
    Title: string;
};

/**
 * A tab group switches the content of a tab by removing/adding the content of the inner content
 * container. This makes it difficult to impossible for the content of a tab to track when it is
 * unmounted/mounted (for example to store/restore its scroll position). This class passes the
 * respective events forward to all of its children (the actual content of the tab).\
 * __Note:__ The `parent` given to `onBeforeMount()` and `onDidMount()` is not the Tab instance
 * itself but the inner content container!
 */
class TabContentContainer extends Div {
    /** @inheritdoc */
    override onBeforeUnmount(): void {
        super.onBeforeUnmount();
        for (const child of this._children) { child.onBeforeUnmount(); }
    }
    /** @inheritdoc */
    override onDidUnmount(): void {
        super.onDidUnmount();
        for (const child of this._children) { child.onDidUnmount(); }
    }
    /** @inheritdoc */
    override onBeforeMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onBeforeMount(parent);
        for (const child of this._children) { child.onBeforeMount(this); }
    }
    /** @inheritdoc */
    override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onDidMount(parent);
        for (const child of this._children) { child.onDidMount(this); }
    }
}

/**
 * A tab for a TabGroup. This is a UI component that consists of a tab header (this component) and a
 * separate non-mounted tab content container which both will be used, mounted and handled by
 * `TabGroup`.
 */
export class Tab extends AElementComponentWithInternalUI<Div> {
    private cpHeader?: INodeComponent<Node>[] | string;
    private cpContent?: INodeComponent<Node>[] | string;
    private cpCloseBtn: boolean;
    private cpLabels: TabCloseLabels;
    protected closeBtn: Button;
    protected _labels: TabCloseLabels;
    protected _closeBtn: boolean;
    protected headerContent: IElementWithChildrenComponent<HTMLDivElement>;
    // Inner content container to make layout, content access/switching and tab switching easier.
    protected contentContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected tabGroup?: TabGroup;
    protected active = false;
    protected tabEventFnc = this.tabEvent.bind(this);

    /**
     * Creates a tab.
     * @param header The content for the header of the tab (components or string, in the case of a
     * string, the header content is a `Span` component with the string as the content).
     * @param content The content for the tab (components or string, in the case of a string, the
     * container content is a `P` component with the string as the content).
     * @param closeBtn If `true` (default), a standard close button is added to the tab header,
     * otherwise closing the tab must be done by other means (e.g. a keyboard shortcut).
     * @param labels The caption/title for the standard tab close button.
     */
    constructor(
        header?: INodeComponent<Node>[] | string,
        content?: INodeComponent<Node>[] | string,
        closeBtn: boolean = true,
        labels: TabCloseLabels = { Caption: "x", Title: "" } // eslint-disable-line jsdoc/require-jsdoc
    ) {
        super();
        this.cpHeader = header;
        this.cpContent = content;
        this.cpCloseBtn = closeBtn;
        this.cpLabels = labels;
        super.initialize();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        // The UI of a tab only consist of the tab header, the tab content (`this.contentContainer`)
        // is separate container that will be mounted/unmounted by a `TabGroup` instance. See also
        // functions `clear()` and `dispose()`.
        // The close button is also a component that is only mounted/umounted on demand, so it has
        // to be handled separately in `clear()` and `dispose()`.
        this.ui = new Div()
            .addClass("header-container")
            .append(
                this.headerContent = new Div()
                    .addClass("header-content")
            )
            .on("pointerup", (ev) => {
                if (ev.target !== this.closeBtn.DOM) {
                    this.tabGroup?.requestActivateTab(this);
                }
            });
        this.closeBtn = new Button()
            .addClass("close")
            .on("click", () => this.tabGroup?.requestCloseTab(this));
        this.labels(this.cpLabels);
        this.closeButton(this.cpCloseBtn);
        this.contentContainer = new TabContentContainer()
            .addClass("content-container");
        this.cpHeader !== undefined ? this.header(this.cpHeader) : undefined;
        this.cpContent !== undefined ? this.content(this.cpContent) : undefined;
        return this;
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
    public override disabled(disabled: NullableBoolean): this {
        this.contentContainer.disabled(disabled);
        super.disabled(disabled);
        return this;
    }

    /**
     * Adds/removes a standard tab close button to the header of the tab.
     */
    public get CloseButton(): boolean {
        return this._closeBtn;
    }
    /** @inheritdoc */
    public set CloseButton(v: boolean) {
        this.closeButton(v);
    }

    /**
     * Adds/removes a standard tab close button to the header of the tab.
     * @param v `true`, if a a standard tab close button is added to the header of the tab,
     * otherwise `false`.
     * @returns This instance.
     */
    public closeButton(v: boolean): this {
        if (v !== this._closeBtn) {
            this._closeBtn = v;
            this._closeBtn
                ? this.ui.insert(0, this.closeBtn)
                : this.ui.remove(this.closeBtn);
        }
        return this;
    }

    /**
     * Get the caption/title for the standard tab close button. Returns a _copy_ of the current
     * caption/title!
     */
    public get Labels(): TabCloseLabels {
        return { ...this._labels };
    }
    /** @inheritdoc */
    public set Labels(v: TabCloseLabels) {
        this.labels(v);
    }

    /**
     * Set new caption/title for the standard tab close button. No reference to the given labels
     * object is held!
     * @param labels The new caption/title.
     * @returns This instance.
     */
    public labels(labels: TabCloseLabels): this {
        this._labels = {
            /* eslint-disable jsdoc/require-jsdoc */
            Caption: labels.Caption ?? "x",
            Title: labels.Title ?? ""
            /* eslint-enable */
        };
        this.closeBtn
            .text(this._labels.Caption)
            .title(this._labels.Title);
        return this;
    }

    /**
     * Get the container component, that holds the header content (excluding the close button).
     */
    public get Header(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.headerContent;
    }

    /**
     * Set new content for the header (the close button is retained).
     * @param header The new header content (components or string, in the case of a string, the
     * header content is a `Span` component with the string as the content).
     * @param extractTo An array, that, if given, will receive the former header component(s).
     * @returns This instance.
     */
    public header(header: INodeComponent<Node>[] | string, extractTo?: INodeComponent<Node>[]): this {
        return this.swapChildren(true, header, extractTo);
    }

    /**
     * Get the container component, that holds content of the tab.
     */
    public get Content(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.contentContainer;
    }

    /**
     * Set new content.
     * @param content The new content (components or string, in the case of a string, the content is
     * a `P` component with the string as the content).
     * @param extractTo An array, that, if given, will receive the former content component(s).
     * @returns This instance.
     */
    public content(content: INodeComponent<Node>[] | string, extractTo?: INodeComponent<Node>[]): this {
        return this.swapChildren(false, content, extractTo);
    }

    /**
     * @see `header()` and `content()`.
     */
    /* eslint-disable-next-line jsdoc/require-jsdoc */
    protected swapChildren(ofHeader: boolean, content: INodeComponent<Node>[] | string, extractTo?: INodeComponent<Node>[]): this {
        const targetContainer = ofHeader ? this.headerContent : this.contentContainer;
        extractTo
            ? targetContainer.extract(extractTo)
            : targetContainer.clear();
        typeof content === "string"
            ? ofHeader
                ? targetContainer.append(new Span(content).title(content).addClass("header-text"))
                : targetContainer.append(new P(content))
            : targetContainer.append(...content);
        return this;
    }

    /**
     * Handles a tab groups `tab` event. If the tab passed as a member of the custom event `detail`
     * isn't this instance, handling the event must not do anything.
     * @param ev The custom tab event.
     */
    protected tabEvent(ev: TabEvent): void {
        if (ev.detail.Tab == this) {
            this.active = ev.detail.Active;
            this.active
                ? this.ui.addClass("active")
                : this.ui.removeClass("active");
        }
    }

    /** @inheritdoc */
    public override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
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
     * Removes _and_ disposes _all_ child components from the content container and this component
     * (`this.ui`).
     * @returns This instance.
     */
    public override clear(): this {
        this._closeBtn
            ? undefined                 // Child of `this.ui`, so handled by `super.clear()`.
            : this.closeBtn.dispose();  // Manual disposal necessary.
        // Manual disposal necessary since the container can be outside the regular component tree
        // if the tab isn't active.
        this.contentContainer.clear();
        super.clear();
        return this;
    }
}

/**
 * Factory for Tab components.
 */
export class TabFactory<T> extends ComponentFactory<Tab> {
    /**
     * Create, set up and return Tab component.
     * @param header The content for the header of the tab (components or string, in the case of a
     * string, the header content is a `Span` component with the string as the content).
     * @param content The content for the tab (components or string, in the case of a string, the
     * container content is a `P` component with the string as the content).
     * @param closeBtn If `true` (default), a standard close button is added to the tab header,
     * otherwise closing the tab must be done by other means (e.g. a keyboard shortcut).
     * @param labels The caption/title for the standard tab close button.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns TabGroup component.
     */
    public tab(header?: INodeComponent<Node>[] | string,
        content?: INodeComponent<Node>[] | string,
        closeBtn?: boolean,
        labels: TabCloseLabels = { Caption: "x", Title: "Close" }, // eslint-disable-line jsdoc/require-jsdoc
        data?: T): Tab {
        return this.setupComponent(new Tab(header, content, closeBtn, labels), data);
    }
}
// #endregion
/////////////////////////////

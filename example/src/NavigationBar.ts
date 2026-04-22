import { AChildren, AElementComponentWithInternalUI, IChildrenMixin, mixin } from "@vanilla-ts/core";
import { Nav, Ul } from "@vanilla-ts/dom";
import { DisclosureContainer, DisclosureContainerAppearance, DisclosureContainerEventMap } from "../../src/DisclosureContainer.js";
import { _ } from "./App.js";
import { EventBus } from "./EventBus.js";
import { NavLink } from "./NavLink.js";


/**
 * A collapsible container for navigation links. This component uses `DisclosureContainer` interally
 * without exposing all of its features (only `disclosed()`). This component also re-exports the
 * event map from `DisclosureContainer`. This makes it easier to add listeners to this class which
 * are specific to `DisclosureContainer`.
 */
export class NavigationBar extends AElementComponentWithInternalUI<DisclosureContainer, DisclosureContainerEventMap> {
    constructor() {
        super();
        this.initialize();
    }

    /**
     * Disclose/undisclose this component.
     * @param disclosed `true`, if the state of the internal disclosure container shall be
     * 'disclosed', otherwise `false`.
     * @returns This instance.
     */
    public disclosed(disclosed: boolean): this {
        this.ui.disclosed(disclosed);
        return this;
    }

    protected override clearOwner(): void {
        console.log("nav bar clear owner");
        super.clearOwner();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = _.disclosureContainer("Navigation")
            .addClass("navigation-bar")
            .appearance(DisclosureContainerAppearance.START_TOP)
            // .animatable(true)
            .on("disclose", (ev) => EventBus.emit("DiscloseNavigationBar", ev.$.Disclosed));
        const linkList = new Ul();
        this.setChildrenDOMTarget(linkList.DOM);
        this.append(
            new NavLink("#intro", "Intro"),
            new NavLink("#data-analysis", "Data Analysis"),
            new NavLink("#log", "Log"),
        );
        this.ui.append(new Nav(linkList));
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets the internal unordered list). */
        mixin(false, this, AChildren);
    }
}

export interface NavigationBar extends IChildrenMixin<NavLink> { }


/* eslint-disable jsdoc/require-jsdoc */

// new NavigationBar()
//     .append(new NavLink("#intro", "Intro"))
//     .append(new NavLink("#data-analysis", "Data Analysis"))
//     .append(new NavLink("#log", "Log"));
// .append(new P(""));

// class navlink2 extends NavLink {
//     Bla: string;
//     constructor() {
//         super("", "");
//     }
// }


// class XY<Child extends navlink2 = navlink2> extends NavigationBar<Child> {
// class XY extends NavigationBar<navlink2> {
//     constructor() {
//         super();
//         this.append(new navlink2());
//     }
// }

// const xy = new XY();
// xy.append(new navlink2());
// xy.append(new NavLink("", ""));
// xy.append(new P(""));
/* eslint-enable */

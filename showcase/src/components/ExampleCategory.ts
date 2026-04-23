import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { DisclosureContainer, DisclosureContainerAppearance } from "../../../src/DisclosureContainer.js";
import { $ } from "../App.js";
import { ShowcaseEventMap } from "../app/EventBus.js";
import { NAVIGATION_TARGET } from "../app/Navigation.js";
import { ExampleSelectorLabel } from "./ExampleSelectorLabel.js";


/**
 * Container for selecting an example category depending on the corresponding project.
 */
export class ExampleCategory extends AElementComponentWithInternalUI<DisclosureContainer> {
    constructor(title: string) {
        super();
        this.initialize(undefined, title);
    }

    /**
     * Get all labels in this category.
     */
    public get Labels(): ExampleSelectorLabel[] {
        return [...this.ui.ElementChildren as unknown as ExampleSelectorLabel[]];
    }

    /**
     * Append a label to this category.
     */
    public appendLabel(label: NAVIGATION_TARGET, eventMessage: ShowcaseEventMap["NavigateTo"]["Target"]): this {
        this.ui.append(new ExampleSelectorLabel(label, eventMessage));
        return this;
    }

    public disclosed(disclosed: boolean): this {
        this.ui.disclosed(disclosed);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(title: string): this {
        this.ui = $.disclosureContainer(title)
            .addClass("example-category")
            .appearance(DisclosureContainerAppearance.TOP_END)
            .animatable(true);
        this.ui.Header.on("pointerup", (_ev: PointerEvent) => this.ui.toggleDisclosed());
        return this;
    }
}

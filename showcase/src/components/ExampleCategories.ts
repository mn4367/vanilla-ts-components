import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { ScrollContainer } from "../../../src/ScrollContainer.js";
import { $ } from "../App.js";
import { NAVIGATION_TARGET, NAVIGATION_TARGETS } from "../app/Navigation.js";
import { ExampleCategory } from "./ExampleCategory.js";
import { ExampleSelectorLabel } from "./ExampleSelectorLabel.js";


/**
 * Container for all example categories.
 */
export class ExampleCategories extends AElementComponentWithInternalUI<ScrollContainer> {
    #introduction: Div;
    #core_examples: ExampleCategory;
    #dom_examples: ExampleCategory;
    #components_examples: ExampleCategory;

    constructor() {
        super();
        this.initialize()
            .#appendLabels();
    }

    /**
     * Get all example categories.
     */
    public get Categories(): ExampleCategory[] {
        // return [this.#introduction, this.#core_examples, this.#dom_examples, this.#components_examples];
        return [this.#core_examples, this.#dom_examples, this.#components_examples];
    }

    /**
     * Append all labels to all categories.
     */
    #appendLabels(): this {
        for (const target of NAVIGATION_TARGETS) {
            if (target.startsWith("#@core/")) {
                this.#core_examples.appendLabel(<NAVIGATION_TARGET>target.substring(7), target);
            } else if (target.startsWith("#@dom/")) {
                this.#dom_examples.appendLabel(<NAVIGATION_TARGET>target.substring(6), target);
            } else if (target.startsWith("#@components/")) {
                this.#components_examples.appendLabel(<NAVIGATION_TARGET>target.substring(13), target);
            } else if (target === "#Introduction") {
                // this.#introduction.appendLabel(<NAVIGATION_TARGET>target.substring(1), target);
                // this.#introduction.appendLabel(<NAVIGATION_TARGET>"Introduction", target);
                this.#introduction.append(new ExampleSelectorLabel(<NAVIGATION_TARGET>"Introduction", target));
            }
        }
        return this;
    }
    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = $.scrollContainer()
            .addClass("example-categories")
            .append(
                // this.#introduction = new ExampleCategory("Introduction"),
                this.#introduction = new Div().addClass("example-category"),
                this.#core_examples = new ExampleCategory("@Core"),
                this.#dom_examples = new ExampleCategory("@DOM"),//.disclosed(false),
                this.#components_examples = new ExampleCategory("@Components"),
            );
        return this;
    }
}

import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { P } from "@vanilla-ts/dom";
import { ShowcaseEventMap } from "../app/EventBus.js";
import { NAVIGATION_ISSUER_COMPONENTS, NAVIGATION_TARGET } from "../app/Navigation.js";


/**
 * Label for an example.
 */
export class ExampleSelectorLabel extends AElementComponentWithInternalUI<P> {
    #label: NAVIGATION_TARGET;
    #eventMessage: ShowcaseEventMap["NavigateTo"]["Target"];

    constructor(label: NAVIGATION_TARGET, eventMessage: ShowcaseEventMap["NavigateTo"]["Target"]) {
        super();
        this.#label = label;
        this.#eventMessage = eventMessage;
        this.initialize();

    }

    public get Label(): NAVIGATION_TARGET {
        return this.#label;
    }

    get EventMessage(): ShowcaseEventMap["NavigateTo"]["Target"] {
        return this.#eventMessage;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new P(this.#label)
            .addClass("example-selector-label")
            .tabbable(true)
            .on("pointerdown", (ev: PointerEvent) => ev.preventDefault())
            .on("click", (ev: PointerEvent) => {
                ev.preventDefault();
                this.focus();
            })
            .on("focus", (_ev: FocusEvent) => document.location.hash = this.#eventMessage);
        // Register this component in the navigation map for the respective target.
        NAVIGATION_ISSUER_COMPONENTS.set(this.#eventMessage, this);
        return this;
    }
}

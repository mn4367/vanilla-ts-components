import { AChildren, AElementComponentWithInternalUI, IChildrenMixin, mixin } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";

/**
 * Container for an example.
 */
export class ExampleContainer extends AElementComponentWithInternalUI<Div> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    constructor() {
        super();
        this.initialize();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Div()
            .addClass("example-container");
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.ui.DOM);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.ui`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface ExampleContainer extends IChildrenMixin { }

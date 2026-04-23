import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { H1, Header } from "@vanilla-ts/dom";
import { $ } from "../App.js";


/**
 * Create the header section of the app.
 */
export class AppHeader extends AElementComponentWithInternalUI<Header> {
    constructor() {
        super();
        this.initialize();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Header()
            .addClass("app-header")
            .append(
                new H1("@Vanilla.ts Showcase"),
                $.labeledCheckbox("Direction RTL")
                    .on("checked", (ev) => {
                        ev.$.Checked
                            ? document.documentElement.dir = "rtl"
                            : document.documentElement.removeAttribute("dir");
                    })
                // b = $.buttonRegular("Test")
                //     .on("click", () => console.log("clicked 0"))
                //     .on("click", (ev) => {
                //         console.log("Clicked 1");
                //         if (Date.now() - start > 2500) {
                //             ev.preventDefault();
                //             ev.stopImmediatePropagation();
                //         }
                //     })
                //     .on("click", () => console.log("clicked 2"))
                //     .on("pointerdown", (ev) => {
                //         // b.DOM.setPointerCapture(ev.pointerId);
                //         start = Date.now();
                //         console.log("pointerdown", ev.pointerId);
                //     })
                //     .on("pointerup", (ev) => {
                //         // b.DOM.releasePointerCapture(ev.pointerId);
                //         console.log("pointerup", ev.pointerId);
                //         // @ts-ignore
                //         b.bla();
                //     })
                //     .on("pointerleave", (ev) => {
                //         // b.DOM.releasePointerCapture(ev.pointerId);
                //         console.log("pointerleave", ev.pointerId);
                //     })
            );
        // Object.defineProperty(b, "bla", {
        //     value: () => {
        //         console.log("blubb");
        //     }
        // });
        return this;
    }
}

import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { Footer, P } from "@vanilla-ts/dom";


/**
 * Create the footer section of the app.
 */
export class AppFooter extends AElementComponentWithInternalUI<Footer> {
    constructor() {
        super();
        this.initialize();
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Footer()
            .addClass("app-footer")
            .append(
                new P("Footer/Statusbar")
            );
        return this;
    }
}

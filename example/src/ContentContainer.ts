import { Div } from "@vanilla-ts/dom";


/**
 * Just a primitive container for the main content of the app.
 */
export class ContentContainer extends Div {
    constructor() {
        super();
        this.addClass("content-container");
    }
}

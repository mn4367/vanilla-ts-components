import { Code, Div, P } from "@vanilla-ts/dom";


export class InvalidNavTarget extends Div {
    #invalidHref: Code;

    constructor() {
        super();
        this
            .addClass("invalid-nav-target")
            .append(new P("Invalid navigation target: ", this.#invalidHref = new Code("")));
    }

    public invalidNavTarget(href: string) {
        this.#invalidHref.text(href);
        return this;
    }
}

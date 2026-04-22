import { Br, Code, Div, P, Strong } from "@vanilla-ts/dom";
import { DateTime } from "./DateTime.js";


export class Intro extends Div {
    constructor() {
        super();
        this
            .addClass("intro")
            .append(
                new P(
                    new Strong("Hello  world!"),
                    new Br(), new Br(),
                    "This application is an example usage of some ",
                    new Code("Vanilla.ts DOM"),
                    " components.",
                    new Br(), new Br(),
                    new DateTime(),
                )
            );
    }
}

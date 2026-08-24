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
                    "This application is a primitive yet comprehensive example for using some of the ",
                    new Code("Vanilla.ts"),
                    " components.",
                    new Br(), new Br(),
                    new DateTime(),
                )
            );
    }
}

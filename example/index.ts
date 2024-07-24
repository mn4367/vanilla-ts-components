import { CSSClassNameFactory, mixinComponentFactories } from "@vanilla-ts/core";
import { P, PFactory } from "@vanilla-ts/dom";
import { LabeledContainer, LabeledContainerFactory } from "../src/LabeledContainer.js";

const $ = new (mixinComponentFactories(
    CSSClassNameFactory,
    LabeledContainerFactory,
    PFactory)
)("vts", false);

let lc: LabeledContainer;
let p: P;

document.body.append(
    (lc = $.labeledContainer("Example")
        .append(
            p = $.p("Hello world!")
        ))
        .DOM
);

console.log(lc, p);

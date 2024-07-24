import { buildComponentFactoryClass, CSSClassNameFactory } from "@vanilla-ts/core";
import { P, PFactory } from "@vanilla-ts/dom";
import { LabeledContainer, LabeledContainerFactory } from "../src";

const $ = new (buildComponentFactoryClass(
    CSSClassNameFactory,
    LabeledContainerFactory,
    PFactory)
)("vts", true);

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
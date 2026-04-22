console.time("app init");

import { WrappedDOMElementComponentWithChildren } from "@vanilla-ts/core";
import { P } from "@vanilla-ts/dom";


const appRoot = new WrappedDOMElementComponentWithChildren(document.getElementById("app") || document.body);
appRoot.append(
    new P("Hello world!").addClass("hello-world")
);

console.timeEnd("app init");

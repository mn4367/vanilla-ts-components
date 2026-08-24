import { Br, Button, Code, Div, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<div>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div%.

**Class:** \`@vanilla-ts/dom/Div\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Br, Button, Code, Div, P } from "@vanilla-ts/dom";

const example = new Div(new P("Example ", new Code("<div>").dir("ltr"), "."))
    .style({
        padding: "1rem",
        borderRadius: "1rem",
        border: "1px solid lightgray"
    })
    .append(
        new Br(),
        new P("Lorem ipsum dolor sit amet."),
        new Button("Click me!")
            .addClass("regular")
            .on("click", () => alert("Thank you!"))
    );

new VTS_App(document.body).append(example);
\`\`\`
`;


export class DivEx extends BaseExample {
    constructor() {
        super("Div");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Div(new P("Example ", new Code("<div>").dir("ltr"), "."))
                    .style({
                        padding: "1rem",
                        borderRadius: "1rem",
                        border: "1px solid lightgray"
                    })
                    .append(
                        new Br(),
                        new P("Lorem ipsum dolor sit amet."),
                        new Button("Click me!")
                            .addClass("regular")
                            .on("click", () => alert("Thank you!"))
                    )
            ]),
            this.markdown(example),
        );
    }
}

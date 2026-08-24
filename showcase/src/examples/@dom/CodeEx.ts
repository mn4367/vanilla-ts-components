import { Code, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<code>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code%.

**Class:** \`@vanilla-ts/dom/Code\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Code, P } from "@vanilla-ts/dom";

const c = new Code("dolor").style("background", "lightgray");

const example = new P("Lorem ipsum ", c, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class CodeEx extends BaseExample {
    constructor() {
        super("Code");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const c = new Code("dolor").style("background", "lightgray");
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum ", c, " sit amet.")
            ], [c]),
            this.markdown(example),
        );
    }
}

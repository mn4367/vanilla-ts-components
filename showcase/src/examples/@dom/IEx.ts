import { I, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<i>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/i%.

**Class:** \`@vanilla-ts/dom/I\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { I, P } from "@vanilla-ts/dom";

const i = new I("dolor");

const example = new P("Lorem ipsum ", i, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class IEx extends BaseExample {
    constructor() {
        super("I");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let i = new I("dolor");
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum ", i, " sit amet."),
            ], [i]),
            this.markdown(example),
        );
    }
}

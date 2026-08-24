import { P, Strong } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<strong>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong%.

**Class:** \`@vanilla-ts/dom/Strong\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { P, Strong } from "@vanilla-ts/dom";

const strong = new Strong("dolor");

const example = new P("Lorem ipsum ", strong, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class StrongEx extends BaseExample {
    constructor() {
        super("Strong");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const strong = new Strong("dolor");
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum ", strong, " sit amet.")
            ], [strong]),
            this.markdown(example),
        );
    }
}

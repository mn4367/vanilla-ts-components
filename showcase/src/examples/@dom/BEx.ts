import { B, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<b>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/b%.

**Class:** \`@vanilla-ts/dom/B\`
`;

const example = `
### Code example

\`\`\`
import { B, P } from "@vanilla-ts/dom";

const b = new B("dolor");

const p = new P("Lorem ipsum ", b, " sit amet.");
\`\`\`
`;


export class BEx extends BaseExample {
    constructor() {
        super("B");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const b = new B("dolor");
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum ", b, " sit amet.")
            ], [b]),
            this.markdown(example),
        );
    }
}

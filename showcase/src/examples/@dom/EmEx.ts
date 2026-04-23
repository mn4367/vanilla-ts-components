import { Em, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<em>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em%.

**Class:** \`@vanilla-ts/dom/Em\`
`;

const example = `
### Code example

\`\`\`
import { Em, P } from "@vanilla-ts/dom";

const em = new Em("dolor");

const p = new P("Lorem ipsum ", em, " sit amet.");
\`\`\`
`;


export class EmEx extends BaseExample {
    constructor() {
        super("Em");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let em = new Em("dolor");
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum ", em, " sit amet."),
            ], [em]),
            this.markdown(example),
        );
    }
}

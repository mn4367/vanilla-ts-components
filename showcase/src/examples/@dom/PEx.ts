import { B, Em, I, P, Strong } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<p>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p%. This component is
also available as a §@components/LabeledParagraph§.

**Class:** \`@vanilla-ts/dom/P\`
`;

const example = `
### Code example

\`\`\`
import { B, Em, I, P, Strong } from "@vanilla-ts/dom";

// Create some phrasing content for the paragraph
const b = new B(" ipsum");
const e = new Em(" dolor");
const s = new Strong(" sit");
const i = new I(" amet");

const p = new P("Lorem ", b, e, s, i, ".");
\`\`\`
`;


export class PEx extends BaseExample {
    constructor() {
        super("P");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem",
                    new B(" ipsum"),
                    new Em(" dolor"),
                    new Strong(" sit"),
                    new I(" amet"),
                    ".",
                ),
            ]),
            this.markdown(example),
        );
    }
}

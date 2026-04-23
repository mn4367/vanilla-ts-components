import { P, Span } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<span>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span%.

**Class:** \`@vanilla-ts/dom/Span\`
`;

const example = `
### Code example

\`\`\`
import { P, Span } from "@vanilla-ts/dom";

const span = new Span("dolor").style("textDecoration", "underline");

const p = new P("Lorem ipsum ", span, " sit amet.");
\`\`\`
`;


export class SpanEx extends BaseExample {
    constructor() {
        super("Span");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let span = new Span("dolor").style("textDecoration", "underline");
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum ", span, " sit amet."),
            ], [span]),
            this.markdown(example),
        );
    }
}

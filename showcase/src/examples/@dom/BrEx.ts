import { Br, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<br>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/br%.

**Class:** \`@vanilla-ts/dom/Br\`
`;

const example = `
### Code example

\`\`\`
import { Br, P } from "@vanilla-ts/dom";

new P("Lorem ipsum dolor", new Br(), "sit amet.")
\`\`\`
`;


export class BrEx extends BaseExample {
    constructor() {
        super("Br");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new P("Lorem ipsum dolor", new Br(), "sit amet.")
            ]),
            this.markdown(example),
        );
    }
}

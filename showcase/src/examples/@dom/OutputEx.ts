import { Output } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<output>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output%.

**Class:** \`@vanilla-ts/dom/Output\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Output } from "@vanilla-ts/dom";

const example = new Output();

new VTS_App(document.body).append(example);

\`\`\`
`;


export class OutputEx extends BaseExample {
    constructor() {
        super("Output");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Output()
            ]),
            this.markdown(example),
        );
    }
}

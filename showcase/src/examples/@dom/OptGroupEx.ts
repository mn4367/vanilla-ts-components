import { OptGroup } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<optgroup>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup%.

**Class:** \`@vanilla-ts/dom/OptGroup\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { OptGroup } from "@vanilla-ts/dom";

const example = new OptGroup();

new VTS_App(document.body).append(example);
\`\`\`
`;


export class OptGroupEx extends BaseExample {
    constructor() {
        super("OptGroup");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new OptGroup("label")
            ]),
            this.markdown(example),
        );
    }
}

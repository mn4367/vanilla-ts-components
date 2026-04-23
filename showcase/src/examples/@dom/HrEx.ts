import { Hr } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<hr>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr%.

**Class:** \`@vanilla-ts/dom/Hr\`
`;

const example = `
### Code example

\`\`\`
import { Hr } from "@vanilla-ts/dom";

const hr = new Hr();
\`\`\`
`;


export class HrEx extends BaseExample {
    constructor() {
        super("Hr");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Hr(),
            ]),
            this.markdown(example),
        );
    }
}

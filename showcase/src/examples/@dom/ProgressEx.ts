import { Progress } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<progress>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress%.
This component is also available as a §@components/LabeledProgress§.

**Class:** \`@vanilla-ts/dom/Progress\`
`;

const example = `
### Code example

\`\`\`
import { Progress } from "@vanilla-ts/dom";

new Progress();

\`\`\`
`;


export class ProgressEx extends BaseExample {
    constructor() {
        super("Progress");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Progress()
            ]),
            this.markdown(example),
        );
    }
}

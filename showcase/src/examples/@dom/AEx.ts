import { A } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native DOM anchor element
(%\`<a>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a%).
This component is also available as a §@components/LabeledAnchor§.

**Class:** \`@vanilla-ts/dom/A\`
`;

const example = `
### Code example

\`\`\`
import { A } from "@vanilla-ts/dom";

const a = new A(
    "https://github.com/mn4367/vanilla-ts-components",
    "Go to vanilla-ts-components at GitHub."
)
    .target("_blank");
\`\`\`
`;


export class AEx extends BaseExample {
    constructor() {
        super("A");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new A(
                    "https://github.com/mn4367/vanilla-ts-components",
                    "Go to vanilla-ts-components at GitHub."
                ).target("_blank")
            ]),
            this.markdown(example),
        );
    }
}

import { RangeInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native DOM input range element
(%\`<input type="range">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range%).
This component is also available as a §@components/LabeledRangeInput§.

**Class:** \`@vanilla-ts/dom/RangeInput\`
`;

const example = `
### Code example

\`\`\`
import { RangeInput } from "@vanilla-ts/dom";

new RangeInput();

\`\`\`
`;


export class RangeInputEx extends BaseExample {
    constructor() {
        super("RangeInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new RangeInput()
            ]),
            this.markdown(example),
        );
    }
}

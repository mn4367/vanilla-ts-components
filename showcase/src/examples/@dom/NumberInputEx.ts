import { NumberInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native number input DOM element
(%\`<input type="number">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number%).
This component is also available as a §@components/LabeledNumberInput§.

**Class:** \`@vanilla-ts/dom/NumberInput\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { NumberInput } from "@vanilla-ts/dom";

const example = new NumberInput()
    .value("22")
    .min("2")
    .max("42")
    .step("2");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class NumberInputEx extends BaseExample {
    constructor() {
        super("NumberInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new NumberInput()
                    .value("22")
                    .min("2")
                    .max("44")
                    .step("2")
            ]),
            this.markdown(example),
        );
    }
}

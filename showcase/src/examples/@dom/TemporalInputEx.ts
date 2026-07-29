import { TemporalInput, TemporalType } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates various native DOM input elements:

- %\`<input type="date">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date%
- %\`<input type="datetime-local">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local%
- %\`<input type="time">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time%
- %\`<input type="month">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month%
- %\`<input type="week">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week%

This component is also available as a §@components/LabeledTemporalInput§.

**Class:** \`@vanilla-ts/dom/TemporalInput\`
`;

const example = `
### Code example

\`\`\`
import { TemporalInput } from "@vanilla-ts/dom";

new TemporalInput();

\`\`\`
`;


export class TemporalInputEx extends BaseExample {
    constructor() {
        super("TemporalInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new TemporalInput(TemporalType.DateTimeSeconds),
            ]),
            this.markdown(example),
        );
    }
}

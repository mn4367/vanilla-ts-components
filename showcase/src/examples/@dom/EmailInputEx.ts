import { EmailInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native email input DOM element
(%\`<input type="email">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email%).
This component is also available as a §@components/LabeledEmailInput§.

**Class:** \`@vanilla-ts/dom/EmailInput\`
`;

const example = `
### Code example

\`\`\`
import { EmailInput } from "@vanilla-ts/dom";

const input = new EmailInput().placeholder("sophie@example.com");
\`\`\`
`;


export class EmailInputEx extends BaseExample {
    constructor() {
        super("EmailInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new EmailInput().placeholder("sophie@example.com")
            ]),
            this.markdown(example),
        );
    }
}

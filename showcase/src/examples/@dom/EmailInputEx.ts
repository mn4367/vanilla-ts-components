import { EmailInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native email input DOM element
(%\`<input type="email">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email%).
It lets users enter and edit an email address and provides built-in validation for the expected
syntax. The control can optionally accept multiple addresses.
This component is also available as a §@components/LabeledEmailInput§.

**Class:** \`@vanilla-ts/dom/EmailInput\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { EmailInput } from "@vanilla-ts/dom";

const example = new EmailInput().placeholder("sophie@example.com");

new VTS_App(document.body).append(example);
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

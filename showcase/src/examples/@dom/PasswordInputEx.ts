import { PasswordInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native password input DOM element
(%\`<input type="password">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password%).
This component is also available as a §@components/LabeledPasswordInput§.

**Class:** \`@vanilla-ts/dom/PasswordInput\`
`;

const example = `
### Code example

\`\`\`
import { PasswordInput } from "@vanilla-ts/dom";

const input = new PasswordInput().placeholder("Enter password");
\`\`\`
`;


export class PasswordInputEx extends BaseExample {
    constructor() {
        super("PasswordInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new PasswordInput().placeholder("Enter password")
            ]),
            this.markdown(example),
        );
    }
}

import { Div } from "@vanilla-ts/dom";
import { LabeledPasswordInput } from "../../../../src/LabeledPasswordInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/PasswordInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledPasswordInput\`
`;

const example = `
### Code example

\`\`\`
import { LabeledPasswordInput } from "@vanilla-ts/components";

const input = new LabeledPasswordInput("Password")
    .addClass("labeled-password-input")
    .passwordInput(c => c.placeholder("Enter password"));
\`\`\`
`;


export class LabeledPasswordInputEx extends BaseExample {
    #lInput: LabeledPasswordInput;

    constructor() {
        super("LabeledPasswordInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lInput = $
            .labeledPasswordInput("Password")
            .passwordInput(c => c.placeholder("Enter password"));
        this.append(
            this.markdown(intro),
            this.example([this.#lInput]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lInput], true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}

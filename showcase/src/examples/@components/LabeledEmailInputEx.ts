import { Div } from "@vanilla-ts/dom";
import { LabeledEmailInput } from "../../../../src/LabeledEmailInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with an §@dom/EmailInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledEmailInput\`
`;

const example = `
### Code example

\`\`\`
import { LabeledEmailInput } from "@vanilla-ts/components";

const input = new LabeledEmailInput("Business contact")
    .addClass("labeled-email-input")
    .emailInput(c => c.placeholder("sophie@example.com"));
\`\`\`
`;


export class LabeledEmailInputEx extends BaseExample {
    #lInput: LabeledEmailInput;

    constructor() {
        super("LabeledEmailInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lInput = $
            .labeledEmailInput("Business contact")
            .emailInput(c => c.placeholder("sophie@example.com"));
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

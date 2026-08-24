import { Div } from "@vanilla-ts/dom";
import { LabeledTextInput } from "../../../../src/LabeledTextInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/TextInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledTextInput\`
`;

const example = `
### Code example

\`\`\`
import { LabeledTextInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledTextInput("Username")
    .addClass("labeled-text-input")
    .textInput(c => c.placeholder("Enter your name here"));

new VTS_App(document.body).append(example);
\`\`\`
`;


export class LabeledTextInputEx extends BaseExample {
    #lInput: LabeledTextInput;

    constructor() {
        super("LabeledTextInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lInput = $
            .labeledTextInput("Username")
            .textInput(c => c.placeholder("Enter your name here"));
        this.append(
            this.markdown(intro),
            this.example([this.#lInput]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lInput], true, "start", "start")
                ),
            this.markdown(example),
        );
    }
}

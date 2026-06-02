import { Div } from "@vanilla-ts/dom";
import { LabeledRadioButton } from "../../../../src/LabeledRadioButton.js";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/RadioButton§ and a §@dom/Label§ representing a caption for the component.
This class mainly exists as a building block for §@components/RadioButtonGroup§s and
§@components/LabeledRadioButtonGroup§s.

**Class:** \`@vanilla-ts/components/LabeledRadioButton\`
`;

const example = `
### Code example

\`\`\`
import { LabeledRadioButton } from "@vanilla-ts/components";

const lrb = new LabeledRadioButton("Beta versions")
    .addClass("labeled-radio-button")
    .checked(true);
    //.checked(false);
    //.toggle(true);
\`\`\`

For easier handling, the labeled radio button component emits its own event \`CheckedEvent\`; see
the corresponding documentation in the \`LabeledRadioButton\` class.
`;


export class LabeledRadioButtonEx extends BaseExample {
    #lrb: LabeledRadioButton;
    #rbgCb: RadioButtonGroup;

    constructor() {
        super("LabeledRadioButton");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                this.#lrb = $.labeledRadioButton("Beta versions")
                    .on("checked", () => this.#rbgCb.value(this.#lrb.Checked ? "checked" : "unchecked"))
            ]),
            this.markdown("### Label position, label alignment and radio button state"),
            new Div()
                .addClass("example-properties")
                .append(
                    this.#rbgCb = $.radioButtonGroup([
                        { Label: "Checked", Value: "checked" },
                        { Label: "Unchecked", Value: "unchecked" },
                    ], "rbg-labeled-radio-button-ex")
                        .value("unchecked")
                        .on("checked", (ev) => {
                            switch (ev.$.Sender.Value) {
                                case "checked":
                                    this.#lrb.checked(true);
                                    break;
                                case "unchecked":
                                    this.#lrb.checked(false);
                                    break;
                                default:
                                    break;
                            }
                        }),
                    ...labeledComponentLabelFlags([this.#lrb], true, "end", "start"),
                    $.labeledCheckbox("Allow toggling the state")
                        .on("checked", () => this.#lrb.toggle(!this.#lrb.Toggle)),
                ),
            this.markdown(example),
        );
    }
}

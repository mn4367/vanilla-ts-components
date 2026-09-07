import { Orientation } from "@vanilla-ts/core";
import { Div, Option } from "@vanilla-ts/dom";
import { LabeledSelect } from "../../../../src/LabeledSelect.js";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component that groups multiple §@components/LabeledRadioButton§s into a single component.

**Class:** \`@vanilla-ts/components/RadioButtonGroup\`
`;

const example = `
### Code example

\`\`\`
import { RadioButtonGroup } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new RadioButtonGroup(
    [
        { Label: "Regular updates", Value: "regular" },
        { Label: "Beta versions", Value: "beta" },
        { Label: "Nightly builds", Value: "nightly" },
    ],
    "software-updates" // Group name
)
    .addClass("radio-button-group")
    .value("beta");
    //.toggle(true);

new VTS_App(document.body).append(example);
\`\`\`

Grouping is done by attaching the same
%name|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio#defining_a_radio_group%
to all radio buttons in the group. The component makes it easier to handle multiple radio buttons
with functions like \`value()\`, \`toggle()\` etc. The group also emits a custom \`CheckedEvent\`
for easier handling of the checked state of the radio buttons; see the corresponding documentation
in the \`RadioButtonGroup\` class.
`;


export class RadioButtonGroupEx extends BaseExample {
    #rbg: RadioButtonGroup;
    #lsAlignment: LabeledSelect;

    constructor() {
        super("RadioButtonGroup");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                this.#rbg = $.radioButtonGroup(
                    [
                        { Label: "Regular updates", Value: "regular" },
                        { Label: "Beta versions", Value: "beta" },
                        { Label: "Nightly builds", Value: "nightly" },
                    ],
                    "software-updates"
                )
                    .value("beta")
            ]),
            this.markdown("### Alignment, label position, label alignment and radio button state"),
            new Div()
                .addClass("example-properties")
                .append(
                    this.#lsAlignment = $.labeledSelect("Alignment", [
                        new Option("VERTICAL").value("vertical"),
                        new Option("HORIZONTAL").value("horizontal"),
                    ])
                        .value("vertical")
                        .on("change", () => {
                            switch (this.#lsAlignment.Value) {
                                case "vertical":
                                    this.#rbg.orientation(Orientation.VERTICAL);
                                    break;
                                case "horizontal":
                                    this.#rbg.orientation(Orientation.HORIZONTAL);
                                    break;
                                default:
                                    break;
                            }
                        }),
                    ...labeledComponentLabelFlags([this.#rbg], true, "end", "start"),
                    $.labeledCheckbox("Allow toggling the state")
                        .on("checked", () => this.#rbg.toggle(!this.#rbg.Toggle)),
                ),
            this.markdown(example),
        );
    }
}

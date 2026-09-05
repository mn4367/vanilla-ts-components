import { Option, Orientation } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { LabeledRadioButtonGroup } from "../../../../src/LabeledRadioButtonGroup.js";
import { LabeledSelect } from "../../../../src/LabeledSelect.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component that groups multiple §@components/LabeledRadioButton§s into a single component that is
similar to a §@components/LabeledContainer§.

**Class:** \`@vanilla-ts/components/LabeledRadioButtonGroup\`
`;

const example = `
### Code example

\`\`\`
import { LabeledRadioButtonGroup } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledRadioButtonGroup(
    "Your position",
    [
        { Label: "Software developer", Value: "software_developer" },
        { Label: "Security engineer", Value: "security_engineer" },
        { Label: "UX/UI designer", Value: "ux_ui_designer" },
        { Label: "DevOps engineer", Value: "devops_engineer" },
        { Label: "Other", Value: "other" },
    ],
    "your-position" // Group name
)
    .addClass("labeled-radio-button-group")
    .value("other");
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


export class LabeledRadioButtonGroupEx extends BaseExample {
    #lrbg: LabeledRadioButtonGroup;
    #lsAlignment: LabeledSelect;

    constructor() {
        super("LabeledRadioButtonGroup");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                this.#lrbg = $.labeledRadioButtonGroup(
                    "Your position",
                    [
                        { Label: "Software developer", Value: "software_developer" },
                        { Label: "Security engineer", Value: "security_engineer" },
                        { Label: "UX/UI designer", Value: "ux_ui_designer" },
                        { Label: "DevOps engineer", Value: "devops_engineer" },
                        { Label: "Other", Value: "other" },
                    ],
                    "your-position"
                )
                    .value("other")
            ]),
            this.markdown("### Alignment, label positions, label alignments and radio button states"),
            new Div()
                .addClass("example-properties")
                .append(
                    this.markdown("\u2014 Outer labeled container \u2014"),
                    ...labeledComponentLabelFlags([this.#lrbg], false, "top", "start"),
                    $.br(),
                    this.markdown("\u2014 Inner radio button group \u2014"),
                    this.#lsAlignment = $.labeledSelect("Alignment", [
                        new Option("VERTICAL").value("vertical"),
                        new Option("HORIZONTAL").value("horizontal"),
                    ])
                        .on("change", () => {
                            switch (this.#lsAlignment.Value) {
                                case "vertical":
                                    this.#lrbg.RadioButtonGroup.orientation(Orientation.VERTICAL);
                                    break;
                                case "horizontal":
                                    this.#lrbg.RadioButtonGroup.orientation(Orientation.HORIZONTAL);
                                    break;
                                default:
                                    break;
                            }
                        }),
                    // $.labeledContainer("Inner radio button group").append(
                    ...labeledComponentLabelFlags([this.#lrbg.RadioButtonGroup], true, "end", "start"),
                    $.labeledCheckbox("Allow toggling the state")
                        .on("checked", () => this.#lrbg.toggle(!this.#lrbg.Toggle)),
                ),
            this.markdown(example),
        );
    }
}

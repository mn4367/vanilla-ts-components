import { Orientation } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component that groups multiple §@components/LabeledRadioButton§s into a single component. It
presents a set of mutually exclusive choices and ensures that only one radio button is selected at
a time.

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
                    ...labeledComponentLabelFlags([this.#rbg], true, "end", "start"),
                    $.labeledCheckbox("Horizontal alignment")
                        .on("checked", (ev) => this.#rbg.orientation(ev.$.Checked ? Orientation.HORIZONTAL : Orientation.VERTICAL)),
                    $.labeledCheckbox("Allow toggling the state")
                        .on("checked", () => this.#rbg.toggle(!this.#rbg.Toggle)),
                ),
            this.markdown(example),
        );
    }
}

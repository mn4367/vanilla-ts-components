import { Div } from "@vanilla-ts/dom";
import { LabeledCheckbox } from "../../../../src/LabeledCheckbox.js";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const introLabeledCheckbox = `
A component with a §@dom/Checkbox / Switch§ and a §@dom/Label§ representing a caption for the
component.

**Class:** \`@vanilla-ts/components/LabeledCheckbox\`
`;

const exampleLabeledCheckbox = `
### Code example (labeled checkbox)

\`\`\`
import { LabeledCheckbox } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledCheckbox("Use classic design")
    .addClass("labeled-checkbox")
    .checked(true);
    //.checked(false);
    //.indeterminate(true);

new VTS_App(document.body).append(example);
\`\`\`

For easier handling, the labeled checkbox component emits its own event \`CheckedEvent\`; see the
corresponding documentation in the \`LabeledCheckbox\` class.
`;

const introLabeledSwitch = `
## Labeled switch

The labeled checkbox is also available with a 'switch' design. This is achieved by simply adding the
class \`switch\` to the \`Checkbox\` property available on the \`LabeledCheckbox\` instance.`;

const exampleLabeledSwitch = `
### Code example (labeled switch)

\`\`\`
import { LabeledCheckbox } from "@vanilla-ts/components";

const lcb1 = new LabeledCheckbox("Use modern design")
    .addClass("labeled-checkbox")
    .checked(true);
lcb1.Checkbox.addClass("switch");

// or (doesn't interrupt chaining calls to other functions of the component)

const lcb2 = new LabeledCheckbox("Use modern design")
    .addClass("labeled-checkbox")
    .checkbox(cb => cb.addClass("switch"))
    .checked(true);
\`\`\`
`;

const exampleComponentFactory = `
### Component factory

Using a component factory makes it easier to create labeled checkbox and labeled switch components.

\`\`\`
import {
    CSSClassNameFactory,
    LabeledCheckboxFactory,
    mixinComponentFactories
} from "@vanilla-ts/components";

const cf = new (mixinComponentFactories(
    CSSClassNameFactory,
    LabeledCheckboxFactory,
    // more factories can be added here
    // ...
))();


// Regular labeled checkbox
const cb = cf.labeledCheckbox("Use classic design");
// Labeled switch (automatically adds the \`switch\` class to the \`Checkbox\` property of the
// created LabeledCheckbox instance)
const sw = cf.labeledSwitch("Use modern design");
\`\`\`

For an advanced usage of component factories see §@core/Component factories§.
`;


export class LabeledCheckboxEx extends BaseExample {
    #lcb: LabeledCheckbox;
    #rbgCb: RadioButtonGroup;
    #lswitch: LabeledCheckbox;
    #rbgSwitch: RadioButtonGroup;

    constructor() {
        super("LabeledCheckbox / -Switch");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(introLabeledCheckbox),
            this.example([
                this.#lcb = $.labeledCheckbox("Use classic design")
                    .checked(true)
                    .on("checked", () => this.#rbgCb.value(this.#lcb.Checked ? "checked" : "unchecked"))
            ]),
            this.markdown("### Label position, label alignment and checkbox states"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lcb], true, "end", "start"),
                    this.#rbgCb = $.radioButtonGroup([
                        { Label: "Checked", Value: "checked" },
                        { Label: "Unchecked", Value: "unchecked" },
                        { Label: "Indeterminate", Value: "indeterminate" }
                    ], "rbg-labeled-checkbox-ex")
                        .value("checked")
                        .on("checked", (ev) => {
                            switch (ev.$.Sender.Value) {
                                case "checked":
                                    this.#lcb.checked(true);
                                    break;
                                case "unchecked":
                                    this.#lcb.checked(false);
                                    break;
                                case "indeterminate":
                                    this.#lcb.indeterminate(true);
                                    break;
                                default:
                                    break;
                            }
                        }),
                ),
            this.markdown(exampleLabeledCheckbox),
            this.markdown("---"),
            this.markdown(introLabeledSwitch),
            this.example([
                this.#lswitch = $.labeledSwitch("Use modern design")
                    .checked(true)
                    .on("checked", () => this.#rbgSwitch.value(this.#lswitch.Checked ? "checked" : "unchecked"))
            ]),
            this.markdown("### Label position, label alignment and switch states"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lswitch], true, "end", "start"),
                    this.#rbgSwitch = $.radioButtonGroup([
                        { Label: "Checked", Value: "checked" },
                        { Label: "Unchecked", Value: "unchecked" },
                        { Label: "Indeterminate", Value: "indeterminate" }
                    ], "rbg-labeled-switch-ex-s")
                        .value("checked")
                        .on("checked", (ev) => {
                            switch (ev.$.Sender.Value) {
                                case "checked":
                                    this.#lswitch.checked(true);
                                    break;
                                case "unchecked":
                                    this.#lswitch.checked(false);
                                    break;
                                case "indeterminate":
                                    this.#lswitch.indeterminate(true);
                                    break;
                                default:
                                    break;
                            }
                        }),
                ),
            this.markdown(exampleLabeledSwitch),
            this.markdown("---"),
            this.markdown(exampleComponentFactory),
        );
    }
}

import { Checkbox, Div } from "@vanilla-ts/dom";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const introCheckbox = `
A component that encapsulates the native DOM checkbox
(%\`<input type="checkbox">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox%).
This component is also available as a §@components/LabeledCheckbox / -Switch§.

**Class:** \`@vanilla-ts/dom/Checkbox\`
`;

const exampleCheckbox = `
### Code example (checkbox)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";

const cb1 = new Checkbox().checked(true);
const cb2 = new Checkbox().checked(false);
const cb3 = new Checkbox().indeterminate(true);

new VTS_App(document.body).append(cb1, cb2, cb3);
\`\`\`

For easier handling, the checkbox component emits its own event \`CheckedEvent\`; see the
corresponding documentation in the \`Checkbox\` class.
`;

const introSwitch = `
## Switch

The checkbox is also available with a 'switch' design. This is achieved by simply adding the class
\`switch\` to the checkbox instance:
`;

const exampleSwitch = `
### Code example (switch)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";

const cb1 = new Checkbox().checked(true).addClass("switch");
const cb2 = new Checkbox().checked(false).addClass("switch");
const cb3 = new Checkbox().indeterminate(true).addClass("switch");

new VTS_App(document.body).append(cb1, cb2, cb3);
\`\`\`
`;

const exampleComponentFactory = `
### Component factory

Using a component factory makes it easier to create checkbox and switch components.

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { CheckboxFactory } from "@vanilla-ts/dom";

const cbf = new CheckboxFactory();

// Regular checkbox
const cb = cbf.checkbox();
// Switch (automatically adds the \`switch\` class)
const sw = cbf.switch();

new VTS_App(document.body).append(cb, sw);
\`\`\`

For an advanced usage of component factories see §@core/Component factories§.
`;


export class CheckboxEx extends BaseExample {
    #cb: Checkbox;
    #rbgCb: RadioButtonGroup;
    #switch: Checkbox;
    #rbgSwitch: RadioButtonGroup;

    constructor() {
        super("Checkbox");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(introCheckbox),
            this.example(
                [this.#cb = new Checkbox()
                    .checked(true)
                    .on("checked", () => this.#rbgCb.value(this.#cb.Checked ? "checked" : "unchecked"))]
            ),
            this.markdown("### States"),
            new Div().addClass("example-properties")
                .append(
                    this.#rbgCb = $.radioButtonGroup([
                        { Label: "Checked", Value: "checked" },
                        { Label: "Unchecked", Value: "unchecked" },
                        { Label: "Indeterminate", Value: "indeterminate" }
                    ], "rbg-checkbox-ex")
                        .value("checked")
                        .on("checked", (ev) => {
                            switch (ev.$.Sender.Value) {
                                case "checked":
                                    this.#cb.checked(true);
                                    break;
                                case "unchecked":
                                    this.#cb.checked(false);
                                    break;
                                case "indeterminate":
                                    this.#cb.indeterminate(true);
                                    break;
                                default:
                                    break;
                            }
                        })
                ),

            this.markdown(exampleCheckbox),
            this.markdown("---"),
            this.markdown(introSwitch),
            this.example([
                this.#switch = new Checkbox()
                    .addClass("switch")
                    .checked(true)
                    .on("checked", () => this.#rbgSwitch.value(this.#switch.Checked ? "checked" : "unchecked"))
            ]),
            this.markdown("### States"),
            new Div().addClass("example-properties")
                .append(
                    this.#rbgSwitch = $.radioButtonGroup([
                        { Label: "Checked", Value: "checked" },
                        { Label: "Unchecked", Value: "unchecked" },
                        { Label: "Indeterminate", Value: "indeterminate" }
                    ], "rbg-switch-ex-s")
                        .value("checked")
                        .on("checked", (ev) => {
                            switch (ev.$.Sender.Value) {
                                case "checked":
                                    this.#switch.checked(true);
                                    break;
                                case "unchecked":
                                    this.#switch.checked(false);
                                    break;
                                case "indeterminate":
                                    this.#switch.indeterminate(true);
                                    break;
                                default:
                                    break;
                            }
                        })
                ),
            this.markdown(exampleSwitch),
            this.markdown("---"),
            this.markdown(exampleComponentFactory)
        );
    }
}

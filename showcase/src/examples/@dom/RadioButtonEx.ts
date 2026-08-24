import { Div, RadioButton } from "@vanilla-ts/dom";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native radio button DOM element
(%\`<input type="radio">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio%).
This component is also available as a §@components/LabeledRadioButton§.

**Class:** \`@vanilla-ts/dom/RadioButton\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { RadioButton } from "@vanilla-ts/dom";

const example = new RadioButton();

new VTS_App(document.body).append(example);
// The following code line would allow toggling the checked state. Toggling can be
// done by clicking or by pressing the space or enter key on a focused radio button.
// example.toggle(true);
\`\`\`

For easier handling, the radio button component emits its own event \`CheckedEvent\`; see the
corresponding documentation in the \`RadioButton\` class.
`;


export class RadioButtonEx extends BaseExample {
    #rb: RadioButton;
    #rbgCb: RadioButtonGroup;

    constructor() {
        super("RadioButton");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([this.#rb = new RadioButton().on("checked", () => this.#rbgCb.value(this.#rb.Checked ? "checked" : "unchecked"))]),
            this.markdown("### Radio button states"),
            new Div().addClass("example-properties")
                .append(
                    this.#rbgCb = $.radioButtonGroup([
                        { Label: "Checked", Value: "checked" },
                        { Label: "Unchecked", Value: "unchecked" },
                    ], "rbg-labeled-radio-button-ex")
                        .value("unchecked")
                        .on("checked", (ev) => {
                            switch (ev.$.Sender.Value) {
                                case "checked":
                                    this.#rb.checked(true);
                                    break;
                                case "unchecked":
                                    this.#rb.checked(false);
                                    break;
                                default:
                                    break;
                            }
                        }),
                    $.labeledCheckbox("Allow toggling the state")
                        .on("checked", () => this.#rb.toggle(!this.#rb.Toggle)),
                ),
            this.markdown(example),
        );
    }
}

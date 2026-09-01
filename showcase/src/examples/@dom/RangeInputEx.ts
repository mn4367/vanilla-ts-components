import { Orientation } from "@vanilla-ts/core";
import { Code, P, RangeInput } from "@vanilla-ts/dom";
import { LabeledNumberInput } from "../../../../src/LabeledNumberInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native DOM input range element
(%\`<input type="range">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range%).
This component is also available as a §@components/LabeledRangeInput§.

**Class:** \`@vanilla-ts/dom/RangeInput\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { RangeInput } from "@vanilla-ts/dom";

const example = new RangeInput()
    .max("100")
    .min("0")
    .step("0.1")
    .valueAsNumber(42);

new VTS_App(document.body).append(example);
\`\`\`
`;


export class RangeInputEx extends BaseExample {
    constructor() {
        super("RangeInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let rangeInput: RangeInput;
        let maxInput: LabeledNumberInput;
        let minInput: LabeledNumberInput;
        let val: Code;

        this.append(
            this.markdown(intro),
            this.example([
                rangeInput = new RangeInput()
                    .max("100")
                    .min("0")
                    .step("0.1")
                    .valueAsNumber(42)
                    .on("input", () => val.text(rangeInput.Value))
            ]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical orientation", undefined, "orientation")
                    .on("checked", (ev) => {
                        rangeInput.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL);
                    }),
                maxInput = $.labeledNumberInput("Maximum value:", undefined, "100", "", "1", "100")
                    .numberInput((ni) => ni.on("input", () => {
                        rangeInput.max(ni.Value);
                        minInput.Component.max(ni.Value);
                        val.text(rangeInput.Value);
                    })),
                minInput = $.labeledNumberInput("Minimum value:", undefined, "0", "", "0", "100")
                    .numberInput((ni) => ni.on("input", () => {
                        rangeInput.min(ni.Value);
                        maxInput.Component.min(ni.Value);
                        val.text(rangeInput.Value);
                    })),
                new P("Current value: ", val = new Code("42"))
                    .style({
                        marginBlock: "0.5rem 0"
                    }),
            ),
            this.markdown(example)
        );
    }
}

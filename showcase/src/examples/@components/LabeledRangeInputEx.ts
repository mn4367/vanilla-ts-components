import { Orientation } from "@vanilla-ts/core";
import { Code, Div, P } from "@vanilla-ts/dom";
import { LabeledNumberInput } from "../../../../src/LabeledNumberInput.js";
import { LabeledRangeInput } from "../../../../src/LabeledRangeInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/RangeInput§ and a §@dom/Label§ representing a caption for the component.
The label is automatically associated with the range input through its \`for\` and \`id\`
attributes. It lets users select an approximate numeric value from a bounded range using a slider.

**Class:** \`@vanilla-ts/components/LabeledRangeInput\`
`;

const example = `
### Code example

\`\`\`
import { LabeledRangeInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Code, P } from "@vanilla-ts/dom";

const value = new Code("42");
const example = new LabeledRangeInput(
    "Volume",
    undefined, // id (auto-generated if not provided)
    "42",      // value (initial value)
    "volume",  // name (form name)
    "0",       // minimum value
    "100",     // maximum value
    "0.1"      // step interval
)
    .addClass("labeled-range-input")
    .rangeInput(rangeInput => rangeInput
        .style("inlineSize", "15rem")
        .on("input", () => value.text(example.Value))
    );

new VTS_App(document.body).append(
    example,
    new P("Current value: ", value)
        .style({
            marginBlock: "0.5rem 0",
            width: "10rem"
        })
);
\`\`\`
`;


export class LabeledRangeInputEx extends BaseExample {
    #lRangeInput: LabeledRangeInput;

    constructor() {
        super("LabeledRangeInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let maxInput: LabeledNumberInput;
        let minInput: LabeledNumberInput;
        let value: Code;

        this.#lRangeInput = $.labeledRangeInput(
            "Volume",
            undefined, // id (auto-generated if not provided)
            "42",      // value (initial value)
            "volume",  // name (form name)
            "0",       // minimum value
            "100",     // maximum value
            "0.1"      // step interval
        )
            .rangeInput(rangeInput => rangeInput
                .style("inlineSize", "15rem")
                .on("input", () => value.text(rangeInput.Value))
            );
        this.append(
            this.markdown(intro),
            this.example([
                this.#lRangeInput,
                new P("Current value: ", value = new Code(this.#lRangeInput.Value))
                    .style({
                        marginBlock: "0.5rem 0",
                        width: "10rem"
                    })
            ]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical orientation", undefined, "orientation")
                    .on("checked", event => {
                        this.#lRangeInput.rangeInput(rangeInput => rangeInput.orientation(
                            event.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL
                        ));
                    }),
                maxInput = $.labeledNumberInput("Maximum value:", undefined, "100", "", "1", "100")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lRangeInput.RangeInput.max(numberInput.Value);
                        minInput.NumberInput.max(numberInput.Value);
                        value.text(this.#lRangeInput.Value);
                    })),
                minInput = $.labeledNumberInput("Minimum value:", undefined, "0", "", "0", "100")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lRangeInput.RangeInput.min(numberInput.Value);
                        maxInput.NumberInput.min(numberInput.Value);
                        value.text(this.#lRangeInput.Value);
                    }))
            ),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lRangeInput], true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}

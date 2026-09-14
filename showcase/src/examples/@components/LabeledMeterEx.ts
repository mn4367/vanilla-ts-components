import { Orientation } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { LabeledMeter } from "../../../../src/LabeledMeter.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/Meter§ and a §@dom/Span§ representing a caption for the component. It
represents a scalar value within a known range. Use a §@dom/Progress§ component instead to represent
the progress of a task.

**Class:** \`@vanilla-ts/components/LabeledMeter\`
`;

const example = `
### Code example

\`\`\`
import { LabelPosition, LabeledMeter } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledMeter(
    "Available Storage",
    100,             // Maximum value
    68,              // Current value
    0,               // Minimum value
    30,              // Upper boundary of the low range
    70,              // Lower boundary of the high range
    80,              // Optimum value
    "68 out of 100"  // Fallback content
)
    .addClass("labeled-meter")
    .meter(meter => meter.style("inlineSize", "15rem"));

new VTS_App(document.body).append(example);
\`\`\`
`;


export class LabeledMeterEx extends BaseExample {
    #lMeter: LabeledMeter;

    constructor() {
        super("LabeledMeter");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lMeter = $.labeledMeter(
            "Available Storage",
            100,             // Maximum value
            68,              // Current value
            0,               // Minimum value
            30,              // Upper boundary of the low range
            70,              // Lower boundary of the high range
            80,              // Optimum value
            "68 out of 100"  // Fallback content
        )
            .meter(meter => meter.style("inlineSize", "15rem"));
        this.append(
            this.markdown(intro),
            this.example([this.#lMeter]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical orientation", undefined, "orientation")
                    .on("checked", (ev) => {
                        this.#lMeter.meter(cb => cb.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL));
                    }),
                $.labeledNumberInput("Current value:", undefined, this.#lMeter.Value.toString(), "", "0", "100")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lMeter.value(numberInput.ValueAsNumber);
                    })),
            ),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lMeter], true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}

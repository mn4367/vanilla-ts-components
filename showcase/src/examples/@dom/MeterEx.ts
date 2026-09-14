import { Orientation } from "@vanilla-ts/core";
import { Meter } from "@vanilla-ts/dom";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<meter>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter%.
It represents a scalar value within a known range. The \`min\` and \`max\` values define the range,
\`low\` and \`high\` divide it into regions and \`optimum\` indicates the preferred region. Use a
§@dom/Progress§ component instead to represent the progress of a task. This component is also
available as a §@components/LabeledMeter§.

**Class:** \`@vanilla-ts/dom/Meter\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Meter } from "@vanilla-ts/dom";

const example = new Meter(
    100,             // Maximum value
    68,              // Current value
    0,               // Minimum value
    30,              // Upper boundary of the low range
    70,              // Lower boundary of the high range
    80,              // Optimum value
    "68 out of 100"  // Fallback content
)
    .style("inlineSize", "15rem");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class MeterEx extends BaseExample {
    constructor() {
        super("Meter");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const meter = new Meter(100, 68, 0, 30, 70, 80, "68 out of 100").style("inlineSize", "15rem");
        this.append(
            this.markdown(intro),
            this.example([
                meter
            ]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical orientation", undefined, "orientation")
                    .on("checked", (ev) => {
                        meter.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL);
                    }),
                $.labeledNumberInput("Current value:", undefined, meter.Value.toString(), "", "0", "100")
                    .numberInput((numberInput) => numberInput.on("input", () => {
                        meter.value(numberInput.ValueAsNumber);
                    }))
            ),
            this.markdown(example),
        );
    }
}

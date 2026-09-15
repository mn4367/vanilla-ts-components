import { Orientation } from "@vanilla-ts/core";
import { Code, P, Progress } from "@vanilla-ts/dom";
import { LabeledNumberInput } from "../../../../src/LabeledNumberInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<progress>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress%.
It represents the completion progress of a task, either with a known value or as an indeterminate
operation. Use a §@dom/Meter§ component instead to represent a scalar value within a known range.
This component is also available as a §@components/LabeledProgress§.

**Class:** \`@vanilla-ts/dom/Progress\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Progress } from "@vanilla-ts/dom";

// Set \`value\` after setting \`max\`, otherwise it may have
// no effect if \`value\` is greater than the current \`max\`.
const example = new Progress()
    .max(100)
    .value(70)
    .style("inlineSize", "15rem");

// Initializes the component with an 'indeterminate' state;
// this sets the value of the progress component to zero (\`0\`).
// const example = new Progress().indeterminate(true);

new VTS_App(document.body).append(example);
\`\`\`

For easier handling, the progress component emits its own event \`ProgressValueEvent\`; see the
corresponding documentation in the \`Progress\` class.
`;


export class ProgressEx extends BaseExample {
    constructor() {
        super("Progress");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let progress: Progress;
        let valueInput: LabeledNumberInput;

        this.append(
            this.markdown(intro),
            this.example([
                progress = new Progress().max(100).value(70).style("inlineSize", "15rem")
            ]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical orientation", undefined, "orientation")
                    .on("checked", (ev) => {
                        progress.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL);
                    }),
                $.labeledNumberInput("Maximum value:", undefined, "100", "", "1", "100")
                    .numberInput((ni) => ni.on("input", () => {
                        progress.max(ni.ValueAsNumber);
                        valueInput.NumberInput.max(ni.Value);
                    })),
                valueInput = $.labeledNumberInput("Current value:", undefined, progress.Value.toString(), "", "0", "100")
                    .numberInput((ni) => ni.on("input", () => {
                        progress.value(ni.ValueAsNumber === 0 ? undefined : ni.ValueAsNumber);
                    })),
                new P("Note: a current value of ", new Code("0"), " will set the progress component to an 'indeterminate' state.")
                    .style({
                        marginBlock: "0.5rem 0"
                    }),
            ),
            this.markdown(example),
        );
    }
}
